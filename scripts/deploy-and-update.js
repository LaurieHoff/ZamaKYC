const fs = require('fs');
const path = require('path');

async function deployAndUpdate() {
  console.log('🚀 Starting Sepolia deployment and frontend update...\n');

  // Check if environment variables are set
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.error('❌ Please set PRIVATE_KEY in .env file');
    process.exit(1);
  }

  if (!process.env.INFURA_API_KEY || process.env.INFURA_API_KEY === 'your_infura_api_key_here') {
    console.error('❌ Please set INFURA_API_KEY in .env file');
    process.exit(1);
  }

  try {
    // 1. Deploy contract
    console.log('📡 Deploying contract to Sepolia...');
    const { execSync } = require('child_process');

    const deployOutput = execSync('npx hardhat deploy --network sepolia', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    console.log(deployOutput);

    // Extract contract address from deployment output
    // This would need to be adjusted based on actual deployment output format
    const addressMatch = deployOutput.match(/deployed to:\s*(0x[a-fA-F0-9]{40})/);

    if (!addressMatch) {
      console.error('❌ Could not extract contract address from deployment output');
      console.log('Please manually update the contract address in frontend/src/config/contracts.ts');
      return;
    }

    const contractAddress = addressMatch[1];
    console.log(`✅ Contract deployed to: ${contractAddress}`);

    // 2. Update frontend configuration
    console.log('📝 Updating frontend configuration...');

    const contractsConfigPath = path.join(__dirname, '../frontend/src/config/contracts.ts');
    let contractsConfig = fs.readFileSync(contractsConfigPath, 'utf8');

    // Replace the placeholder address
    contractsConfig = contractsConfig.replace(
      /CONTRACT_ADDRESS = '[^']*'/,
      `CONTRACT_ADDRESS = '${contractAddress}'`
    );

    fs.writeFileSync(contractsConfigPath, contractsConfig);

    // 3. Update Zama config with Infura key
    const zamaConfigPath = path.join(__dirname, '../frontend/src/config/zama.ts');
    let zamaConfig = fs.readFileSync(zamaConfigPath, 'utf8');

    zamaConfig = zamaConfig.replace(
      /network: "[^"]*"/,
      `network: "https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}"`
    );

    fs.writeFileSync(zamaConfigPath, zamaConfig);

    console.log('✅ Frontend configuration updated');
    console.log('\n🎉 Deployment complete!');
    console.log('\nNext steps:');
    console.log('1. cd frontend');
    console.log('2. npm run dev');
    console.log('3. Connect to Sepolia network in your wallet');
    console.log(`4. Contract address: ${contractAddress}`);

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('\nPlease check:');
    console.log('- .env file has correct PRIVATE_KEY and INFURA_API_KEY');
    console.log('- Account has sufficient Sepolia ETH');
    console.log('- Network connectivity is working');
  }
}

// Run the deployment if called directly
if (require.main === module) {
  deployAndUpdate();
}

module.exports = { deployAndUpdate };