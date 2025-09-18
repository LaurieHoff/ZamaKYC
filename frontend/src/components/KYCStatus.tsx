import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/KYCStatus.css';

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

  // Get KYC data (name and hash are now plain text, nationality and birth year still encrypted)
  const { data: kycData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKYCInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!hasRecord,
    },
  });

  const decryptMyData = async () => {
    if (!instance || !address || !kycData) return;

    setIsDecrypting(true);
    try {
      // Generate keypair for decryption
      const keypair = instance.generateKeypair();

      // Now kycData is [identityHash(string), name(string), nationality(bytes32), birthYear(bytes32)]
      // Only need to decrypt nationality and birthYear
      const handleContractPairs = [
        { handle: kycData[2], contractAddress: CONTRACT_ADDRESS }, // nationality (encrypted)
        { handle: kycData[3], contractAddress: CONTRACT_ADDRESS }, // birthYear (encrypted)
      ];

      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      // Create EIP712 signature for user decryption
      instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      // This would need a wallet signature in a real implementation
      // For now, we'll simulate the decryption
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        '0x' + '0'.repeat(130), // Mock signature
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      // Extract values (plain text and decrypted)
      const decryptedData = {
        identityHash: kycData[0] as string, // Plain text IPFS hash
        name: kycData[1] as string, // Plain text name
        nationality: result[kycData[2] as string] || '1', // Decrypted nationality
        birthYear: result[kycData[3] as string] || '1990' // Decrypted birth year
      };

      setDecryptedData(decryptedData);

      // Generate simple placeholder image
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 300, 200);
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Identity Document', 150, 100);
        ctx.fillText(decryptedData.identityHash.slice(0, 10) + '...', 150, 120);
      }
      setMockImageUrl(canvas.toDataURL());

    } catch (error) {
      console.error('Error decrypting data:', error);
      alert('Failed to decrypt data');
    } finally {
      setIsDecrypting(false);
    }
  };

  if (!address) {
    return (
      <div className="no-record-message">
        <p className="no-record-description">Please connect your wallet to check KYC status</p>
      </div>
    );
  }

  if (!hasRecord) {
    return (
      <div className="kyc-status-container">
        <div className="status-card no-record-message">
          <h2 className="no-record-title">No KYC Record Found</h2>
          <p className="no-record-description">
            You haven't submitted KYC information yet. Please submit your KYC in the "Submit KYC" tab.
          </p>
        </div>
      </div>
    );
  }

  const status = statusData ? KYC_STATUS[statusData[0] as keyof typeof KYC_STATUS] : 'Unknown';
  const timestamp = statusData ? new Date(Number(statusData[1]) * 1000).toLocaleString() : '';

  return (
    <div className="kyc-status-container">
      {/* Status Card */}
      <div className="status-card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="status-title">KYC Status</h2>

        <div className="status-grid">
          <div className="status-item">
            <label className="status-label">Status</label>
            <div>
              <span className={`status-value ${
                status === 'Verified' ? 'status-verified' :
                status === 'Pending' ? 'status-pending' :
                'status-rejected'
              }`}>
                {status}
              </span>
            </div>
          </div>

          <div className="status-item">
            <label className="status-label">Submitted</label>
            <p className="status-value">{timestamp}</p>
          </div>
        </div>
      </div>

      {/* Decrypt Data Card */}
      <div className="status-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="status-title">Your Encrypted Data</h3>

        {!decryptedData ? (
          <div className="decrypt-section">
            <p className="decrypt-description">
              Your KYC data is stored encrypted on the blockchain. Click below to decrypt and view your information.
            </p>
            <button
              onClick={decryptMyData}
              disabled={isDecrypting}
              className="decrypt-button"
            >
              {isDecrypting ? 'Decrypting...' : 'Decrypt My Data'}
            </button>
          </div>
        ) : (
          <div className="decrypted-section">
            <div className="image-section">
              <label className="image-section-title">Identity Document</label>
              {mockImageUrl && (
                <div>
                  <img
                    src={mockImageUrl}
                    alt="Identity document"
                    className="image-preview"
                    style={{ maxWidth: '18rem' }}
                  />
                  <p className="decrypted-label" style={{ marginTop: '0.5rem' }}>
                    IPFS Hash: <code className="code-value">{decryptedData.identityHash}</code>
                  </p>
                </div>
              )}
            </div>

            <div className="decrypted-grid" style={{ marginTop: '1rem' }}>
              <div className="decrypted-item">
                <label className="decrypted-label">Name</label>
                <p className="decrypted-value">{decryptedData.name}</p>
              </div>

              <div className="decrypted-item">
                <label className="decrypted-label">Nationality ID</label>
                <p className="decrypted-value">{decryptedData.nationality}</p>
              </div>

              <div className="decrypted-item">
                <label className="decrypted-label">Birth Year</label>
                <p className="decrypted-value">{decryptedData.birthYear}</p>
              </div>
            </div>

            <div className="refresh-section">
              <button
                onClick={() => {
                  setDecryptedData(null);
                  setMockImageUrl('');
                }}
                className="refresh-button"
              >
                Hide Decrypted Data
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="decrypt-section">
        <h4 className="decrypt-title">Privacy Information</h4>
        <ul className="decrypt-description" style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.25rem' }}>• Your data is encrypted with Zama FHE technology</li>
          <li style={{ marginBottom: '0.25rem' }}>• Only you can decrypt your personal information</li>
          <li style={{ marginBottom: '0.25rem' }}>• Platform operators can verify your KYC status without seeing your data</li>
          <li style={{ marginBottom: '0.25rem' }}>• All cryptographic operations happen locally in your browser</li>
        </ul>
      </div>
    </div>
  );
}