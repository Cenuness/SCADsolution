import { ethers } from "./ethers.min.js"; // ou CDN

// -----------------------
// CONFIGURAÇÃO DO CONTRATO
// -----------------------
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

const ABI = [
    // ------- EVENTS --------
    "event Registrado(address indexed usuario, string identificador, bool isCompany)",
    "event ConsentimentoDado(address indexed dono, address autorizado, bool status)",

    // ------- CADASTRO -------
    "function registrarUsuario(string calldata cpf) external",
    "function registrarEmpresa(string calldata cnpj) external",

    // ------- CONSENTIMENTO -------
    "function darConsentimento(address autorizado, bool status) external",

    // ------- CONSULTAS -------
    "function verMeuCadastro() external view returns (string memory, bool)",
    "function verCadastroDe(address usuario) external view returns (string memory, bool)",
    "function carteiraRegistrada(address carteira) external view returns (bool)",
    "function possuiConsentimento(address dono, address leitor) external view returns (bool)"
];

// -----------------------
// VARIÁVEIS GLOBAIS
// -----------------------
let provider;
let signer;
let contract;

// -----------------------
// CONECTAR METAMASK
// -----------------------
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask não detectada!");
        return;
    }

    await ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    console.log("Carteira conectada:", await signer.getAddress());
}

// Detecta troca de conta na MetaMask
if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => {
        window.location.reload();
    });
}

// -----------------------
// FUNÇÕES DO CONTRATO
// -----------------------

// Registrar CPF (11 dígitos)
export async function registrarUsuario(cpf) {
    try {
        const tx = await contract.registrarUsuario(cpf);
        await tx.wait();
        alert("Usuário registrado com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao registrar usuário.");
    }
}

// Registrar CNPJ (14 dígitos)
export async function registrarEmpresa(cnpj) {
    try {
        const tx = await contract.registrarEmpresa(cnpj);
        await tx.wait();
        alert("Empresa registrada com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao registrar empresa.");
    }
}

// Dar ou revogar consentimento
export async function darConsentimento(autorizado, status) {
    try {
        const tx = await contract.darConsentimento(autorizado, status);
        await tx.wait();
        alert("Consentimento atualizado!");
    } catch (err) {
        console.error(err);
        alert("Erro ao alterar consentimento.");
    }
}

// Ver o próprio cadastro
export async function verMeuCadastro() {
    try {
        const [identificador, isCompany] = await contract.verMeuCadastro();
        return { identificador, isCompany };
    } catch (err) {
        console.error(err);
        alert("Erro ao visualizar seu cadastro.");
    }
}

// Ver cadastro de outra carteira
export async function verCadastroDe(address) {
    try {
        const [identificador, isCompany] = await contract.verCadastroDe(address);
        return { identificador, isCompany };
    } catch (err) {
        console.error(err);
        alert("Erro ao visualizar cadastro de outro usuário.");
    }
}

// Ver se carteira está registrada
export async function carteiraRegistrada(address) {
    try {
        return await contract.carteiraRegistrada(address);
    } catch (err) {
        console.error(err);
        alert("Erro ao verificar registro.");
    }
}

// Ver se existe consentimento
export async function possuiConsentimento(dono, leitor) {
    try {
        return await contract.possuiConsentimento(dono, leitor);
    } catch (err) {
        console.error(err);
        alert("Erro ao verificar consentimento.");
    }
}

// Exporta função para conectar no botão Connect
export { connectWallet };
