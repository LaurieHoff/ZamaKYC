# 🚀 ZamaKYC Sepolia Deployment Guide

## ✅ Setup Complete

Your project is now configured for Sepolia deployment! Here's what's been prepared:

### 📁 Configuration Files
- ✅ `.env` - Environment variables for deployment
- ✅ `hardhat.config.ts` - Updated to support private key deployment
- ✅ Frontend configs updated for Sepolia network
- ✅ Deployment scripts and guides created

## 🔧 Quick Start

### 1. Configure Your Environment

Edit `.env` file with your real credentials:

```bash
# Your wallet private key (with 0x prefix)
PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY

# Your Infura API key
INFURA_API_KEY=your_infura_api_key

# Your Etherscan API key (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Get Sepolia ETH

Visit: https://sepoliafaucet.com/

### 3. Deploy to Sepolia

```bash
# Simple deployment
npm run deploy:sepolia

# Or use the automated script (will update frontend configs)
npm run deploy:sepolia:full
```

### 4. Start Frontend

```bash
npm run frontend:dev
```

## 📋 Manual Deployment Steps

### Option A: Automated (Recommended)
```bash
npm run deploy:sepolia:full
```
This script will:
- Deploy contract to Sepolia
- Extract contract address
- Update frontend configuration automatically

### Option B: Manual Steps
```bash
# 1. Deploy contract
npm run deploy:sepolia

# 2. Copy the contract address from output

# 3. Update frontend/src/config/contracts.ts
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS';

# 4. Update frontend/src/config/zama.ts
network: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
```

## 🧪 Testing Deployment

After deployment, test with these commands:

```bash
# Check contract status
npx hardhat kyc:pending --contract YOUR_ADDRESS --network sepolia

# Submit test KYC (requires FHEVM initialization)
npx hardhat kyc:submit --contract YOUR_ADDRESS --name "123456789" --nationality "1" --birthyear "1990" --hash "999888777666" --network sepolia
```

## 🎯 Frontend Features

Once deployed, your frontend will have:

- ✅ **Sepolia Network Support**: Automatic network switching
- ✅ **Wallet Integration**: Rainbow Kit with Sepolia
- ✅ **KYC Submission**: Encrypted data submission form
- ✅ **Status Checking**: View and decrypt your KYC data
- ✅ **Mock IPFS**: Simulated document storage
- ✅ **Privacy Features**: FHE encryption (mocked for development)

## 🔍 Important Notes

### Security
- Never commit real private keys to version control
- `.env` file is already in `.gitignore`
- Use test keys for development only

### Zama Integration
- Current implementation uses **mock Zama functions**
- For production, replace with real Zama SDK initialization
- FHEVM integration may require additional setup

### Network Configuration
- Frontend configured for Sepolia (Chain ID: 11155111)
- Fallback support for localhost and hardhat networks
- Automatic wallet network detection

## 🛠 Available Scripts

```bash
npm run deploy:sepolia          # Deploy contract only
npm run deploy:sepolia:full     # Deploy + update frontend configs
npm run frontend:dev           # Start frontend dev server
npm run setup:sepolia          # Show setup instructions
```

## 📞 Support

If you encounter issues:

1. Check `.env` file has correct values
2. Ensure sufficient Sepolia ETH in wallet
3. Verify Infura API key is valid
4. Review deployment output for error messages

## 🎉 Success!

After successful deployment:
- Contract deployed to Sepolia testnet
- Frontend configured and running
- Ready for KYC submissions and testing
- Encrypted data processing with Zama FHE (mocked)

Your confidential KYC platform is ready for testing! 🔒