// Mock IPFS upload functionality
// 模拟 IPFS 上传功能，生成类似真实 IPFS hash 的字符串

export interface IPFSUploadResult {
  hash: string;
  success: boolean;
  error?: string;
}

/**
 * 模拟 IPFS 文件上传
 * @param file 要上传的文件
 * @returns Promise<IPFSUploadResult>
 */
export async function mockIPFSUpload(file: File): Promise<IPFSUploadResult> {
  return new Promise((resolve) => {
    // 模拟上传延迟 1-3 秒
    const delay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      try {
        // 基于文件内容生成稳定的 mock hash
        const hashInput = `${file.name}-${file.size}-${file.type}-${file.lastModified}`;
        const hash = generateMockIPFSHash(hashInput);

        // 模拟 5% 的失败率
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
 * 生成模拟的 IPFS hash (Qm... 格式)
 * @param input 用于生成 hash 的输入字符串
 * @returns string
 */
function generateMockIPFSHash(input: string): string {
  // 创建一个简单的哈希函数
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为 32 位整数
  }

  // 转换为正数并生成类似 IPFS 的 base58 hash
  const positiveHash = Math.abs(hash);
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = 'Qm';

  // 生成 44 个字符的 hash (IPFS CIDv0 格式)
  for (let i = 0; i < 44; i++) {
    const index = (positiveHash + i) % base58Chars.length;
    result += base58Chars[index];
  }

  return result;
}

/**
 * 验证 IPFS hash 格式
 * @param hash IPFS hash 字符串
 * @returns boolean
 */
export function isValidIPFSHash(hash: string): boolean {
  // 基本的 IPFS hash 格式验证
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
}

/**
 * 获取 IPFS 网关 URL
 * @param hash IPFS hash
 * @returns string
 */
export function getIPFSGatewayURL(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`;
}