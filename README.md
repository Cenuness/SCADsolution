
#  SCAD – Secure Cadastro and Access Decentralized

**Um sistema descentralizado para registro de CPF/CNPJ e gestão de consentimento na CESS Testnet, garantindo controle total do usuário sobre os dados pessoais através de Smart Contracts.**

-----

##  Overview

**SCAD** é uma **Aplicação Descentralizada (DApp)** pioneira, concebida para **eliminar o armazenamento centralizado** de identificadores sensíveis como **CPF** e **CNPJ**.

Utilizando a blockchain **CESS Testnet**, os usuários mantêm o controle completo sobre suas informações e só as compartilham mediante **consentimento explícito**, verificável e totalmente *on-chain*.

##  Problemática Endereçada

| Problema Centralizado | Solução Descentralizada (SCAD) |
| :--- | :--- |
| Vazamento de dados em sistemas centralizados (SPOF). | **Descentralização** e **Segurança Criptográfica** da Blockchain. |
| Falta de controle do usuário sobre o compartilhamento de dados. | **Controle Total** através de *Smart Contracts* e **Consentimento Explícito**. |
| Intermediários desnecessários no processo de verificação. | **Verificação *Peer-to-Peer*** e **Imutabilidade de Registros**. |
| Auditabilidade limitada de acessos e eventos de consentimento. | **Auditoria Completa e Transparente** (*on-chain*). |

-----

##  Key Benefits

  * **Controle Total** pelo proprietário dos dados.
  * **Consentimento Explícito** e auditável *on-chain*.
  * **Remoção de Pontos Únicos de Falha (SPOF)**.
  * **Privacidade Preservada** por design (Privacy by Design).

-----

##  Architecture

SCAD implementa uma arquitetura **Web3** completa, combinando *Smart Contracts* **Solidity** robustos com um *frontend* **React** intuitivo.

### Main Components

1.  **Smart Contract `SCAD.sol`**: Lógica principal para registros, *Access Control List* (ACL) e gestão de consentimento (`darConsentimento`).
2.  **CESS Testnet**: Blockchain compatível com EVM que hospeda os contratos.
3.  **React Frontend**: Interface de usuário para interação.
4.  **Wagmi + Viem**: Bibliotecas para conexão de carteira e interação *on-chain* com o EVM.

-----

##  Operation Flow

1.  O usuário conecta sua carteira (ex: **MetaMask**) ao *frontend*.
2.  Registra seu **CPF** ou **CNPJ** através da função do *Smart Contract*.
3.  Define permissões de acesso (quem pode consultar) utilizando a função `darConsentimento`.
4.  Terceiros só podem acessar e consultar o status do registro com um **consentimento prévio e válido**.
5.  Todos os eventos e operações são **totalmente auditáveis** na blockchain.

-----

##  Technology Stack

### Blockchain & Smart Contracts

| Componente | Detalhe |
| :--- | :--- |
| **Blockchain** | CESS Testnet (Chain ID: 11330) |
| **Linguagem** | Solidity `^0.8.20` |
| **Segurança** | Padrões de segurança **OpenZeppelin** |
| **Desenvolvimento** | **Hardhat** para compilação e testes |

### Frontend

| Componente | Detalhe |
| :--- | :--- |
| **Framework** | React 18 + TypeScript |
| **Conexão EVM** | **Wagmi** & **Viem** |
| **Estilização** | **Tailwind CSS** |

-----

## 🏁 Getting Started

### Requirements

  * **Node.js** 18+
  * **MetaMask** ou qualquer carteira compatível com EVM
  * Conta de teste na **CESS Testnet**
  * Conhecimento básico de Solidity e React

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

##  Technical Notes

### Solução Proposta

O armazenamento centralizado de dados sensíveis aumenta drasticamente o risco de vazamentos e perda de controle. O **SCAD** resolve isso ao **descentralizar o registro** e confiar **exclusivamente no consentimento explícito** do usuário para acesso.

### Principais Aprendizados

A integração completa do EVM com a CESS, o uso de padrões de segurança OpenZeppelin e a arquitetura React + Wagmi proporcionaram um ambiente seguro e amigável ao desenvolvedor.

### Core Stack Summary

  * **CESS Testnet** (Chain ID 11330)
  * **Solidity**
  * **OpenZeppelin**
  * **React**
  * **Wagmi + Viem**

-----

##  License

Este projeto está licenciado sob a **MIT License**.
