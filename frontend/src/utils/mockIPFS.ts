// Mock IPFS functions for demonstration purposes

export async function generateMockIPFSHash(file: File): Promise<string> {
  // Simulate IPFS upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate a mock IPFS hash based on file properties
  const fileBuffer = await file.arrayBuffer();
  const hashInput = file.name + file.size + file.type + fileBuffer.byteLength;

  // Simple hash function for demonstration
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex and create IPFS-style hash
  const hexHash = Math.abs(hash).toString(16).padStart(32, '0');
  return `Qm${hexHash}`;
}

export function createMockImageFromHash(ipfsHash: string): string {
  // For demo purposes, generate a data URL with a colored rectangle
  // In reality, this would fetch from IPFS

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Generate colors based on hash
    const hashNum = parseInt(ipfsHash.slice(-6), 16) || 0;
    const r = (hashNum >> 16) & 255;
    const g = (hashNum >> 8) & 255;
    const b = hashNum & 255;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, `rgb(${255-r}, ${255-g}, ${255-b})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);

    // Add some text
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Mock Identity Document', 150, 80);
    ctx.fillText(`Hash: ${ipfsHash.slice(0, 10)}...`, 150, 110);
    ctx.fillText('(Demo Image)', 150, 140);
  }

  return canvas.toDataURL();
}

export async function downloadFromIPFS(hash: string): Promise<string> {
  // Mock download - in reality would fetch from IPFS
  await new Promise(resolve => setTimeout(resolve, 500));
  return createMockImageFromHash(hash);
}