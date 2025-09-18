import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Header } from './Header';
import { KYCSubmission } from './KYCSubmission';
import { KYCStatus } from './KYCStatus';

export function KYCApp() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'submit' | 'status'>('submit');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to access the KYC platform
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'submit'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Submit KYC
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'status'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
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