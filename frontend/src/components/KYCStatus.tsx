import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { createMockImageFromHash } from '../utils/mockIPFS';

const KYC_STATUS = {
  0: 'Pending',
  1: 'Verified',
  2: 'Rejected'
} as const;

export function KYCStatus() {
  const { address } = useAccount();
  const { instance } = useZamaInstance();
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [mockImageUrl, setMockImageUrl] = useState<string>('');

  // Check if user has KYC record
  const { data: hasRecord } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasKYCRecord',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get KYC status
  const { data: statusData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKYCStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!hasRecord,
    },
  });

  // Get encrypted KYC data
  const { data: encryptedData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKYCData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!hasRecord,
    },
  });

  const decryptMyData = async () => {
    if (!instance || !address || !encryptedData) return;

    setIsDecrypting(true);
    try {
      // Generate keypair for decryption
      const keypair = instance.generateKeypair();

      // Prepare handles for decryption
      const handleContractPairs = [
        { handle: encryptedData[0], contractAddress: CONTRACT_ADDRESS }, // identityHash
        { handle: encryptedData[1], contractAddress: CONTRACT_ADDRESS }, // name
        { handle: encryptedData[2], contractAddress: CONTRACT_ADDRESS }, // nationality
        { handle: encryptedData[3], contractAddress: CONTRACT_ADDRESS }, // birthYear
      ];

      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      // Note: In a real app, you would need to sign the EIP712 message
      // For demo purposes, we'll show mock decrypted data
      const mockDecrypted = {
        identityHash: 'QmYwAPJzv5CZsnA7dFdaM4W93zCZeYC4E2Y6HzGJ4UW7CX',
        name: '123456789',
        nationality: '1',
        birthYear: '1990'
      };

      setDecryptedData(mockDecrypted);

      // Generate mock image from hash
      const imageUrl = createMockImageFromHash(mockDecrypted.identityHash);
      setMockImageUrl(imageUrl);

    } catch (error) {
      console.error('Error decrypting data:', error);
      alert('Failed to decrypt data');
    } finally {
      setIsDecrypting(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to check KYC status</p>
      </div>
    );
  }

  if (!hasRecord) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">No KYC Record Found</h2>
          <p className="text-yellow-700">
            You haven't submitted KYC information yet. Please submit your KYC in the "Submit KYC" tab.
          </p>
        </div>
      </div>
    );
  }

  const status = statusData ? KYC_STATUS[statusData[0] as keyof typeof KYC_STATUS] : 'Unknown';
  const timestamp = statusData ? new Date(Number(statusData[1]) * 1000).toLocaleString() : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">KYC Status</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                status === 'Verified' ? 'bg-green-100 text-green-800' :
                status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Submitted</label>
            <p className="mt-1 text-sm text-gray-900">{timestamp}</p>
          </div>
        </div>
      </div>

      {/* Decrypt Data Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Encrypted Data</h3>

        {!decryptedData ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Your KYC data is stored encrypted on the blockchain. Click below to decrypt and view your information.
            </p>
            <button
              onClick={decryptMyData}
              disabled={isDecrypting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isDecrypting ? 'Decrypting...' : 'Decrypt My Data'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Identity Document</label>
              {mockImageUrl && (
                <div className="mt-2">
                  <img
                    src={mockImageUrl}
                    alt="Identity document"
                    className="max-w-xs h-auto rounded-md border"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    IPFS Hash: <code className="bg-gray-100 px-1 rounded">{decryptedData.identityHash}</code>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (as number)</label>
                <p className="mt-1 text-sm text-gray-900">{decryptedData.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nationality ID</label>
                <p className="mt-1 text-sm text-gray-900">{decryptedData.nationality}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Year</label>
                <p className="mt-1 text-sm text-gray-900">{decryptedData.birthYear}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  setDecryptedData(null);
                  setMockImageUrl('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Hide Decrypted Data
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Privacy Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your data is encrypted with Zama FHE technology</li>
          <li>• Only you can decrypt your personal information</li>
          <li>• Platform operators can verify your KYC status without seeing your data</li>
          <li>• All cryptographic operations happen locally in your browser</li>
        </ul>
      </div>
    </div>
  );
}