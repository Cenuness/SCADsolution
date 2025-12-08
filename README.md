-----

# SCAD – Secure Cadastro and Access Decentralized

**A decentralized system for CPF/CNPJ registration and consent management on the CESS Testnet, ensuring full user control over personal data through smart contracts.**

-----

## Overview

**SCAD** is a pioneering **Decentralized Application (DApp)** designed to **eliminate the centralized storage** of sensitive identifiers such as **CPF** and **CNPJ**.

Leveraging the **CESS Testnet** blockchain, users retain complete control over their information, sharing it only through **explicit, verifiable, and fully on-chain consent**.

-----

## Problem Addressed

| Centralized Problem | Decentralized Solution (SCAD) |
| :--- | :--- |
| Data breaches in centralized systems (SPOF). | **Decentralization** and **Cryptographic Security** of the Blockchain. |
| Lack of control over how personal information is shared. | **Total Control** via Smart Contracts and **Explicit Consent**. |
| Unnecessary intermediaries in verification processes. | **Peer-to-Peer Verification** and **Immutability of Records**. |
| Limited auditability of access and consent events. | **Complete and Transparent On-chain Auditing**. |

-----

## Key Benefits

  * **Full control** by the data owner.
  * **Explicit, auditable on-chain consent**.
  * **Removal of Single Points of Failure (SPOF)**.
  * **Privacy preserved** by design (Privacy by Design).

-----

## Architecture

SCAD implements a complete **Web3** architecture, combining robust **Solidity** Smart Contracts with an intuitive **React** frontend.

### Main Components

1.  **Smart Contract `SCAD.sol`**: Handles core logic for registrations, Access Control List (ACL), and consent management (`darConsentimento`).
2.  **CESS Testnet**: EVM-compatible blockchain that hosts the contracts.
3.  **React Frontend**: User interface for interaction.
4.  **Wagmi + Viem**: Libraries for wallet connection and on-chain interaction with the EVM.

-----

## Operation Flow

1.  The user connects a wallet (e.g., **MetaMask**) to the frontend.
2.  Registers a **CPF** or **CNPJ** through the Smart Contract function.
3.  Sets access permissions (who can consult) using the `darConsentimento` function.
4.  Third parties can only access and consult the registration status with **prior, valid consent**.
5.  All events and operations are **fully auditable** on-chain.

-----

## Technology Stack

### Blockchain & Smart Contracts

| Component | Detail |
| :--- | :--- |
| **Blockchain** | CESS Testnet (Chain ID: 11330) |
| **Language** | Solidity `^0.8.20` |
| **Security** | **OpenZeppelin** security standards |
| **Development** | **Hardhat** for compilation and testing |

### Frontend

| Component | Detail |
| :--- | :--- |
| **Framework** | React 18 + TypeScript |
| **EVM Connection** | **Wagmi** & **Viem** |
| **Styling** | **Tailwind CSS** |

-----

## Getting Started

### Requirements

  * **Node.js** 18+
  * **MetaMask** or any EVM-compatible wallet
  * Test account on the **CESS Testnet**
  * Basic knowledge of Solidity and React

### Installation

```bash
# Clone the repository
git clone https://github.com/usuario/scad.git
cd scad

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Deploy to CESS Testnet (Requires setup in hardhat.config.js)
npx hardhat run scripts/deploy.js --network cess-testnet

# Run the frontend
npm run dev
```

-----

## Technical Notes

### Problem Solved

Centralized sensitive data storage increases the risk of leaks and loss of control. **SCAD** solves this by **decentralizing registration** and relying **exclusively on explicit user consent** for access.

### Key Learnings

Full EVM integration with CESS, the use of OpenZeppelin security patterns, and a React + Wagmi architecture provided a secure and developer-friendly environment.

### Core Stack Summary

  * **CESS Testnet** (Chain ID 11330)
  * **Solidity**
  * **OpenZeppelin**
  * **React**
  * **Wagmi + Viem**

-----

## License

This project is licensed under the **MIT License**.

## Contributions

Contributions are welcome via issues and pull requests.

-----

Would you like me to generate a specific badge section (e.g., for License and Stack) for this README?
