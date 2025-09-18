import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ZamaKYC',
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [hardhat, localhost],
  ssr: false,
});