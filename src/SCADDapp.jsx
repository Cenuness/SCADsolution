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

// Paleta Dark Academia com fundos claros e letras escuras
const COLORS = {
  // Fundos claros (da paleta original, mas mais claros)
  antiqueIvory: "#EDE0DC", // Fundo principal
  fadedIvory: "#F5EDE9", // Fundo secundário
  lightTaupe: "#D8C9C5", // Bordas e detalhes
  
  // Letras escuras
  charcoalSlate: "#2C2E30", // Texto principal
  darkSlate: "#1C1E20", // Texto forte
  oxfordBrown: "#4B3B2A", // Texto secundário
  
  // Cores de destaque (mais escuras para contraste)
  burntUmber: "#8A4B2A", // Destaque principal
  deepChestnut: "#8B2C1F", // Destaque secundário
  forestMoss: "#3B3F2F", // Sucesso
  vintageMaroon: "#6B2E2F", // Aviso
  
  // Cores neutras
  mutedOlive: "#85614B", // Neutro
  dustyTaupe: "#0D8B7B", // Informação
  
  // Substituição do gold por tom mais escuro
  mutedBronze: "#8A7B5F",
};

const SCADDapp = () => {
  const { address, status: acctStatus } = useAccount();
  const { data: balanceData } = useBalance({ address, watch: true });
  const { disconnect } = useDisconnect();
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState("meuPerfil");
  
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
  const [isCompany, setIsCompany] = useState(false);

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
        setIsCompany(data[1]);
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
      setStatusMsg("✓ Registro realizado com sucesso.");
      setCpf("");
      setTimeout(() => {
        refetchRegistered();
        refetchMeuCadastro();
      }, 2000);
    },
    onError: (error) => {
      let mensagem = error.message;
      if (error.message.includes("JaRegistrado")) mensagem = "✗ Esta carteira já possui registro.";
      if (error.message.includes("IdentificadorInvalido")) mensagem = "✗ CPF inválido.";
      setStatusMsg(mensagem);
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
      setStatusMsg("✓ Empresa registrada com êxito.");
      setCnpj("");
      setTimeout(() => {
        refetchRegistered();
        refetchMeuCadastro();
      }, 2000);
    },
    onError: (error) => {
      let mensagem = error.message;
      if (error.message.includes("JaRegistrado")) mensagem = "✗ Esta carteira já possui registro.";
      if (error.message.includes("IdentificadorInvalido")) mensagem = "✗ CNPJ inválido.";
      setStatusMsg(mensagem);
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
      setStatusMsg(`✓ Consentimento ${consentStatus ? 'concedido' : 'revogado'}.`);
      setConsentAddress("");
    },
    onError: (error) => {
      setStatusMsg(`✗ Erro: ${error.message}`);
    },
  });

  // --- READ: Consultar cadastro de outro usuário ---
  const consultarCadastro = async () => {
    if (!consultAddress || !address) return;
    
    try {
      const temConsentimento = await refetchPossuiConsentimento();
      
      if (!temConsentimento.data && consultAddress !== address) {
        setStatusMsg("✗ Permissão negada para visualização.");
        setCadastroConsultado(null);
        return;
      }

      const response = await refetchCadastroDe();
      if (response.data && response.data[0] !== "") {
        setCadastroConsultado({
          identificador: response.data[0],
          isCompany: response.data[1],
          endereco: consultAddress
        });
        setStatusMsg("✓ Cadastro localizado.");
      } else {
        setCadastroConsultado(null);
        setStatusMsg("✗ Endereço não registrado.");
      }
    } catch (error) {
      setStatusMsg(`✗ Erro: ${error.message}`);
      setCadastroConsultado(null);
    }
  };

  const { refetch: refetchCadastroDe } = useContractRead({
    ...scadContract,
    functionName: "verCadastroDe",
    args: [consultAddress],
    enabled: false,
  });

  const { refetch: refetchPossuiConsentimento } = useContractRead({
    ...scadContract,
    functionName: "possuiConsentimento",
    args: [consultAddress, address],
    enabled: false,
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
      return identificador.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    } else {
      return identificador.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        "$1.$2.$3-$4"
      );
    }
  };

  const copiarEndereco = () => {
    navigator.clipboard.writeText(address);
    setStatusMsg('✓ Endereço copiado.');
  };

  const abas = [
    { id: 'meuPerfil', label: 'Dossiê Pessoal', icon: '📜' },
    { id: 'registrar', label: 'Registro Civil', icon: '🖋️' },
    { id: 'consentimento', label: 'Protocolo de Consentimento', icon: '🔏' },
    { id: 'consultar', label: 'Consulta Arquivo', icon: '🔍' },
  ];

  // Estilos com paleta Dark Academia invertida (fundos claros, letras escuras)
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Crimson Text', 'Times New Roman', serif",
      backgroundColor: COLORS.antiqueIvory,
      minHeight: '100vh',
      color: COLORS.charcoalSlate,
    },
    header: {
      color: COLORS.oxfordBrown,
      borderBottom: `2px solid ${COLORS.lightTaupe}`,
      paddingBottom: '1rem',
      marginBottom: '2rem',
      fontSize: '2.8rem',
      fontWeight: '700',
      letterSpacing: '1px',
      textAlign: 'center',
    },
    glassCard: {
      backgroundColor: 'rgba(237, 224, 220, 0.85)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1.8rem',
      marginBottom: '1.5rem',
      border: `1px solid ${COLORS.lightTaupe}`,
      boxShadow: '0 6px 20px rgba(44, 46, 48, 0.1)',
      color: COLORS.charcoalSlate,
    },
    card: {
      backgroundColor: COLORS.fadedIvory,
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: `1px solid ${COLORS.lightTaupe}`,
      boxShadow: '0 4px 12px rgba(44, 46, 48, 0.08)',
      color: COLORS.charcoalSlate,
    },
    buttonPrimary: {
      backgroundColor: COLORS.burntUmber,
      color: COLORS.antiqueIvory,
      border: 'none',
      borderRadius: '6px',
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      fontFamily: "'Crimson Text', serif",
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: COLORS.deepChestnut,
      border: `1px solid ${COLORS.deepChestnut}`,
      borderRadius: '6px',
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      fontFamily: "'Crimson Text', serif",
    },
    buttonDanger: {
      backgroundColor: COLORS.deepChestnut,
      color: COLORS.antiqueIvory,
      border: 'none',
      borderRadius: '6px',
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      fontFamily: "'Crimson Text', serif",
    },
    input: {
      backgroundColor: COLORS.fadedIvory,
      border: `1px solid ${COLORS.lightTaupe}`,
      borderRadius: '6px',
      padding: '0.75rem 1rem',
      color: COLORS.charcoalSlate,
      fontSize: '0.95rem',
      fontFamily: "'Crimson Text', serif",
      width: '100%',
      transition: 'all 0.3s ease',
    },
    tabButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'transparent',
      color: COLORS.oxfordBrown,
      border: 'none',
      borderBottom: '2px solid transparent',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      fontFamily: "'Crimson Text', serif",
    },
    tabButtonActive: {
      color: COLORS.burntUmber,
      borderBottom: `2px solid ${COLORS.burntUmber}`,
      backgroundColor: 'rgba(138, 75, 42, 0.1)',
    },
    statusSuccess: {
      backgroundColor: 'rgba(59, 63, 47, 0.1)',
      border: `1px solid ${COLORS.forestMoss}`,
      color: COLORS.forestMoss,
      padding: '1rem',
      borderRadius: '6px',
      marginTop: '1rem',
    },
    statusError: {
      backgroundColor: 'rgba(107, 46, 47, 0.1)',
      border: `1px solid ${COLORS.vintageMaroon}`,
      color: COLORS.vintageMaroon,
      padding: '1rem',
      borderRadius: '6px',
      marginTop: '1rem',
    },
    badge: {
      display: 'inline-block',
      padding: '0.35rem 0.85rem',
      backgroundColor: COLORS.mutedBronze,
      color: COLORS.antiqueIvory,
      borderRadius: '4px',
      fontSize: '0.85rem',
      fontWeight: '600',
      letterSpacing: '0.5px',
      marginLeft: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: COLORS.darkSlate,
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    sectionTitle: {
      color: COLORS.burntUmber,
      marginBottom: '1.5rem',
      fontSize: '1.8rem',
      fontWeight: '600',
      borderBottom: `1px solid ${COLORS.lightTaupe}`,
      paddingBottom: '0.5rem',
    },
    subtitle: {
      color: COLORS.oxfordBrown,
      fontStyle: 'italic',
      fontSize: '1rem',
      marginBottom: '1.5rem',
    },
  };

  const handleButtonHover = (e, isPrimary = true) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = isPrimary 
      ? `0 6px 15px rgba(138, 75, 42, 0.3)`
      : `0 6px 15px rgba(139, 44, 31, 0.2)`;
  };

  const handleButtonLeave = (e, originalBg, originalColor) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
    if (originalBg) e.target.style.backgroundColor = originalBg;
    if (originalColor) e.target.style.color = originalColor;
  };

  return (
    <div style={styles.container}>
      {/* Cabeçalho com Insígnia */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={styles.header}>
          <span style={{ color: COLORS.deepChestnut }}>⚖️</span> SCAD ARCHIVES
          <span style={{ color: COLORS.deepChestnut }}>⚖️</span>
        </h1>
        <p style={styles.subtitle}>
          Sistema de Consentimento e Auditoria Descentralizada
        </p>
      </div>
      
      {acctStatus !== "connected" ? (
        <ConnectWallet styles={styles} COLORS={COLORS} />
      ) : (
        <>
          {/* Credenciais do Usuário */}
          <div style={styles.glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: '0.75rem 0', color: COLORS.darkSlate }}>
                  <strong>IDENTIFICAÇÃO:</strong> 
                  <span 
                    onClick={copiarEndereco}
                    style={styles.badge}
                    title="Clique para copiar"
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = COLORS.burntUmber;
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = COLORS.mutedBronze;
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {address?.slice(0, 6)}...{address?.slice(-4)} ✎
                  </span>
                </p>
                <p style={{ margin: '0.75rem 0', color: COLORS.darkSlate }}>
                  <strong>SALDO:</strong> {balanceData?.formatted} {balanceData?.symbol}
                </p>
                <p style={{ margin: '0.75rem 0', color: COLORS.darkSlate }}>
                  <strong>STATUS:</strong> 
                  <span style={{ 
                    color: isRegistered ? COLORS.forestMoss : COLORS.vintageMaroon,
                    fontWeight: 'bold',
                    marginLeft: '0.5rem'
                  }}>
                    {isRegistered ? (isCompany ? 'EMPRESA VERIFICADA' : 'CIVIL REGISTRADO') : 'NÃO REGISTRADO'}
                  </span>
                </p>
              </div>
              <button 
                onClick={disconnect} 
                style={styles.buttonDanger}
                onMouseEnter={(e) => handleButtonHover(e, false)}
                onMouseLeave={(e) => handleButtonLeave(e, COLORS.deepChestnut, COLORS.antiqueIvory)}
              >
                ENCERRAR SESSÃO
              </button>
            </div>
          </div>

          {/* Navegação por Abas */}
          <div style={{ marginBottom: '2.5rem', display: 'flex', borderBottom: `1px solid ${COLORS.lightTaupe}`, flexWrap: 'wrap' }}>
            {abas.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.id ? styles.tabButtonActive : {})
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = COLORS.burntUmber;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = COLORS.oxfordBrown;
                  }
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das Abas */}
          <div>
            {/* ABA: Dossiê Pessoal */}
            {activeTab === 'meuPerfil' && (
              <div>
                <h2 style={styles.sectionTitle}>📜 DOSSIÊ PESSOAL</h2>
                {meuCadastro ? (
                  <div style={styles.glassCard}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
                      <div>
                        <h3 style={{ color: COLORS.darkSlate, marginBottom: '1rem', borderBottom: `1px solid ${COLORS.lightTaupe}`, paddingBottom: '0.5rem' }}>
                          DADOS CIVIS
                        </h3>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Identificador:</strong> {formatarIdentificador(meuCadastro.identificador, meuCadastro.isCompany)}</p>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Classificação:</strong> {meuCadastro.isCompany ? 'Pessoa Jurídica • CNPJ' : 'Pessoa Física • CPF'}</p>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Estado:</strong> <span style={{ color: COLORS.forestMoss, fontWeight: 'bold' }}>ATIVO • VERIFICADO</span></p>
                      </div>
                      <div>
                        <h3 style={{ color: COLORS.darkSlate, marginBottom: '1rem', borderBottom: `1px solid ${COLORS.lightTaupe}`, paddingBottom: '0.5rem' }}>
                          CHAVE PÚBLICA
                        </h3>
                        <div style={{ 
                          padding: '1rem',
                          backgroundColor: COLORS.fadedIvory,
                          color: COLORS.charcoalSlate,
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          border: `1px solid ${COLORS.lightTaupe}`,
                          marginBottom: '1rem'
                        }}>
                          {address}
                        </div>
                        <p style={{ marginTop: '1rem', color: COLORS.oxfordBrown, fontSize: '0.85rem' }}>
                          <strong>Rede:</strong> CESS Testnet • <strong>Chain ID:</strong> 11330
                        </p>
                      </div>
                    </div>
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${COLORS.lightTaupe}` }}>
                      <h4 style={{ color: COLORS.darkSlate, marginBottom: '1rem', fontSize: '1.1rem' }}>PROTOCOLOS DE SEGURANÇA</h4>
                      <ul style={{ color: COLORS.oxfordBrown, lineHeight: '1.6', fontSize: '0.95rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
                        <li>✓ Registro imutável em blockchain</li>
                        <li>✓ Controle granular de consentimentos</li>
                        <li>✓ Auditoria completa de acessos</li>
                        <li>✓ Conformidade com regulamentações</li>
                      </ul>
                    </div>
                  </div>
                ) : isRegistered ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.oxfordBrown }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', color: COLORS.mutedBronze }}>⌛</div>
                    Carregando dossiê...
                  </div>
                ) : (
                  <div style={{ ...styles.glassCard, textAlign: 'center' }}>
                    <h3 style={{ color: COLORS.darkSlate, marginBottom: '1rem' }}>✗ DOSSIÊ NÃO ENCONTRADO</h3>
                    <p style={{ margin: '1rem 0', color: COLORS.oxfordBrown }}>Não há registro civil vinculado a esta identificação.</p>
                    <p style={{ marginBottom: '1.5rem', color: COLORS.oxfordBrown, fontStyle: 'italic' }}>
                      Proceda ao registro civil para acessar os serviços.
                    </p>
                    <button
                      onClick={() => setActiveTab('registrar')}
                      style={styles.buttonPrimary}
                      onMouseEnter={(e) => handleButtonHover(e)}
                      onMouseLeave={(e) => handleButtonLeave(e, COLORS.burntUmber, COLORS.antiqueIvory)}
                    >
                      INICIAR REGISTRO
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ABA: Registro Civil */}
            {activeTab === 'registrar' && (
              <div>
                <h2 style={styles.sectionTitle}>🖋️ REGISTRO CIVIL</h2>
                {isRegistered ? (
                  <div style={{ ...styles.glassCard, textAlign: 'center' }}>
                    <h3 style={{ color: COLORS.forestMoss, marginBottom: '1rem' }}>✓ REGISTRO CONCLUÍDO</h3>
                    <p style={{ margin: '1rem 0', color: COLORS.oxfordBrown }}>Identificação já registrada no arquivo permanente.</p>
                    <p style={{ marginBottom: '1.5rem', color: COLORS.oxfordBrown }}>Consulte seu dossiê para detalhes completos.</p>
                    <button
                      onClick={() => setActiveTab('meuPerfil')}
                      style={styles.buttonPrimary}
                      onMouseEnter={(e) => handleButtonHover(e)}
                      onMouseLeave={(e) => handleButtonLeave(e, COLORS.burntUmber, COLORS.antiqueIvory)}
                    >
                      VER DOSSIÊ
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
                    {/* Pessoa Física */}
                    <div style={styles.glassCard}>
                      <h3 style={{ color: COLORS.darkSlate, marginBottom: '1rem', borderBottom: `1px solid ${COLORS.lightTaupe}`, paddingBottom: '0.5rem' }}>
                        👤 PESSOA FÍSICA
                      </h3>
                      <p style={{ color: COLORS.oxfordBrown, marginBottom: '1.5rem', fontSize: '0.95rem', fontStyle: 'italic' }}>
                        Registro civil para indivíduos.
                      </p>
                      <div>
                        <label style={styles.label}>
                          CPF (11 dígitos):
                        </label>
                        <input
                          type="text"
                          placeholder="00011122233"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                          style={{
                            ...styles.input,
                            borderColor: cpf.length === 11 ? COLORS.forestMoss : cpf.length > 0 ? COLORS.vintageMaroon : COLORS.lightTaupe,
                          }}
                          maxLength={11}
                        />
                        {cpf && (
                          <p style={{ 
                            color: cpf.length === 11 ? COLORS.forestMoss : COLORS.vintageMaroon,
                            fontSize: '0.85rem',
                            marginTop: '0.5rem',
                            fontStyle: 'italic'
                          }}>
                            {cpf.length === 11 ? '✓ Formato válido' : '✗ 11 dígitos necessários'}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            if (cpf.length !== 11) {
                              setStatusMsg("✗ Requer 11 dígitos.");
                              return;
                            }
                            setStatusMsg("⌛ Processando registro...");
                            writeRegistrarUsuario?.();
                          }}
                          disabled={!writeRegistrarUsuario || cpf.length !== 11}
                          style={{
                            ...styles.buttonPrimary,
                            marginTop: '1rem',
                            width: '100%',
                            opacity: cpf.length === 11 ? 1 : 0.6,
                            cursor: cpf.length === 11 ? 'pointer' : 'not-allowed'
                          }}
                          onMouseEnter={(e) => cpf.length === 11 && handleButtonHover(e)}
                          onMouseLeave={(e) => cpf.length === 11 && handleButtonLeave(e, COLORS.burntUmber, COLORS.antiqueIvory)}
                        >
                          REGISTRAR PESSOA FÍSICA
                        </button>
                      </div>
                    </div>

                    {/* Empresa */}
                    <div style={styles.glassCard}>
                      <h3 style={{ color: COLORS.darkSlate, marginBottom: '1rem', borderBottom: `1px solid ${COLORS.lightTaupe}`, paddingBottom: '0.5rem' }}>
                        🏢 PESSOA JURÍDICA
                      </h3>
                      <p style={{ color: COLORS.oxfordBrown, marginBottom: '1.5rem', fontSize: '0.95rem', fontStyle: 'italic' }}>
                        Registro comercial para empresas.
                      </p>
                      <div>
                        <label style={styles.label}>
                          CNPJ (14 dígitos):
                        </label>
                        <input
                          type="text"
                          placeholder="00111222333344"
                          value={cnpj}
                          onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                          style={{
                            ...styles.input,
                            borderColor: cnpj.length === 14 ? COLORS.forestMoss : cnpj.length > 0 ? COLORS.vintageMaroon : COLORS.lightTaupe,
                          }}
                          maxLength={14}
                        />
                        {cnpj && (
                          <p style={{ 
                            color: cnpj.length === 14 ? COLORS.forestMoss : COLORS.vintageMaroon,
                            fontSize: '0.85rem',
                            marginTop: '0.5rem',
                            fontStyle: 'italic'
                          }}>
                            {cnpj.length === 14 ? '✓ Formato válido' : '✗ 14 dígitos necessários'}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            if (cnpj.length !== 14) {
                              setStatusMsg("✗ Requer 14 dígitos.");
                              return;
                            }
                            setStatusMsg("⌛ Processando registro...");
                            writeRegistrarEmpresa?.();
                          }}
                          disabled={!writeRegistrarEmpresa || cnpj.length !== 14}
                          style={{
                            ...styles.buttonPrimary,
                            marginTop: '1rem',
                            width: '100%',
                            opacity: cnpj.length === 14 ? 1 : 0.6,
                            cursor: cnpj.length === 14 ? 'pointer' : 'not-allowed'
                          }}
                          onMouseEnter={(e) => cnpj.length === 14 && handleButtonHover(e)}
                          onMouseLeave={(e) => cnpj.length === 14 && handleButtonLeave(e, COLORS.burntUmber, COLORS.antiqueIvory)}
                        >
                          REGISTRAR PESSOA JURÍDICA
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(139, 44, 31, 0.05)', borderRadius: '6px', border: `1px solid ${COLORS.lightTaupe}` }}>
                  <p style={{ margin: 0, color: COLORS.oxfordBrown, fontSize: '0.9rem', fontStyle: 'italic' }}>
                    ⚠️ <strong>Nota:</strong> O registro é permanente e imutável. Verifique os dados antes de confirmar.
                  </p>
                </div>
              </div>
            )}

            {/* ABA: Protocolo de Consentimento */}
            {activeTab === 'consentimento' && (
              <div>
                <h2 style={styles.sectionTitle}>🔏 PROTOCOLO DE CONSENTIMENTO</h2>
                {!isRegistered ? (
                  <div style={{ ...styles.glassCard, textAlign: 'center' }}>
                    <h3 style={{ color: COLORS.vintageMaroon, marginBottom: '1rem' }}>✗ REGISTRO REQUERIDO</h3>
                    <p style={{ margin: '1rem 0', color: COLORS.oxfordBrown }}>É necessário registro civil para gerenciar consentimentos.</p>
                    <button
                      onClick={() => setActiveTab('registrar')}
                      style={styles.buttonPrimary}
                      onMouseEnter={(e) => handleButtonHover(e)}
                      onMouseLeave={(e) => handleButtonLeave(e, COLORS.burntUmber, COLORS.antiqueIvory)}
                    >
                      PROCEDER AO REGISTRO
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
                    {/* Gerenciamento */}
                    <div>
                      <div style={styles.glassCard}>
                        <h3 style={{ color: COLORS.darkSlate, marginBottom: '1rem' }}>GERENCIAMENTO DE PERMISSÕES</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={styles.label}>
                            Identificação do Destinatário:
                          </label>
                          <input
                            type="text"
                            placeholder="0x..."
                            value={consentAddress}
                            onChange={(e) => setConsentAddress(e.target.value)}
                            style={styles.input}
                          />
                          <p style={{ fontSize: '0.85rem', color: COLORS.oxfordBrown, marginTop: '0.25rem', fontStyle: 'italic' }}>
                            Insira a chave pública do destinatário
                          </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ ...styles.label, marginBottom: '0.75rem' }}>
                            Tipo de Autorização:
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer', 
                              padding: '0.75rem', 
                              borderRadius: '6px', 
                              backgroundColor: consentStatus === true ? 'rgba(59, 63, 47, 0.1)' : 'transparent', 
                              border: consentStatus === true ? `1px solid ${COLORS.forestMoss}` : `1px solid transparent`,
                              transition: 'all 0.3s ease'
                            }}>
                              <input
                                type="radio"
                                checked={consentStatus === true}
                                onChange={() => setConsentStatus(true)}
                                style={{ marginRight: '0.75rem' }}
                              />
                              <div>
                                <div style={{ fontWeight: '600', color: COLORS.darkSlate }}>✓ CONCEDER ACESSO</div>
                                <div style={{ fontSize: '0.85rem', color: COLORS.oxfordBrown }}>Permitir visualização de dados</div>
                              </div>
                            </label>
                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer', 
                              padding: '0.75rem', 
                              borderRadius: '6px', 
                              backgroundColor: consentStatus === false ? 'rgba(107, 46, 47, 0.1)' : 'transparent', 
                              border: consentStatus === false ? `1px solid ${COLORS.vintageMaroon}` : `1px solid transparent`,
                              transition: 'all 0.3s ease'
                            }}>
                              <input
                                type="radio"
                                checked={consentStatus === false}
                                onChange={() => setConsentStatus(false)}
                                style={{ marginRight: '0.75rem' }}
                              />
                              <div>
                                <div style={{ fontWeight: '600', color: COLORS.darkSlate }}>✗ REVOGAR ACESSO</div>
                                <div style={{ fontSize: '0.85rem', color: COLORS.oxfordBrown }}>Revogar permissão de visualização</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!consentAddress) {
                              setStatusMsg("✗ Identificação requerida.");
                              return;
                            }
                            if (consentAddress === address) {
                              setStatusMsg("✗ Autoautorização não permitida.");
                              return;
                            }
                            setStatusMsg(`⌛ Processando ${consentStatus ? 'concessão' : 'revogação'}...`);
                            writeDarConsentimento?.();
                          }}
                          disabled={!writeDarConsentimento || !consentAddress}
                          style={{
                            ...styles.buttonPrimary,
                            backgroundColor: consentStatus ? COLORS.forestMoss : COLORS.vintageMaroon,
                            color: COLORS.antiqueIvory,
                            width: '100%',
                            opacity: writeDarConsentimento && consentAddress ? 1 : 0.6,
                            cursor: writeDarConsentimento && consentAddress ? 'pointer' : 'not-allowed'
                          }}
                          onMouseEnter={(e) => writeDarConsentimento && consentAddress && handleButtonHover(e)}
                          onMouseLeave={(e) => writeDarConsentimento && consentAddress && handleButtonLeave(e, consentStatus ? COLORS.forestMoss : COLORS.vintageMaroon, COLORS.antiqueIvory)}
                        >
                          {consentStatus ? 'EMITIR AUTORIZAÇÃO' : 'REVOGAR AUTORIZAÇÃO'}
                        </button>
                      </div>
                    </div>

                    {/* Documentação */}
                    <div>
                      <div style={{ ...styles.glassCard, borderColor: COLORS.forestMoss }}>
                        <h3 style={{ color: COLORS.burntUmber, marginBottom: '1rem' }}>DOCUMENTAÇÃO DO PROTOCOLO</h3>
                        <h4 style={{ color: COLORS.darkSlate, marginBottom: '0.75rem', fontSize: '1rem' }}>Princípios de Controle</h4>
                        <ul style={{ color: COLORS.charcoalSlate, lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                          <li>• Controle exclusivo pelo titular</li>
                          <li>• Modificações registradas permanentemente</li>
                          <li>• Transparência total de acessos</li>
                          <li>• Conformidade regulatória</li>
                        </ul>
                        
                        <h4 style={{ color: COLORS.darkSlate, marginBottom: '0.75rem', fontSize: '1rem' }}>Fluxo Protocolado</h4>
                        <div style={{ 
                          padding: '1rem', 
                          backgroundColor: 'rgba(237, 224, 220, 0.5)',
                          borderRadius: '6px',
                          border: `1px solid ${COLORS.lightTaupe}`
                        }}>
                          <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>1.</span> Solicitação de acesso
                          </p>
                          <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>2.</span> Autorização do titular
                          </p>
                          <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>3.</span> Acesso limitado aos dados
                          </p>
                          <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>4.</span> Auditoria registrada
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA: Consulta Arquivo */}
            {activeTab === 'consultar' && (
              <div>
                <h2 style={styles.sectionTitle}>🔍 CONSULTA DE ARQUIVO</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
                  <div>
                    <div style={styles.glassCard}>
                      <h3 style={{ color: COLORS.darkSlate, marginBottom: '1rem' }}>CONSULTA POR IDENTIFICAÇÃO</h3>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={styles.label}>
                          Chave Pública:
                        </label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={consultAddress}
                          onChange={(e) => setConsultAddress(e.target.value)}
                          style={styles.input}
                        />
                      </div>

                      <button
                        onClick={consultarCadastro}
                        style={{
                          ...styles.buttonPrimary,
                          width: '100%',
                        }}
                        onMouseEnter={(e) => handleButtonHover(e)}
                        onMouseLeave={(e) => handleButtonLeave(e, COLORS.burntUmber, COLORS.antiqueIvory)}
                      >
                        EXECUTAR CONSULTA
                      </button>
                    </div>

                    {/* Resultado */}
                    {cadastroConsultado && (
                      <div style={{ ...styles.glassCard, marginTop: '1rem', borderColor: COLORS.forestMoss }}>
                        <h3 style={{ color: COLORS.forestMoss, marginBottom: '1rem' }}>✓ REGISTRO LOCALIZADO</h3>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Identificação:</strong> {cadastroConsultado.endereco}</p>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Documento:</strong> {formatarIdentificador(cadastroConsultado.identificador, cadastroConsultado.isCompany)}</p>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Classificação:</strong> {cadastroConsultado.isCompany ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                        <p style={{ marginBottom: '0.75rem' }}><strong>Status da Consulta:</strong> <span style={{ color: COLORS.forestMoss, fontWeight: 'bold' }}>AUTORIZADO ✓</span></p>
                      </div>
                    )}
                  </div>

                  {/* Regulamentos */}
                  <div>
                    <div style={{ ...styles.glassCard, borderColor: COLORS.lightTaupe }}>
                      <h3 style={{ color: COLORS.burntUmber, marginBottom: '1rem' }}>REGULAMENTOS DE CONSULTA</h3>
                      <h4 style={{ color: COLORS.darkSlate, marginBottom: '0.75rem', fontSize: '1rem' }}>Protocolos de Acesso</h4>
                      <ul style={{ color: COLORS.charcoalSlate, lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                        <li>• Privacidade como princípio fundamental</li>
                        <li>• Autorização explícita obrigatória</li>
                        <li>• Registro imutável de todas as consultas</li>
                        <li>• Conformidade com legislação vigente</li>
                      </ul>
                      
                      <h4 style={{ color: COLORS.darkSlate, marginBottom: '0.75rem', fontSize: '1rem' }}>Fluxo Autorizado</h4>
                      <div style={{ 
                        padding: '1rem', 
                        backgroundColor: 'rgba(237, 224, 220, 0.5)',
                        borderRadius: '6px',
                        border: `1px solid ${COLORS.lightTaupe}`
                      }}>
                        <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>1.</span> Verificação de autorização
                        </p>
                        <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>2.</span> Validação de consentimento
                        </p>
                        <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>3.</span> Acesso a dados autorizados
                        </p>
                        <p style={{ margin: '0.5rem 0', color: COLORS.charcoalSlate, display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '0.5rem', color: COLORS.burntUmber }}>4.</span> Registro de auditoria
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mensagem de Status */}
          {statusMsg && (
            <div style={{
              ...(statusMsg.includes('✓') || statusMsg.includes('sucesso') ? styles.statusSuccess : styles.statusError),
              marginTop: '1.5rem'
            }}>
              {statusMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- Componente de Conexão de Carteira ---
const ConnectWallet = ({ styles, COLORS }) => {
  const { connect, connectors, error } = useConnect();

  const handleButtonHover = (e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = `0 6px 15px rgba(138, 75, 42, 0.3)`;
  };

  const handleButtonLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: COLORS.oxfordBrown, marginBottom: '1rem', fontSize: '2rem' }}>⚡ INICIALIZAÇÃO DO SISTEMA</h2>
        <p style={{ color: COLORS.oxfordBrown, fontStyle: 'italic', fontSize: '1.1rem' }}>
          Conecte sua identificação blockchain para acessar os arquivos SCAD
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            style={{
              ...styles.buttonPrimary,
              padding: '1rem 2rem',
              fontSize: '1rem',
            }}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            CONECTAR COM {connector.name.toUpperCase()}
          </button>
        ))}
      </div>
      {error && (
        <div style={{ 
          marginTop: '2rem', 
          color: COLORS.vintageMaroon,
          padding: '1rem',
          backgroundColor: 'rgba(107, 46, 47, 0.1)',
          borderRadius: '6px',
          border: `1px solid ${COLORS.vintageMaroon}`,
          maxWidth: '400px',
          margin: '2rem auto 0'
        }}>
          <strong>ERRO:</strong> {error.message}
        </div>
      )}
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: 'rgba(138, 75, 42, 0.05)', borderRadius: '6px', border: `1px solid ${COLORS.lightTaupe}` }}>
        <p style={{ color: COLORS.oxfordBrown, fontSize: '0.95rem', fontStyle: 'italic' }}>
          "A privacidade não é um luxo, é um direito fundamental. 
          Cada consentimento é um capítulo na história do controle sobre seus próprios dados."
        </p>
      </div>
    </div>
  );
};

export default function SCADDappWithWagmiProvider() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SCADDapp />
    </WagmiConfig>
  );
}