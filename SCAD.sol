// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Definição de erros customizados para economizar gás e melhorar a clareza
error NaoRegistrado();
error JaRegistrado();
error CPFInvalido();
error CNPJInvalido();
error DataNascimentoInvalida();
error ProcessoInvalido();
error DuracaoInvalida();
error NaoAutorizado();
error JaRevogado();
error PedidoNaoExiste();
error PedidoJaAtribuidoRejeitado();
error StatusPedidoInvalido();
error EmpresaInativa();
error UsuarioInativo();
error EmpresaNaoRegistrada();
error UsuarioNaoRegistrado();
error WalletDesativada();
error QuantidadeInvalida();
error AllowanceInsuficiente();


contract SCAD is ERC20, Ownable {
    uint256 private constant DIAS_EM_SEGUNDOS = 86400;

    // Structs corrigidas para usar bytes32 para identificadores sensíveis (Hashing)
    struct Empresa {
        bytes32 hashEmpresa;
        address carteira;
        bytes32 hashCNPJ;
        string razaoSocial;
        bool ativo;
    }

    struct Usuario {
        bytes32 hashUsuario;
        address carteira;
        bytes32 hashCPF;
        bool ativo;
        // Adicionado para correção de lógica no update
        string email;
        uint256 dataNascimento;
    }

    struct ProcessoDados {
        bytes32 hashEmpresa;
        string finalidade;
        uint256 periodoRetencao;
    }

    struct Consentimento {
        bytes32 hashConsentimento;
        bytes32 hashUsuario;
        bytes32 hashEmpresa;
        bytes32 hashProcesso;
        uint256 dataInicio;
        uint256 duracao;
        bool ativo;
    }

    struct PedidoContrato {
        bytes32 hashEmpresa;
        string tipoContrato;
        string tipoInformacao;
        uint256 prazo;
        uint256 dataPedido;
        uint256 status; // 0: criado, 1: atribuído, 2: rejeitado, 3: concluído
        address desenvolvedor;
    }

    mapping(bytes32 => Empresa) public empresas;
    mapping(bytes32 => Usuario) public usuarios;
    mapping(bytes32 => ProcessoDados) public processosDados;
    mapping(bytes32 => Consentimento) public consentimentos;
    mapping(bytes32 => PedidoContrato) public pedidosContratos;

    mapping(address => bytes32) public hashPorCarteira;
    mapping(bytes32 => bytes32[]) public consentimentosUsuario;
    mapping(bytes32 => bytes32[]) public pedidosEmpresa;
    // Mapeamento para evitar duplicidade usando o hash
    mapping(bytes32 => bool) public cpfHashRegistrado;
    mapping(bytes32 => bool) public cnpjHashRegistrado;

    bytes32[] public todosUsuarios;
    bytes32[] public todasEmpresas;

    event EmpresaRegistrada(bytes32 indexed hashEmpresa, address carteira, bytes32 indexed hashCNPJ);
    event UsuarioRegistrado(bytes32 indexed hashUsuario, address carteira, bytes32 indexed hashCPF);
    event ProcessoDadosRegistrado(bytes32 indexed hashProcesso, bytes32 hashEmpresa);
    event ConsentimentoConcedido(bytes32 indexed hashConsentimento, bytes32 hashUsuario, bytes32 hashEmpresa);
    event ConsentimentoRevogado(bytes32 indexed hashConsentimento);
    event PedidoContratoCriado(bytes32 indexed hashPedido, bytes32 hashEmpresa);
    event PedidoContratoAtualizado(bytes32 indexed hashPedido, uint256 status);
    event ConcessaoRealizada(bytes32 indexed hashEmpresa, bytes32 indexed hashUsuario, uint256 quantidade);

    modifier apenasRegistrado() {
        if (hashPorCarteira[msg.sender] == bytes32(0)) revert NaoRegistrado();
        _;
    }

    constructor() ERC20("SCADtoken", "SCD") Ownable(msg.sender) {}

    // ----------------- CADASTRO -----------------
    function registrarUsuario(string memory cpf, uint256 dataNascimento, string memory email) public returns (bytes32) {
        bytes32 hashCPF = keccak256(abi.encodePacked(cpf));

        if (cpfHashRegistrado[hashCPF]) revert JaRegistrado();
        if (hashPorCarteira[msg.sender] != bytes32(0)) revert JaRegistrado();
        if (bytes(cpf).length != 11) revert CPFInvalido();
        if (dataNascimento == 0 || dataNascimento >= block.timestamp) revert DataNascimentoInvalida();

        bytes32 hashUsuario = _gerarHash("U", hashCPF, msg.sender);
        
        // Dados de perfil incluídos no registro
        usuarios[hashUsuario] = Usuario(hashUsuario, msg.sender, hashCPF, true, email, dataNascimento);
        hashPorCarteira[msg.sender] = hashUsuario;
        cpfHashRegistrado[hashCPF] = true;
        todosUsuarios.push(hashUsuario);

        emit UsuarioRegistrado(hashUsuario, msg.sender, hashCPF);
        return hashUsuario;
    }

    function registrarEmpresa(string memory cnpj, string memory razaoSocial) public returns (bytes32) {
        bytes32 hashCNPJ = keccak256(abi.encodePacked(cnpj));

        if (cnpjHashRegistrado[hashCNPJ]) revert JaRegistrado();
        if (hashPorCarteira[msg.sender] != bytes32(0)) revert JaRegistrado();
        if (bytes(cnpj).length != 14) revert CNPJInvalido();

        bytes32 hashEmpresa = _gerarHash("E", hashCNPJ, msg.sender);
        
        empresas[hashEmpresa] = Empresa(hashEmpresa, msg.sender, hashCNPJ, razaoSocial, true);
        hashPorCarteira[msg.sender] = hashEmpresa;
        cnpjHashRegistrado[hashCNPJ] = true;
        todasEmpresas.push(hashEmpresa);

        emit EmpresaRegistrada(hashEmpresa, msg.sender, hashCNPJ);
        return hashEmpresa;
    }

    // ----------------- PERFIL -----------------
    function atualizarPerfilUsuario(string memory novoEmail, uint256 novaDataNascimento) public apenasRegistrado {
        bytes32 hashUsuario = hashPorCarteira[msg.sender];
        if (usuarios[hashUsuario].carteira == address(0)) revert UsuarioNaoRegistrado();

        if (bytes(novoEmail).length > 0) {
            usuarios[hashUsuario].email = novoEmail;
        }
        if (novaDataNascimento > 0 && novaDataNascimento < block.timestamp) {
            usuarios[hashUsuario].dataNascimento = novaDataNascimento;
        }
    }

    function atualizarPerfilEmpresa(string memory novaRazaoSocial) public apenasRegistrado {
        bytes32 hashEmpresa = hashPorCarteira[msg.sender];
        if (empresas[hashEmpresa].carteira == address(0)) revert EmpresaNaoRegistrada();

        empresas[hashEmpresa].razaoSocial = novaRazaoSocial;
    }


    // ----------------- PROCESSOS E CONSENTIMENTOS -----------------
    function registrarProcessoDados(string memory finalidade, uint256 periodoRetencao) public apenasRegistrado returns (bytes32) {
        bytes32 hashEmpresa = hashPorCarteira[msg.sender];
        if (!empresas[hashEmpresa].ativo) revert EmpresaInativa();

        bytes32 hashProcesso = keccak256(abi.encodePacked(hashEmpresa, finalidade, block.timestamp));
        processosDados[hashProcesso] = ProcessoDados(hashEmpresa, finalidade, periodoRetencao);

        emit ProcessoDadosRegistrado(hashProcesso, hashEmpresa);
        return hashProcesso;
    }

    function concederConsentimento(bytes32 hashProcesso, uint256 duracao) public apenasRegistrado returns (bytes32) {
        bytes32 hashUsuario = hashPorCarteira[msg.sender];
        if (!usuarios[hashUsuario].ativo) revert UsuarioInativo();

        ProcessoDados memory processo = processosDados[hashProcesso];
        if (processo.hashEmpresa == bytes32(0)) revert ProcessoInvalido();
        if (duracao > processo.periodoRetencao) revert DuracaoInvalida();

        bytes32 hashConsentimento = keccak256(abi.encodePacked(hashUsuario, processo.hashEmpresa, hashProcesso, block.timestamp));
        consentimentos[hashConsentimento] = Consentimento(hashConsentimento, hashUsuario, processo.hashEmpresa, hashProcesso, block.timestamp, duracao, true);

        consentimentosUsuario[hashUsuario].push(hashConsentimento);

        emit ConsentimentoConcedido(hashConsentimento, hashUsuario, processo.hashEmpresa);
        return hashConsentimento;
    }

    function revogarConsentimento(bytes32 hashConsentimento) public apenasRegistrado {
        bytes32 hashUsuario = hashPorCarteira[msg.sender];
        if (consentimentos[hashConsentimento].hashUsuario != hashUsuario) revert NaoAutorizado();
        if (!consentimentos[hashConsentimento].ativo) revert JaRevogado();

        consentimentos[hashConsentimento].ativo = false;
        emit ConsentimentoRevogado(hashConsentimento);
    }

    // ----------------- PEDIDOS DE CONTRATO -----------------
    function criarPedidoContrato(string memory tipoContrato, string memory tipoInformacao, uint256 prazo) public apenasRegistrado returns (bytes32) {
        bytes32 hashEmpresa = hashPorCarteira[msg.sender];
        if (!empresas[hashEmpresa].ativo) revert EmpresaInativa();

        bytes32 hashPedido = keccak256(abi.encodePacked(hashEmpresa, tipoContrato, block.timestamp));
        pedidosContratos[hashPedido] = PedidoContrato(hashEmpresa, tipoContrato, tipoInformacao, prazo, block.timestamp, 0, address(0));
        pedidosEmpresa[hashEmpresa].push(hashPedido);

        emit PedidoContratoCriado(hashPedido, hashEmpresa);
        return hashPedido;
    }

    function atribuirDesenvolvedor(bytes32 hashPedido, address desenvolvedor) public onlyOwner {
        if (pedidosContratos[hashPedido].hashEmpresa == bytes32(0)) revert PedidoNaoExiste();
        if (pedidosContratos[hashPedido].status != 0) revert PedidoJaAtribuidoRejeitado();

        pedidosContratos[hashPedido].desenvolvedor = desenvolvedor;
        pedidosContratos[hashPedido].status = 1;

        emit PedidoContratoAtualizado(hashPedido, 1);
    }

    function rejeitarPedidoContrato(bytes32 hashPedido) public onlyOwner {
        if (pedidosContratos[hashPedido].hashEmpresa == bytes32(0)) revert PedidoNaoExiste();
        if (pedidosContratos[hashPedido].status != 0) revert PedidoJaAtribuidoRejeitado();

        pedidosContratos[hashPedido].status = 2;
        emit PedidoContratoAtualizado(hashPedido, 2);
    }

    function concluirPedidoContrato(bytes32 hashPedido) public {
        if (msg.sender != pedidosContratos[hashPedido].desenvolvedor && msg.sender != owner()) revert NaoAutorizado();
        if (pedidosContratos[hashPedido].status != 1) revert StatusPedidoInvalido();

        pedidosContratos[hashPedido].status = 3;
        emit PedidoContratoAtualizado(hashPedido, 3);
    }

    // ----------------- TOKENS -----------------
    // CORRIGIDO: Usa a função pública transferFrom para gastar o allowance da empresa
    function concederTokens(bytes32 hashEmpresa, bytes32 hashUsuario, uint256 quantidade) external onlyOwner {
        Empresa memory e = empresas[hashEmpresa];
        Usuario memory u = usuarios[hashUsuario];

        if (e.carteira == address(0)) revert EmpresaNaoRegistrada();
        if (u.carteira == address(0)) revert UsuarioNaoRegistrado();
        if (!e.ativo || !u.ativo) revert WalletDesativada();
        if (quantidade == 0) revert QuantidadeInvalida();
        
        // Exige que a Empresa tenha dado 'approve' ao Contrato SCAD (address(this))
        if (allowance(e.carteira, address(this)) < quantidade) revert AllowanceInsuficiente();

        // **CORREÇÃO FINAL:** Usa a função pública transferFrom do próprio contrato ERC-20
        transferFrom(e.carteira, u.carteira, quantidade);

        emit ConcessaoRealizada(hashEmpresa, hashUsuario, quantidade);
    }

    // ----------------- CONSULTAS -----------------
    function verificarValidadeConsentimento(bytes32 hashConsentimento) public view returns (bool) {
        Consentimento memory c = consentimentos[hashConsentimento];
        return c.ativo && block.timestamp <= c.dataInicio + (c.duracao * DIAS_EM_SEGUNDOS);
    }
    
    // NOTA: Esta função é cara em gás e pode falhar com arrays grandes.
    function obterConsentimentosAtivosUsuario(bytes32 hashUsuario) public view returns (bytes32[] memory) {
        bytes32[] memory todos = consentimentosUsuario[hashUsuario];
        uint256 ativos = 0;
        for (uint256 i = 0; i < todos.length; i++) {
            if (verificarValidadeConsentimento(todos[i])) ativos++;
        }
        bytes32[] memory resultado = new bytes32[](ativos);
        uint256 index = 0;
        for (uint256 i = 0; i < todos.length; i++) {
            if (verificarValidadeConsentimento(todos[i])) {
                resultado[index++] = todos[i];
            }
        }
        return resultado;
    }

    function obterMeuHash() public view returns (bytes32) {
        return hashPorCarteira[msg.sender];
    }

    // ----------------- ADMIN -----------------
    function desativarUsuario(bytes32 hashUsuario) public onlyOwner {
        if (usuarios[hashUsuario].carteira == address(0)) revert UsuarioNaoRegistrado();
        usuarios[hashUsuario].ativo = false;
    }

    function desativarEmpresa(bytes32 hashEmpresa) public onlyOwner {
        if (empresas[hashEmpresa].carteira == address(0)) revert EmpresaNaoRegistrada();
        empresas[hashEmpresa].ativo = false;
    }

    // Verifica se o hash do CPF/CNPJ está registrado
    function verificarCpfRegistrado(string memory cpf) public view returns (bool) {
        return cpfHashRegistrado[keccak256(abi.encodePacked(cpf))];
    }

    function verificarCnpjRegistrado(string memory cnpj) public view returns (bool) {
        return cnpjHashRegistrado[keccak256(abi.encodePacked(cnpj))];
    }

    // ----------------- INTERNOS -----------------
    // Usa o hash do identificador para maior segurança
    function _gerarHash(string memory tipo, bytes32 identificadorHash, address carteira) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(tipo, identificadorHash, carteira, block.timestamp));
    }
}