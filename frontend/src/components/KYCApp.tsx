import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Header } from './Header';
import { KYCSubmission } from './KYCSubmission';
import { KYCStatus } from './KYCStatus';
import '../styles/KYCApp.css';

export function KYCApp() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'submit' | 'status'>('submit');

  return (
    <div className="kyc-app">
      <Header />

      <main className="main-content">
        {!isConnected ? (
          <div className="connect-wallet-container">
            <h2 className="connect-wallet-title">
              Connect Your Wallet
            </h2>
            <p className="connect-wallet-description">
              Please connect your wallet to access the KYC platform
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div>
            <div className="tab-navigation">
              <nav className="tab-nav">
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`tab-button ${activeTab === 'submit' ? 'active' : 'inactive'}`}
                >
                  Submit KYC
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={`tab-button ${activeTab === 'status' ? 'active' : 'inactive'}`}
                >
                  Check Status
                </button>
              </nav>
            </div>

            {activeTab === 'submit' && <KYCSubmission />}
            {activeTab === 'status' && <KYCStatus />}
          </div>
        )}
      </main>
    </div>
  );
}