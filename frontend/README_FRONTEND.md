# ZamaKYC Frontend

A confidential KYC platform built with React, Vite, Viem, Rainbow Kit, and Zama FHE technology.

## Features

- **Confidential KYC Submission**: Upload identity documents and personal information with full encryption
- **Mock IPFS Integration**: Simulated IPFS hash generation for identity documents
- **Encrypted Data Storage**: All personal data is encrypted using Zama FHE before blockchain storage
- **User Decryption**: Users can decrypt and view their own KYC information
- **Status Tracking**: Check KYC verification status (Pending/Verified/Rejected)
- **Wallet Integration**: Connect with popular wallets using Rainbow Kit

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Ethereum (localhost/hardhat for development)
- **Encryption**: Zama Fully Homomorphic Encryption (FHE)
- **Wallet**: Rainbow Kit + Wagmi + Viem
- **Styling**: Custom CSS utilities (no Tailwind per project requirements)

## Getting Started

### Prerequisites

1. Node.js and npm installed
2. Local Ethereum node running (hardhat/anvil)
3. ZamaKYC smart contract deployed to localhost

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5176`

### Configuration

The app is pre-configured to work with:
- **Contract Address**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Network**: Localhost (Chain ID: 31337)
- **RPC**: `http://localhost:8545`

## Usage

### 1. Connect Wallet
- Click "Connect Wallet" and select your wallet
- Make sure you're connected to the localhost network

### 2. Submit KYC
- Go to the "Submit KYC" tab
- Upload an identity document image (simulated IPFS upload)
- Enter personal information:
  - Name (as number)
  - Nationality ID (select from dropdown)
  - Birth year
- Click "Submit KYC" to encrypt and store data

### 3. Check Status
- Go to the "Check Status" tab
- View your KYC verification status
- Click "Decrypt My Data" to view your encrypted information
- See the mock identity document image

## Privacy Features

- **End-to-end Encryption**: All data encrypted before leaving your browser
- **Zero-knowledge Verification**: Platform can verify KYC status without seeing personal data
- **User-controlled Decryption**: Only you can decrypt your personal information
- **Mock IPFS**: Identity documents stored as mock IPFS hashes with generated images

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── KYCApp.tsx      # Main application component
│   ├── Header.tsx      # Navigation header
│   ├── KYCSubmission.tsx # KYC submission form
│   └── KYCStatus.tsx   # Status checking and decryption
├── config/             # Configuration files
│   ├── contracts.ts    # Contract address and ABI
│   ├── wagmi.ts       # Wallet configuration
│   └── zama.ts        # Zama FHE configuration
├── hooks/              # React hooks
│   └── useZamaInstance.ts # Zama FHE instance management
├── utils/              # Utility functions
│   └── mockIPFS.ts    # Mock IPFS functions
└── index.css          # Custom CSS utilities
```

### Mock Components

Since this is a demo application, several components are mocked:

- **Zama SDK**: Uses mock encryption functions for development
- **IPFS**: Generates mock hashes and images from uploaded files
- **Image Storage**: Creates procedural images based on IPFS hashes

### Real Implementation Notes

For production deployment:

1. **Zama Integration**: Replace mock functions with real Zama SDK calls
2. **IPFS Integration**: Implement real IPFS upload/download
3. **Network Configuration**: Configure for testnet/mainnet
4. **Error Handling**: Add comprehensive error handling
5. **Security**: Implement proper key management and signatures

## Testing

The frontend is designed to work with the deployed ZamaKYC smart contract. Ensure:

1. Local blockchain is running (`npx hardhat node`)
2. ZamaKYC contract is deployed
3. Frontend points to correct contract address

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Rainbow Kit** - Wallet connection UI
- **Zama FHE** - Fully homomorphic encryption (mocked for demo)

## License

This project is part of the ZamaKYC confidential KYC platform.