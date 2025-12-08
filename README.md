SCAD - Secure Cadastro and Access Decentralized
Um sistema descentralizado de registro e gerenciamento de consentimento para CPF/CNPJ na CESS Testnet, garantindo controle total dos dados pelos titulares através de smart contracts.

🚀 Visão Geral do Projeto
SCAD é uma aplicação descentralizada (DApp) revolucionária que resolve o problema da centralização de dados sensíveis como CPF e CNPJ. Utilizando a tecnologia blockchain da CESS Testnet, o sistema permite que usuários mantenham controle total sobre suas informações, compartilhando-as apenas mediante consentimento explícito registrado on-chain.

🎯 Problema Solucionado
• Vazamentos de dados em sistemas centralizados
• Falta de controle sobre compartilhamento de informações
• Intermediários desnecessários no processo de verificação
• Auditoria complexa de acessos e consentimentos
✅ Benefícios Principais
• Controle total pelo titular dos dados
• Consentimento explícito e auditável
• Eliminação de pontos únicos de falha
• Privacidade preservada por design
🛠️ Arquitetura Técnica
O projeto SCAD implementa uma arquitetura completa Web3, combinando smart contracts Solidity com frontend React e integração via Wagmi para carteiras EVM.

Componentes Principais:
●
Smart Contract SCAD.sol: Gerencia registros, ACL e consentimentos
●
CESS Testnet: Blockchain EVM compatível para部署
●
Frontend React: Interface para interação com o contrato
●
Wagmi + Viem: Conexão segura com carteiras e blockchain
Fluxo de Operação:
Usuário conecta carteira (MetaMask) ao frontend
Registra CPF ou CNPJ através do smart contract
Define permissões de acesso via função darConsentimento
Terceiros só acessam dados mediante consentimento prévio
Todas as operações são registradas e auditáveis on-chain
📦 Stack de Tecnologias
Blockchain & Smart Contracts
• CESS Testnet (Chain ID: 11330)
• Solidity ^0.8.20
• OpenZeppelin para padrões de segurança
• Hardhat para desenvolvimento e testes
Frontend & Integração
• React 18 com TypeScript
• Wagmi para conexão Web3
• Viem para interações EVM
• Tailwind CSS para estilização
🚀 Como Começar
Pré-requisitos:
Node.js 18+ instalado
MetaMask ou carteira EVM compatível
Contas de teste na CESS Testnet
Conhecimento básico de Solidity e React
Instalação e Execução:
Setup do Projeto

# Clonar o repositório
git clone https://github.com/usuario/scad.git
cd scad

# Instalar dependências
npm install

# Compilar contratos
npx hardhat compile

# Deploy na CESS Testnet
npx hardhat run scripts/deploy.js --network cess-testnet

# Iniciar frontend
npm run dev
📄 Licença e Contribuição
Este projeto está licenciado sob MIT License. Contribuições são bem-vindas! Por favor, abra issues para bugs ou pull requests para melhorias.

MIT License
Web3
DeFi
Privacy
Blockchain
CESS Testnet · EVM
•
Privacidade por consentimento
Documentação Técnica Detalhada
Problema resolvido
Centralização de registros sensíveis gera riscos de vazamento e perda de controle. SCAD descentraliza o cadastro e confia apenas no consentimento do titular.

Baseado em requisitos de privacidade e identidade digital.

scad-docs.local
Aprendizado chave
Integração completa EVM (CESS), padrões OpenZeppelin e frontend React com Wagmi mostrou como manter segurança e DX alinhadas.

Relatório interno de arquitetura.

scad-docs.local
Stack essencial
CESS Testnet (Chain ID 11330), Solidity ^0.8.20, OpenZeppelin, React e Wagmi + viem formam o combo que sustenta registros e consentimentos.

Configuração declarada no repositório oficial.

scad-docs.local
