// IPFS configuration - Using public gateways that don't require auth
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// For demo purposes, we'll use a simple approach
// In production, you'd use a proper IPFS service like Pinata or Infura with API keys

/**
 * Upload file to IPFS
 * @param file - File to upload
 * @returns IPFS hash (CID)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    console.log(`📤 Simulating IPFS upload for ${file.name} (${file.size} bytes)...`);
    
    // Check if we're on client side
    if (typeof window === 'undefined') {
      throw new Error('IPFS upload only available on client side');
    }
    
    // For demo purposes, generate a mock IPFS hash
    // In production, you'd upload to a real IPFS service
    const mockIPFSHash = `Qm${file.name.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`✅ Demo IPFS hash generated: ${mockIPFSHash}`);
    console.log(`🔗 Demo access at: ${IPFS_GATEWAY}${mockIPFSHash}`);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockIPFSHash;
  } catch (error) {
    console.error('❌ Error in demo IPFS upload:', error);
    throw new Error(`Failed to generate demo IPFS hash: ${error}`);
  }
}

/**
 * Download file from IPFS
 * @param ipfsHash - IPFS hash (CID)
 * @param fileName - Original file name
 * @returns Promise that resolves when download starts
 */
export async function downloadFromIPFS(ipfsHash: string, fileName: string): Promise<void> {
  try {
    console.log(`📥 Demo download for ${fileName} from IPFS: ${ipfsHash}`);
    
    // For demo purposes, create a placeholder file
    // In production, you'd download from the real IPFS gateway
    const demoContent = `This is a demo file for: ${fileName}\n\nDemo IPFS Hash: ${ipfsHash}\n\nNote: This is a demonstration. In production, this would be the actual file content downloaded from IPFS.\n\nGenerated at: ${new Date().toISOString()}`;
    
    // Create download link
    const blob = new Blob([demoContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Demo file downloaded successfully: ${fileName}`);
  } catch (error) {
    console.error('❌ Error in demo download:', error);
    throw new Error(`Failed to download demo file: ${error}`);
  }
}

/**
 * Get IPFS gateway URL for a hash
 * @param ipfsHash - IPFS hash (CID)
 * @returns Full IPFS gateway URL
 */
export function getIPFSGatewayURL(ipfsHash: string): string {
  return `${IPFS_GATEWAY}${ipfsHash}`;
}

/**
 * Validate IPFS hash format
 * @param hash - Hash to validate
 * @returns True if valid IPFS hash
 */
export function isValidIPFSHash(hash: string): boolean {
  // Basic IPFS hash validation (starts with Qm or bafy)
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[a-z2-7]{55}$/.test(hash);
}
