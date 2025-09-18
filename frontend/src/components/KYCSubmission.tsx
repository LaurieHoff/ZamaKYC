import { useState, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { generateMockIPFSHash } from '../utils/mockIPFS';

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

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, identityDocument: file }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Generate mock IPFS hash
      const mockHash = await generateMockIPFSHash(file);
      setIpfsHash(mockHash);
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
      // Convert IPFS hash to number for encryption
      const hashAsNumber = BigInt('0x' + ipfsHash.slice(2)); // Remove 'Qm' prefix and convert
      const nameAsNumber = parseInt(formData.name.replace(/\D/g, '') || '123456789');
      const nationalityId = parseInt(formData.nationality);
      const birthYear = parseInt(formData.birthYear);

      // Create encrypted inputs
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add256(hashAsNumber);
      input.add32(nameAsNumber);
      input.add32(nationalityId);
      input.add32(birthYear);

      const encryptedInput = await input.encrypt();

      // Submit to contract
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitKYC',
        args: [
          encryptedInput.handles[0], // hash
          encryptedInput.handles[1], // name
          encryptedInput.handles[2], // nationality
          encryptedInput.handles[3], // birth year
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            KYC Submitted Successfully!
          </h2>
          <p className="text-green-700 mb-4">
            Your KYC information has been encrypted and submitted to the blockchain.
            You can check the status in the "Check Status" tab.
          </p>
          <button
            onClick={resetForm}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Submit Another KYC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit KYC Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identity Document
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="max-w-xs h-auto rounded-md border"
                />
              </div>
            )}
            {ipfsHash && (
              <p className="text-sm text-gray-600 mt-2">
                Mock IPFS Hash: <code className="bg-gray-100 px-1 rounded">{ipfsHash}</code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (as number)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., 123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter a numeric representation of your name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality ID
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Year
            </label>
            <input
              type="number"
              value={formData.birthYear}
              onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
              placeholder="e.g., 1990"
              min="1900"
              max="2020"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isConfirming || zamaLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {zamaLoading && 'Initializing Zama...'}
              {isSubmitting && 'Encrypting Data...'}
              {isConfirming && 'Confirming Transaction...'}
              {!zamaLoading && !isSubmitting && !isConfirming && 'Submit KYC'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Privacy Notice</h3>
          <p className="text-sm text-blue-800">
            All your data will be encrypted using Zama's FHE technology before being stored on the blockchain.
            Only you and authorized platform operators can decrypt your information.
          </p>
        </div>
      </div>
    </div>
  );
}