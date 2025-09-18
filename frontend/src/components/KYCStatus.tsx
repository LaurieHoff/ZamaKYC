import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import '../styles/KYCStatus.css';

const KYC_STATUS = {
  0: 'Pending',
  1: 'Verified',
  2: 'Rejected'
} as const;

const NATIONALITY_MAP = {
  1: 'USA',
  2: 'China',
  3: 'UK',
  4: 'Germany',
  5: 'France',
  86: 'Other'
} as const;


export function KYCStatus() {
  const { address } = useAccount();
  const { instance } = useZamaInstance();
  const signer = useEthersSigner();
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showImage, setShowImage] = useState(false);

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
    if (!instance || !address || !kycData || !signer) {
      alert('Missing required components for decryption');
      return;
    }

    setIsDecrypting(true);
    try {
      // Step 1: Generate keypair for user decryption
      const keypair = instance.generateKeypair();

      // Step 2: Prepare ciphertext handles for decryption
      // kycData is [identityHash(string), name(string), nationality(euint32), birthYear(euint32)]
      const handleContractPairs = [
        {
          handle: kycData[2], // nationality (encrypted)
          contractAddress: CONTRACT_ADDRESS
        },
        {
          handle: kycData[3], // birthYear (encrypted)
          contractAddress: CONTRACT_ADDRESS
        }
      ];

      // Step 3: Setup decryption parameters
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      // Step 4: Create EIP712 message for signing
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      // Step 5: Sign the EIP712 message with user's wallet
      const resolvedSigner = await signer;
      if (!resolvedSigner) {
        throw new Error('Signer not available');
      }

      const signature = await resolvedSigner.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message
      );

      // Step 6: Perform user decryption through Relayer
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      // Step 7: Extract decrypted values
      const decryptedData = {
        identityHash: kycData[0] as string, // Plain text IPFS hash
        name: kycData[1] as string, // Plain text name
        nationality: result[kycData[2] as string] || '1', // Decrypted nationality
        birthYear: result[kycData[3] as string] || '1990' // Decrypted birth year
      };

      setDecryptedData(decryptedData);

    } catch (error) {
      console.error('Error decrypting data:', error);
      alert(`Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      {/* KYC Information Card */}
      <div className="status-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="status-title">Your KYC Information</h3>

        {/* Always show basic info with encrypted fields as *** */}
        <div className="kyc-info-section">
          {kycData && (
            <div>
              {/* Identity Document Image */}
              <div className="image-section">
                <label className="image-section-title">Identity Document</label>
                <div className="image-container">
                  {!showImage ? (
                    <div className="image-placeholder">
                      <p>📄 Document stored securely</p>
                      {kycData[0] && (
                        <p className="ipfs-hash">Hash: {(kycData[0] as string).slice(0, 15)}...</p>
                      )}
                      <button
                        onClick={() => setShowImage(true)}
                        className="show-button"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          marginTop: '0.5rem'
                        }}
                      >
                        👁️ Show Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <img
                        src="/avatar.jpg"
                        alt="Identity document"
                        className="image-preview"
                        style={{ maxWidth: '18rem', maxHeight: '12rem', objectFit: 'contain' }}
                      />
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <a
                          href="/avatar.jpg"
                          download="identity-document.jpg"
                          className="download-button"
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          📥 Download
                        </a>
                        <button
                          onClick={() => setShowImage(false)}
                          className="hide-button"
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          🙈 Hide
                        </button>
                        {kycData[0] && (
                          <span className="decrypted-label">
                            IPFS Hash: <code className="code-value">{kycData[0] as string}</code>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information Grid */}
              <div className="decrypted-grid" style={{ marginTop: '1rem' }}>
                <div className="decrypted-item">
                  <label className="decrypted-label">Name</label>
                  <p className="decrypted-value">{kycData[1] as string || 'Not available'}</p>
                </div>

                <div className="decrypted-item">
                  <label className="decrypted-label">Nationality</label>
                  <p className="decrypted-value">
                    {decryptedData ?
                      (NATIONALITY_MAP[decryptedData.nationality as keyof typeof NATIONALITY_MAP] || 'Unknown') :
                      '***'}
                  </p>
                </div>

                <div className="decrypted-item">
                  <label className="decrypted-label">Birth Year</label>
                  <p className="decrypted-value">
                    {decryptedData ? decryptedData.birthYear : '***'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!decryptedData ? (
          <div className="decrypt-section" style={{ marginTop: '1.5rem' }}>
            <p className="decrypt-description">
              Your nationality and birth year are stored encrypted. Click below to decrypt and view complete information.
            </p>
            {!signer ? (
              <p className="decrypt-description" style={{ color: '#ef4444' }}>
                ⚠️ Please ensure your wallet is connected to decrypt encrypted fields.
              </p>
            ) : null}
            <button
              onClick={decryptMyData}
              disabled={isDecrypting || !signer || !instance}
              className="decrypt-button"
              style={{
                opacity: (!signer || !instance) ? 0.6 : 1,
                cursor: (!signer || !instance) ? 'not-allowed' : 'pointer'
              }}
            >
              {isDecrypting ? 'Decrypting...' :
               !signer ? 'Connect Wallet to Decrypt' :
               !instance ? 'Loading...' :
               'Decrypt Encrypted Fields'}
            </button>
          </div>
        ) : (
          <div className="decrypted-section" style={{ marginTop: '1.5rem' }}>
            <div className="success-message">
              <p>✅ Successfully decrypted your encrypted data!</p>
              <p className="decrypt-description">
                All your information is now visible above, including nationality and birth year.
              </p>
            </div>

            <div className="refresh-section" style={{ marginTop: '1rem' }}>
              <button
                onClick={() => {
                  setDecryptedData(null);
                  setShowImage(false);
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