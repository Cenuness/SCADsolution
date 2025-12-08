import React, { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useDisconnect,
  WagmiConfig,
} from "wagmi";
import { contractAddress as CONTRACT_ADDRESS, contractABI as CONTRACT_ABI } from "./config";
import { wagmiConfig } from "./wagmi";

const scadContract = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
};

function SCADDapp() {
  const { address, status: acctStatus } = useAccount();
  const { data: balanceData } = useBalance({ address, watch: true });
  const { disconnect } = useDisconnect();
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState("meuCadastro");
  
  // Estados para formulários
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [consentAddress, setConsentAddress] = useState("");
  const [consentStatus, setConsentStatus] = useState(true);
  const [consultAddress, setConsultAddress] = useState("");

  // Dados do cadastro atual
  const [meuCadastro, setMeuCadastro] = useState(null);
  const [cadastroConsultado, setCadastroConsultado] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // --- READ: Verificar se a carteira está registrada ---
  const { refetch: refetchRegistered } = useContractRead({
    ...scadContract,
    functionName: "carteiraRegistrada",
    args: [address],
    enabled: !!address,
    onSuccess: (data) => {
      setIsRegistered(data);
      if (!data) {
        setMeuCadastro(null);
      }
    },
  });

  // --- READ: Ver meu cadastro ---
  const { refetch: refetchMeuCadastro } = useContractRead({
    ...scadContract,
    functionName: "verMeuCadastro",
    enabled: !!address && isRegistered,
    onSuccess: (data) => {
      if (data && data[0] !== "") {
        setMeuCadastro({
          identificador: data[0],
          isCompany: data[1]
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao buscar cadastro:", error);
      setMeuCadastro(null);
    }
  });

  // --- WRITE: Registrar usuário (CPF) ---
  const { config: configRegistrarUsuario } = usePrepareContractWrite({
    ...scadContract,
    functionName: "registrarUsuario",
    args: [cpf],
    enabled: cpf.length === 11,
  });

  const { write: writeRegistrarUsuario, data: dataUsuario } = useContractWrite(configRegistrarUsuario);

  useWaitForTransaction({
    hash: dataUsuario?.hash,
    onSuccess: () => {
      setStatusMsg("✅ Usuário registrado com sucesso!");
      setCpf("");
      refetchRegistered();
      refetchMeuCadastro();
    },
    onError: (error) => {
      setStatusMsg(`❌ Erro: ${error.message}`);
    },
  });

  // --- WRITE: Registrar empresa (CNPJ) ---
  const { config: configRegistrarEmpresa } = usePrepareContractWrite({
    ...scadContract,
    functionName: "registrarEmpresa",
    args: [cnpj],
    enabled: cnpj.length === 14,
  });

  const { write: writeRegistrarEmpresa, data: dataEmpresa } = useContractWrite(configRegistrarEmpresa);

  useWaitForTransaction({
    hash: dataEmpresa?.hash,
    onSuccess: () => {
      setStatusMsg("✅ Empresa registrada com sucesso!");
      setCnpj("");
      refetchRegistered();
      refetchMeuCadastro();
    },
    onError: (error) => {
      setStatusMsg(`❌ Erro: ${error.message}`);
    },
  });

  // --- WRITE: Dar consentimento ---
  const { config: configDarConsentimento } = usePrepareContractWrite({
    ...scadContract,
    functionName: "darConsentimento",
    args: [consentAddress, consentStatus],
    enabled: consentAddress !== "" && consentAddress !== address,
  });

  const { write: writeDarConsentimento, data: dataConsentimento } = useContractWrite(configDarConsentimento);

  useWaitForTransaction({
    hash: dataConsentimento?.hash,
    onSuccess: () => {
      setStatusMsg(`✅ Consentimento ${consentStatus ? 'concedido' : 'revogado'} com sucesso!`);
      setConsentAddress("");
    },
    onError: (error) => {
      setStatusMsg(`❌ Erro: ${error.message}`);
    },
  });

  // --- READ: Consultar cadastro de outro usuário ---
  const consultarCadastro = async () => {
    if (!consultAddress || !address) return;
    
    try {
      // Primeiro verifica se tem consentimento
      const temConsentimento = await refetchPossuiConsentimento();
      
      if (!temConsentimento.data && consultAddress !== address) {
        setStatusMsg("❌ Você não tem permissão para ver este cadastro");
        setCadastroConsultado(null);
        return;
      }

      // Busca o cadastro
      const response = await refetchCadastroDe();
      if (response.data && response.data[0] !== "") {
        setCadastroConsultado({
          identificador: response.data[0],
          isCompany: response.data[1],
          endereco: consultAddress
        });
        setStatusMsg("✅ Cadastro encontrado!");
      } else {
        setCadastroConsultado(null);
        setStatusMsg("❌ Endereço não cadastrado");
      }
    } catch (error) {
      setStatusMsg(`❌ Erro: ${error.message}`);
      setCadastroConsultado(null);
    }
  };

  const { refetch: refetchCadastroDe } = useContractRead({
    ...scadContract,
    functionName: "verCadastroDe",
    args: [consultAddress],
    enabled: false, // Chamaremos manualmente
  });

  const { refetch: refetchPossuiConsentimento } = useContractRead({
    ...scadContract,
    functionName: "possuiConsentimento",
    args: [consultAddress, address],
    enabled: false, // Chamaremos manualmente
  });

  useEffect(() => {
    if (address && acctStatus === "connected") {
      refetchRegistered();
      if (isRegistered) {
        refetchMeuCadastro();
      }
    }
  }, [address, acctStatus, isRegistered]);

  const formatarIdentificador = (identificador, isCompany) => {
    if (!identificador) return "";
    
    if (isCompany) {
      // Formatar CNPJ: XX.XXX.XXX/XXXX-XX
      return identificador.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    } else {
      // Formatar CPF: XXX.XXX.XXX-XX
      return identificador.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        "$1.$2.$3-$4"
      );
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: 10 }}>
        SCAD - Sistema de Cadastro Descentralizado
      </h1>
      
      {acctStatus !== "connected" ? (
        <ConnectWallet />
      ) : (
        <>
          {/* Cabeçalho com informações da carteira */}
          <div style={{ 
            marginBottom: 20, 
            padding: 15, 
            backgroundColor: '#ecf0f1', 
            borderRadius: 8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '5px 0' }}>
                  <strong>Carteira:</strong> 
                  <span style={{ 
                    display: 'inline-block',
                    marginLeft: 10,
                    padding: '2px 8px',
                    backgroundColor: '#2ecc71',
                    color: 'white',
                    borderRadius: 4,
                    fontSize: '0.9em'
                  }}>
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Saldo:</strong> {balanceData?.formatted} {balanceData?.symbol}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Status:</strong> 
                  <span style={{ 
                    color: isRegistered ? '#27ae60' : '#e74c3c',
                    fontWeight: 'bold',
                    marginLeft: 10
                  }}>
                    {isRegistered ? 'Cadastrado' : 'Não cadastrado'}
                  </span>
                </p>
              </div>
              <button 
                onClick={disconnect} 
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Desconectar
              </button>
            </div>
          </div>

          {/* Abas de navegação */}
          <div style={{ marginBottom: 20, display: 'flex', borderBottom: '1px solid #ddd' }}>
            {['meuCadastro', 'registrar', 'consentimento', 'consultar'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: activeTab === tab ? '#3498db' : 'transparent',
                  color: activeTab === tab ? 'white' : '#34495e',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  marginRight: 5
                }}
              >
                {tab === 'meuCadastro' && 'Meu Cadastro'}
                {tab === 'registrar' && 'Registrar'}
                {tab === 'consentimento' && 'Consentimento'}
                {tab === 'consultar' && 'Consultar'}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas */}
          <div style={{ minHeight: 300 }}>
            {/* ABA: Meu Cadastro */}
            {activeTab === 'meuCadastro' && (
              <div>
                <h2>📋 Meu Cadastro</h2>
                {meuCadastro ? (
                  <div style={{ 
                    padding: 20, 
                    backgroundColor: '#d5f4e6',
                    borderRadius: 8,
                    border: '1px solid #2ecc71'
                  }}>
                    <p><strong>Identificador:</strong> {formatarIdentificador(meuCadastro.identificador, meuCadastro.isCompany)}</p>
                    <p><strong>Tipo:</strong> {meuCadastro.isCompany ? 'Empresa (CNPJ)' : 'Pessoa Física (CPF)'}</p>
                    <p><strong>Endereço Blockchain:</strong> {address}</p>
                  </div>
                ) : isRegistered ? (
                  <p>Carregando informações do cadastro...</p>
                ) : (
                  <div style={{ 
                    padding: 20, 
                    backgroundColor: '#ffeaa7',
                    borderRadius: 8,
                    border: '1px solid #fdcb6e'
                  }}>
                    <p>⚠️ Você ainda não está cadastrado.</p>
                    <p>Vá para a aba "Registrar" para criar seu cadastro.</p>
                  </div>
                )}
              </div>
            )}

            {/* ABA: Registrar */}
            {activeTab === 'registrar' && (
              <div>
                <h2>📝 Registrar Cadastro</h2>
                {isRegistered ? (
                  <div style={{ 
                    padding: 20, 
                    backgroundColor: '#ffeaa7',
                    borderRadius: 8 
                  }}>
                    <p>✅ Você já está cadastrado!</p>
                    <p>Para ver seus dados, vá para a aba "Meu Cadastro".</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 30 }}>
                      <h3>Pessoa Física (CPF)</h3>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Digite seu CPF (apenas números)"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                          style={{
                            padding: 10,
                            flex: 1,
                            borderRadius: 4,
                            border: '1px solid #ddd'
                          }}
                          maxLength={11}
                        />
                        <button
                          onClick={() => {
                            if (cpf.length !== 11) {
                              setStatusMsg("❌ CPF deve ter 11 dígitos");
                              return;
                            }
                            setStatusMsg("Enviando transação...");
                            writeRegistrarUsuario?.();
                          }}
                          disabled={!writeRegistrarUsuario || cpf.length !== 11}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: cpf.length === 11 ? '#2ecc71' : '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: cpf.length === 11 ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold'
                          }}
                        >
                          Registrar Pessoa
                        </button>
                      </div>
                      {cpf && cpf.length === 11 && (
                        <p style={{ marginTop: 5, fontSize: '0.9em', color: '#7f8c8d' }}>
                          CPF formatado: {formatarIdentificador(cpf, false)}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3>Empresa (CNPJ)</h3>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Digite seu CNPJ (apenas números)"
                          value={cnpj}
                          onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                          style={{
                            padding: 10,
                            flex: 1,
                            borderRadius: 4,
                            border: '1px solid #ddd'
                          }}
                          maxLength={14}
                        />
                        <button
                          onClick={() => {
                            if (cnpj.length !== 14) {
                              setStatusMsg("❌ CNPJ deve ter 14 dígitos");
                              return;
                            }
                            setStatusMsg("Enviando transação...");
                            writeRegistrarEmpresa?.();
                          }}
                          disabled={!writeRegistrarEmpresa || cnpj.length !== 14}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: cnpj.length === 14 ? '#3498db' : '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: cnpj.length === 14 ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold'
                          }}
                        >
                          Registrar Empresa
                        </button>
                      </div>
                      {cnpj && cnpj.length === 14 && (
                        <p style={{ marginTop: 5, fontSize: '0.9em', color: '#7f8c8d' }}>
                          CNPJ formatado: {formatarIdentificador(cnpj, true)}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ABA: Consentimento */}
            {activeTab === 'consentimento' && (
              <div>
                <h2>🔐 Gerenciar Consentimentos</h2>
                {!isRegistered ? (
                  <div style={{ 
                    padding: 20, 
                    backgroundColor: '#ffeaa7',
                    borderRadius: 8 
                  }}>
                    <p>⚠️ Você precisa estar cadastrado para gerenciar consentimentos.</p>
                    <p>Vá para a aba "Registrar" para criar seu cadastro primeiro.</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: 20 }}>
                      Aqui você pode conceder ou revogar permissão para que outras carteiras visualizem seus dados.
                    </p>
                    
                    <div style={{ 
                      padding: 20, 
                      backgroundColor: '#f8f9fa',
                      borderRadius: 8,
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                          Endereço da Carteira a Autorizar/Revogar:
                        </label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={consentAddress}
                          onChange={(e) => setConsentAddress(e.target.value)}
                          style={{
                            padding: 10,
                            width: '100%',
                            borderRadius: 4,
                            border: '1px solid #ddd',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>
                          Permissão:
                        </label>
                        <div style={{ display: 'flex', gap: 20 }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              checked={consentStatus === true}
                              onChange={() => setConsentStatus(true)}
                              style={{ marginRight: 8 }}
                            />
                            <span>✅ Conceder Acesso</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              checked={consentStatus === false}
                              onChange={() => setConsentStatus(false)}
                              style={{ marginRight: 8 }}
                            />
                            <span>❌ Revogar Acesso</span>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!consentAddress) {
                            setStatusMsg("❌ Digite um endereço válido");
                            return;
                          }
                          if (consentAddress === address) {
                            setStatusMsg("❌ Você não pode dar consentimento para si mesmo");
                            return;
                          }
                          setStatusMsg("Enviando transação...");
                          writeDarConsentimento?.();
                        }}
                        disabled={!writeDarConsentimento || !consentAddress}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: consentStatus ? '#2ecc71' : '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: writeDarConsentimento ? 'pointer' : 'not-allowed',
                          fontWeight: 'bold',
                          width: '100%'
                        }}
                      >
                        {consentStatus ? 'Conceder Permissão' : 'Revogar Permissão'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA: Consultar */}
            {activeTab === 'consultar' && (
              <div>
                <h2>🔍 Consultar Cadastro</h2>
                <div style={{ 
                  padding: 20, 
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                      Endereço da Carteira para Consultar:
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={consultAddress}
                      onChange={(e) => setConsultAddress(e.target.value)}
                      style={{
                        padding: 10,
                        width: '100%',
                        borderRadius: 4,
                        border: '1px solid #ddd',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <button
                    onClick={consultarCadastro}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginBottom: 20,
                      width: '100%'
                    }}
                  >
                    Consultar Cadastro
                  </button>

                  {cadastroConsultado && (
                    <div style={{ 
                      padding: 20, 
                      backgroundColor: '#d5f4e6',
                      borderRadius: 8,
                      border: '1px solid #2ecc71',
                      marginTop: 20
                    }}>
                      <h3>✅ Cadastro Encontrado</h3>
                      <p><strong>Endereço:</strong> {cadastroConsultado.endereco}</p>
                      <p><strong>Identificador:</strong> {formatarIdentificador(cadastroConsultado.identificador, cadastroConsultado.isCompany)}</p>
                      <p><strong>Tipo:</strong> {cadastroConsultado.isCompany ? 'Empresa (CNPJ)' : 'Pessoa Física (CPF)'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mensagem de status */}
          {statusMsg && (
            <div style={{
              marginTop: 20,
              padding: 15,
              backgroundColor: statusMsg.includes('✅') ? '#d5f4e6' : 
                              statusMsg.includes('❌') ? '#ffeaa7' : '#e3f2fd',
              borderRadius: 8,
              border: `1px solid ${
                statusMsg.includes('✅') ? '#2ecc71' : 
                statusMsg.includes('❌') ? '#fdcb6e' : '#3498db'
              }`,
              color: statusMsg.includes('❌') ? '#c0392b' : '#2c3e50'
            }}>
              {statusMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Wallet Connect Component (mantido igual) ---
function ConnectWallet() {
  const { connect, connectors, error } = useConnect();

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h2>🔗 Conectar Carteira</h2>
      <p style={{ marginBottom: 30, color: '#7f8c8d' }}>
        Conecte sua carteira para acessar o sistema SCAD
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            style={{
              padding: '15px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Conectar com {connector.name}
          </button>
        ))}
      </div>
      {error && (
        <div style={{ 
          marginTop: 20, 
          color: '#e74c3c',
          padding: 15,
          backgroundColor: '#ffeaa7',
          borderRadius: 8,
          border: '1px solid #fdcb6e'
        }}>
          <strong>Erro:</strong> {error.message}
        </div>
      )}
    </div>
  );
}

export default function SCADDappWithWagmiProvider() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SCADDapp />
    </WagmiConfig>
  );
}