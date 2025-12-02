export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "string","name": "cpf","type": "string"}],
    "name": "registrarUsuario",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string","name": "cnpj","type": "string"}],
    "name": "registrarEmpresa",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "autorizado","type": "address"},
      {"internalType": "bool","name": "status","type": "bool"}
    ],
    "name": "darConsentimento",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verMeuCadastro",
    "outputs": [
      {"internalType": "string","name": "identificador","type": "string"},
      {"internalType": "bool","name": "isCompany","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "usuario","type": "address"}],
    "name": "verCadastroDe",
    "outputs": [
      {"internalType": "string","name": "identificador","type": "string"},
      {"internalType": "bool","name": "isCompany","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
