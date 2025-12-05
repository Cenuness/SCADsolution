// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

error JaRegistrado();
error NaoRegistrado();
error IdentificadorInvalido();
error SemPermissao();

contract SCAD is Ownable {
    // Constructor padrão → msg.sender vira o owner automaticamente
    constructor() Ownable(msg.sender) {}

    struct Cadastro {
        string identificador;   // CPF ou CNPJ
        bool isCompany;
        bool exists;
    }

    mapping(address => Cadastro) private cadastros;
    mapping(address => mapping(address => bool)) private consentimento;

    event Registrado(address indexed usuario, string identificador, bool isCompany);
    event ConsentimentoDado(address indexed dono, address autorizado, bool status);

    // -------------------------
    // CADASTRO
    // -------------------------

    function registrarUsuario(string calldata cpf) external {
        if (bytes(cpf).length != 11) revert IdentificadorInvalido();
        if (cadastros[msg.sender].exists) revert JaRegistrado();

        cadastros[msg.sender] = Cadastro({
            identificador: cpf,
            isCompany: false,
            exists: true
        });

        emit Registrado(msg.sender, cpf, false);
    }

    function registrarEmpresa(string calldata cnpj) external {
        if (bytes(cnpj).length != 14) revert IdentificadorInvalido();
        if (cadastros[msg.sender].exists) revert JaRegistrado();

        cadastros[msg.sender] = Cadastro({
            identificador: cnpj,
            isCompany: true,
            exists: true
        });

        emit Registrado(msg.sender, cnpj, true);
    }

    // -------------------------
    // CONSENTIMENTO
    // -------------------------

    function darConsentimento(address autorizado, bool status) external {
        if (!cadastros[msg.sender].exists) revert NaoRegistrado();

        consentimento[msg.sender][autorizado] = status;

        emit ConsentimentoDado(msg.sender, autorizado, status);
    }

    // -------------------------
    // CONSULTAS
    // -------------------------

    function verMeuCadastro() external view returns (
        string memory identificador,
        bool isCompany
    ) {
        if (!cadastros[msg.sender].exists) revert NaoRegistrado();
        Cadastro memory c = cadastros[msg.sender];
        return (c.identificador, c.isCompany);
    }

    function verCadastroDe(address usuario) external view returns (
        string memory identificador,
        bool isCompany
    ) {
        if (!cadastros[usuario].exists) revert NaoRegistrado();

        // Usuário só vê dados de outro se tiver consentimento
        if (msg.sender != usuario && !consentimento[usuario][msg.sender]) {
            revert SemPermissao();
        }

        Cadastro memory c = cadastros[usuario];
        return (c.identificador, c.isCompany);
    }

    // -------------------------
    // AUXILIARES
    // -------------------------

    function carteiraRegistrada(address carteira) external view returns (bool) {
        return cadastros[carteira].exists;
    }

    function possuiConsentimento(address dono, address leitor) external view returns (bool) {
        return consentimento[dono][leitor];
    }
}
