#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 路径配置
const CONTRACT_ARTIFACT_PATH = './artifacts/contracts/ZamaKYC.sol/ZamaKYC.json';
const FRONTEND_CONTRACT_CONFIG_PATH = './frontend/src/config/contracts.ts';

console.log('🔄 开始同步合约ABI到前端...');

try {
  // 读取合约artifact文件
  if (!fs.existsSync(CONTRACT_ARTIFACT_PATH)) {
    console.error('❌ 合约artifact文件不存在:', CONTRACT_ARTIFACT_PATH);
    console.log('💡 请先编译合约: npx hardhat compile');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(CONTRACT_ARTIFACT_PATH, 'utf8'));
  const abi = artifact.abi;

  // 读取前端配置文件
  if (!fs.existsSync(FRONTEND_CONTRACT_CONFIG_PATH)) {
    console.error('❌ 前端合约配置文件不存在:', FRONTEND_CONTRACT_CONFIG_PATH);
    process.exit(1);
  }

  const frontendConfig = fs.readFileSync(FRONTEND_CONTRACT_CONFIG_PATH, 'utf8');

  // 提取当前合约地址
  const addressMatch = frontendConfig.match(/export const CONTRACT_ADDRESS = '([^']+)';/);
  const contractAddress = addressMatch ? addressMatch[1] : '0x2a25912F7570Db983d7881BEF6BF71E8b2810c31';

  // 生成新的ABI配置
  const abiString = JSON.stringify(abi, null, 2);
  const newContent = `// ZamaKYC contract deployed on Sepolia
export const CONTRACT_ADDRESS = '${contractAddress}';

// Generated ABI from contract artifacts - Auto-synced from ZamaKYC.json
export const CONTRACT_ABI = ${abiString} as const;
`;

  // 写入前端配置文件
  fs.writeFileSync(FRONTEND_CONTRACT_CONFIG_PATH, newContent, 'utf8');

  console.log('✅ ABI同步完成!');
  console.log(`📄 ABI包含 ${abi.length} 个函数和事件`);
  console.log(`📁 已更新文件: ${FRONTEND_CONTRACT_CONFIG_PATH}`);

  // 显示主要函数
  const functions = abi.filter(item => item.type === 'function').map(item => item.name);
  console.log('🔧 合约函数:', functions.join(', '));

} catch (error) {
  console.error('❌ 同步ABI时出错:', error.message);
  process.exit(1);
}