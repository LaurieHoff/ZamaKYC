import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ZamaKYC',
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [sepolia, hardhat, localhost],
  ssr: false,
});