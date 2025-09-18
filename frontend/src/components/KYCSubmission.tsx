import { useState, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { mockIPFSUpload, isValidIPFSHash } from '../utils/ipfs';
import '../styles/KYCSubmission.css';

interface KYCData {
  name: string;
  nationality: string;
  birthYear: string;
  identityDocument: File | null;
}

export function KYCSubmission() {
  const { address } = useAccount();
  const { instance, isLoading: zamaLoading } = useZamaInstance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<KYCData>({
    name: '',
    nationality: '',
    birthYear: '',
    identityDocument: null,
  });

  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, identityDocument: file }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Reset previous upload state
      setIpfsHash('');
      setUploadProgress('');
    }
  };

  const handleUploadToIPFS = async () => {
    if (!formData.identityDocument) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Preparing file for IPFS upload...');

    try {
      // Simulate upload progress
      setTimeout(() => setUploadProgress('Connecting to IPFS network...'), 500);
      setTimeout(() => setUploadProgress('Uploading file to IPFS...'), 1000);

      const result = await mockIPFSUpload(formData.identityDocument);

      if (result.success) {
        setIpfsHash(result.hash);
        setUploadProgress('Upload completed successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('IPFS upload failed:', error);
      setUploadProgress('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instance || !address || !formData.identityDocument || !ipfsHash) {
      alert('Please fill all fields and upload a document');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse numeric values for encryption
      const nationalityId = parseInt(formData.nationality);
      const birthYear = parseInt(formData.birthYear);

      // Create encrypted inputs only for nationality and birth year
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add32(nationalityId);
      input.add32(birthYear);

      const encryptedInput = await input.encrypt();

      // Submit to contract with plain text hash and name, encrypted nationality and birth year
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitKYC',
        args: [
          ipfsHash,                   // IPFS hash as plain text string
          formData.name,              // Name as plain text string
          encryptedInput.handles[0],  // nationality (encrypted)
          encryptedInput.handles[1],  // birth year (encrypted)
          encryptedInput.inputProof
        ],
      });

    } catch (error) {
      console.error('Error submitting KYC:', error);
      alert('Failed to submit KYC. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nationality: '',
      birthYear: '',
      identityDocument: null,
    });
    setIpfsHash('');
    setPreviewUrl('');
    setUploadProgress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isSuccess) {
    return (
      <div className="success-page-container">
        <div className="success-page-card">
          <div className="success-icon">✓</div>
          <h2 className="success-page-title">
            KYC Submitted Successfully!
          </h2>
          <p className="success-page-description">
            Your KYC information has been encrypted and submitted to the blockchain.
            You can check the status in the "Check Status" tab.
          </p>
          <button
            onClick={resetForm}
            className="reset-button"
          >
            Submit Another KYC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-submission-container">
      <div className="kyc-submission-card">
        <h2 className="kyc-submission-title">Submit KYC Information</h2>

        <form onSubmit={handleSubmit} className="kyc-form">
          <div className="form-group">
            <label className="form-label">
              Identity Document
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              required
            />
            {previewUrl && (
              <div className="document-preview-container">
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="document-preview"
                />
                <div className="upload-button-container">
                  <button
                    type="button"
                    onClick={handleUploadToIPFS}
                    disabled={isUploading || !!ipfsHash}
                    className="upload-button"
                  >
                    {isUploading ? 'Uploading...' : ipfsHash ? 'Uploaded to IPFS' : 'Upload to IPFS'}
                  </button>
                </div>
              </div>
            )}
            {uploadProgress && (
              <div className="progress-box">
                <p className="progress-text">
                  📤 {uploadProgress}
                </p>
              </div>
            )}
            {ipfsHash && (
              <div className="success-box">
                <p className="success-title">
                  ✅ Successfully uploaded to IPFS
                </p>
                <p className="success-text">
                  IPFS Hash: <code className="hash-code">{ipfsHash}</code>
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Name (as number)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., 123456789"
              className="text-input"
              required
            />
            <p className="help-text">
              Enter a numeric representation of your name
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nationality ID
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              className="select-input"
              required
            >
              <option value="">Select nationality</option>
              <option value="1">USA (1)</option>
              <option value="2">China (2)</option>
              <option value="3">UK (3)</option>
              <option value="4">Germany (4)</option>
              <option value="5">France (5)</option>
              <option value="86">Other (86)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Birth Year
            </label>
            <input
              type="number"
              value={formData.birthYear}
              onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
              placeholder="e.g., 1990"
              min="1900"
              max="2020"
              className="text-input"
              required
            />
          </div>

          <div className="submit-section">
            {!ipfsHash && formData.identityDocument && (
              <div className="warning-box">
                <p className="warning-text">
                  ⚠️ Please upload your document to IPFS first before submitting KYC
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || isConfirming || zamaLoading || !ipfsHash}
              className="submit-button"
            >
              {zamaLoading && 'Initializing Zama...'}
              {isSubmitting && 'Encrypting Data...'}
              {isConfirming && 'Confirming Transaction...'}
              {!zamaLoading && !isSubmitting && !isConfirming && !ipfsHash && 'Upload to IPFS First'}
              {!zamaLoading && !isSubmitting && !isConfirming && ipfsHash && 'Submit KYC'}
            </button>
          </div>
        </form>

        <div className="privacy-notice">
          <h3 className="privacy-notice-title">Privacy Notice</h3>
          <p className="privacy-notice-text">
            All your data will be encrypted using Zama's FHE technology before being stored on the blockchain.
            Only you and authorized platform operators can decrypt your information.
          </p>
        </div>
      </div>
    </div>
  );
}