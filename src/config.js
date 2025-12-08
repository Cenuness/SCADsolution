export const contractAddress = "0xa412B45C8f7ec87282174Be04A5503723A278fE5";
export const RPC_URL = "https://testnet-rpc.cess.network/ws/";
export const CHAIN_ID = 11330;
export const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "autorizado",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "darConsentimento",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "IdentificadorInvalido",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "JaRegistrado",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NaoRegistrado",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "cnpj",
				"type": "string"
			}
		],
		"name": "registrarEmpresa",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SemPermissao",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "dono",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "autorizado",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "ConsentimentoDado",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "usuario",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "identificador",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isCompany",
				"type": "bool"
			}
		],
		"name": "Registrado",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "cpf",
				"type": "string"
			}
		],
		"name": "registrarUsuario",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "carteira",
				"type": "address"
			}
		],
		"name": "carteiraRegistrada",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "dono",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "leitor",
				"type": "address"
			}
		],
		"name": "possuiConsentimento",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "usuario",
				"type": "address"
			}
		],
		"name": "verCadastroDe",
		"outputs": [
			{
				"internalType": "string",
				"name": "identificador",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isCompany",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "verMeuCadastro",
		"outputs": [
			{
				"internalType": "string",
				"name": "identificador",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isCompany",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];