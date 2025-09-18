// Mock IPFS upload functionality
// Simulate IPFS upload functionality, generating strings similar to real IPFS hashes

export interface IPFSUploadResult {
  hash: string;
  success: boolean;
  error?: string;
}

/**
 * Simulate IPFS file upload
 * @param file File to upload
 * @returns Promise<IPFSUploadResult>
 */
export async function mockIPFSUpload(file: File): Promise<IPFSUploadResult> {
  return new Promise((resolve) => {
    // Simulate upload delay 1-3 seconds
    const delay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      try {
        // Generate stable mock hash based on file content
        const hashInput = `${file.name}-${file.size}-${file.type}-${file.lastModified}`;
        const hash = generateMockIPFSHash(hashInput);

        // Simulate 5% failure rate
        if (Math.random() < 0.05) {
          resolve({
            hash: '',
            success: false,
            error: 'Network error: Failed to upload to IPFS'
          });
        } else {
          resolve({
            hash,
            success: true
          });
        }
      } catch (error) {
        resolve({
          hash: '',
          success: false,
          error: 'Unexpected error occurred'
        });
      }
    }, delay);
  });
}

/**
 * Generate mock IPFS hash (Qm... format)
 * @param input Input string for hash generation
 * @returns string
 */
function generateMockIPFSHash(input: string): string {
  // Create a simple hash function
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive number and generate IPFS-like base58 hash
  const positiveHash = Math.abs(hash);
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = 'Qm';

  // Generate 44-character hash (IPFS CIDv0 format)
  for (let i = 0; i < 44; i++) {
    const index = (positiveHash + i) % base58Chars.length;
    result += base58Chars[index];
  }

  return result;
}

/**
 * Validate IPFS hash format
 * @param hash IPFS hash string
 * @returns boolean
 */
export function isValidIPFSHash(hash: string): boolean {
  // Basic IPFS hash format validation
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
}

/**
 * Get IPFS gateway URL
 * @param hash IPFS hash
 * @returns string
 */
export function getIPFSGatewayURL(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`;
}