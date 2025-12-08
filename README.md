# 🛡️ SCAD: Secure Cadastro and Access Decentralized System on CESS Testnet

## 📝 Project Summary

SCAD (Secure Cadastro and Access Decentralized) is a DApp (Decentralized Application) built on the **CESS Testnet** designed to manage decentralized identity registration and granular data access consent.
The core of the application is a Solidity smart contract that allows users (individuals or companies) to register their identity using common Brazilian identifiers (CPF for individuals, CNPJ for companies). Crucially, this system enforces **data sovereignty** by requiring explicit, on-chain consent from the owner before any other party can view their registered identifier.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Problem Solved and Key Learnings
   
 What Problem Does it Solve?
    This project addresses the challenge of **centralized data management and lack of user control over personal information**. By storing registration identifiers and the access control logic (consent) on a public blockchain, SCAD:
    Decentralizes Registration:** Removes the need for a single, trust-required central authority.
    Enforces Privacy:** Access to sensitive identifiers (CPF/CNPJ) is strictly governed by the smart contract's logic. No one can bypass the consent mechanism.

  Key Learnings
    Developing this DApp provided hands-on experience in:
    CESS Blockchain Integration:** Connecting a React frontend to the CESS Testnet, demonstrating its compatibility with the EVM and existing tooling.
    Advanced Solidity Patterns:** Implementing a secure **Access Control List (ACL)** using mappings for granular, per-address consent (`mapping(address => mapping(address => bool)) private consentimento;`).
    Full-Stack Web3 Development:** Combining smart contract development, contract configuration (ABI/Address in `config.js`), and frontend state management (`wagmi`) in a single application.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 Core Functionality

  The `SCAD.sol` smart contract provides the following essential features:

   Registration Functions
* `registrarUsuario(cpf)`: Registers an individual user (11-digit CPF). Access is public, but only for non-registered users.
* `registrarEmpresa(cnpj)`: Registers a company (14-digit CNPJ). Access is public, but only for non-registered users.

    Consent Management
* `darConsentimento(autorizado, status)`: Grants (`true`) or revokes (`false`) permission for a specific authorized address to view the owner's data. Only registered users can execute this function.

    Query Functions
* `verMeuCadastro()`: Allows a registered user to view their own registered identifier.
* `verCadastroDe(usuario)`: Allows a user to query another address's identifier. **This function strictly requires explicit consent** from the target user to succeed.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 Technology Stack and Tools
    This project utilizes a robust set of tools for developing a professional EVM-compatible DApp:

Blockchain: CESS Testnet (EVM) - The target network for deployment and execution.
Smart Contract Language: Solidity (^0.8.20).
Contract Libraries: OpenZeppelin Contracts - Used for secure contract ownership (`Ownable.sol`).
Frontend Framework: React.
Web3 Layer: Wagmi & viem - Libraries for seamless wallet connection and on-chain interaction.
Package Manager: pnpm.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 Setup and Running the Project
    Follow these steps to get the DApp running locally.

  Prerequisites
Node.js (LTS version recommended)
pnpm (installed globally)
* A browser wallet (e.g., MetaMask) connected to the **CESS Testnet** (Chain ID: `11330`).


# Step 1: Install Dependencies (using pnpm)
  Install all necessary frontend packages:
```bash
pnpm install
```

# Step 2: Configure CESS Connection
  The project is configured to use the CESS Testnet. Verify the contract address and network ID:
  * **Chain ID:** `11330` (CESS Testnet)
  * **Contract Address:** `0xa412B45C8f7ec87282174Be04A5503723A278fE5` (As configured in `config.js`)

# Step 3: Run the DApp (using pnpm)
  Start the local development server:
```bash
pnpm run dev
```
  The DApp will be accessible in your web browser (e.g., `http://localhost:5173`). Connect your wallet to begin registration and consent management.
