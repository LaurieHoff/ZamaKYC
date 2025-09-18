# Sepolia Deployment Guide

## Prerequisites

1. **Get Sepolia ETH**: Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH
2. **Create Infura Account**: Get API key from [Infura](https://infura.io/)
3. **Get Etherscan API Key** (optional): From [Etherscan](https://etherscan.io/apis)

## Step 1: Configure Environment Variables

Edit the `.env` file in the project root:

```bash
# Your wallet private key (starts with 0x)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Your Infura project API key
INFURA_API_KEY=your_infura_api_key_here

# Your Etherscan API key (optional, for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Step 2: Deploy Contract to Sepolia

```bash
# Deploy the ZamaKYC contract
npx hardhat deploy --network sepolia

# The output will show the deployed contract address
# Save this address for frontend configuration
```

## Step 3: Update Frontend Configuration

After deployment, update the contract address in:
`frontend/src/config/contracts.ts`

```typescript
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';
```

## Step 4: Test Deployment

Test the contract deployment:

```bash
# Check deployed contract info
npx hardhat kyc:pending --contract YOUR_DEPLOYED_ADDRESS --network sepolia

# Submit test KYC (will need FHEVM initialization)
npx hardhat kyc:submit --contract YOUR_DEPLOYED_ADDRESS --name "123456789" --nationality "1" --birthyear "1990" --hash "999888777666" --network sepolia
```

## Step 5: Update Frontend Environment

Update `frontend/src/config/zama.ts` with your Infura key:

```typescript
network: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
```

## Step 6: Start Frontend

```bash
cd frontend
npm run dev
```

## Expected Output

After successful deployment, you should see:

1. Contract deployed to Sepolia with an address
2. Frontend configured to use Sepolia network
3. Wallet connection works with Sepolia
4. KYC submission and status checking functional

## Troubleshooting

1. **FHEVM Plugin Issues**: The FHEVM plugin needs proper configuration for Sepolia
2. **Gas Errors**: Ensure you have enough Sepolia ETH
3. **Network Issues**: Check Infura API key and network connectivity
4. **Zama Integration**: May need proper Zama SDK initialization for live deployment

## Security Notes

- Never commit real private keys to version control
- Use environment variables for sensitive data
- The current setup uses mock Zama functions - replace with real SDK for production
- Test thoroughly on Sepolia before any mainnet deployment