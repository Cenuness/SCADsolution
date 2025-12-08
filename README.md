SCAD – Secure Cadastro and Access Decentralized

A decentralized system for CPF/CNPJ registration and consent management on the CESS Testnet, ensuring full user control over personal data through smart contracts.

Overview

SCAD is a decentralized application (DApp) designed to eliminate centralized storage of sensitive identifiers such as CPF and CNPJ. Using the CESS Testnet blockchain, users retain full control over their information and share it only through explicit, verifiable on-chain consent.

Problem Addressed

Data breaches in centralized systems

Lack of control over how personal information is shared

Unnecessary intermediaries in verification processes

Limited auditability of access and consent events

Key Benefits

Full control by the data owner

Explicit, auditable on-chain consent

Removal of single points of failure

Privacy preserved by design

Architecture

SCAD implements a complete Web3 architecture combining Solidity smart contracts with a React frontend.

Main Components

Smart Contract SCAD.sol – handles registrations, ACL, and consent

CESS Testnet – EVM-compatible blockchain

React Frontend – user interface

Wagmi + Viem – wallet connection and EVM interaction

Operation Flow

User connects a wallet (MetaMask) to the frontend

Registers a CPF or CNPJ through the smart contract

Sets access permissions using darConsentimento

Third parties can only access data with prior valid consent

All events and operations are fully auditable on-chain

Technology Stack
Blockchain & Smart Contracts

CESS Testnet (Chain ID: 11330)

Solidity ^0.8.20

OpenZeppelin security standards

Hardhat for development and testing

Frontend

React 18 + TypeScript

Wagmi

Viem

Tailwind CSS

Getting Started
Requirements

Node.js 18+

MetaMask or any EVM-compatible wallet

Test account on the CESS Testnet

Basic knowledge of Solidity and React

Installation
# Clone the repository
git clone https://github.com/usuario/scad.git
cd scad

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Deploy to CESS Testnet
npx hardhat run scripts/deploy.js --network cess-testnet

# Run the frontend
npm run dev

License

This project is licensed under the MIT License.
Contributions are welcome via issues and pull requests.

Technical Notes
Problem Solved

Centralized sensitive data storage increases the risk of leaks and loss of control. SCAD decentralizes registration and relies exclusively on explicit user consent.

Key Learnings

Full EVM integration with CESS, OpenZeppelin security patterns, and a React + Wagmi architecture provided a secure and developer-friendly environment.

Core Stack Summary

CESS Testnet (Chain ID 11330)

Solidity

OpenZeppelin

React

Wagmi + Viem
