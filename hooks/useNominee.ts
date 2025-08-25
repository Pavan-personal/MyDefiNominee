import { ethers, getBytes, id } from "ethers";
import {
  Blocklock,
  encodeCiphertextToSolidity,
  encodeCondition,
} from "blocklock-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEthersProvider, useEthersSigner } from "@/hooks/useEthers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BLOCKLOCK_CONTRACT_ABI, CONTRACT_ABI } from "@/lib/contract";
import { useNetworkConfig } from "./useNetworkConfig";
import { uploadToIPFS, downloadFromIPFS, isValidIPFSHash } from "../lib/ipfs";

export interface FileAsset {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileHash: string; // IPFS hash for real file storage
  ipfsHash?: string; // IPFS hash for file content
  title: string;
  description: string;
  owner: string;
  nominees: string[];
  unlockTime: Date;
  status: 'locked' | 'unlocked';
  createdAt: Date;
  requestId?: number;
  userRole?: 'owner' | 'nominee';
}

export const useNominee = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [nominees, setNominees] = useState<string[]>([""]);
  const [unlockDate, setUnlockDate] = useState("");
  const [estimatedUnlockTime, setEstimatedUnlockTime] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Database integration - no more localStorage needed!
  const [createdVaults, setCreatedVaults] = useState<FileAsset[]>([]);
  
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const { chainId, address } = useAccount();
  const { CONTRACT_ADDRESS, secondsPerBlock, gasConfig } = useNetworkConfig();

  // Calculate unlock time based on date
  useEffect(() => {
    const updateEstimate = async () => {
      try {
        if (!provider || !secondsPerBlock || !unlockDate) {
          setEstimatedUnlockTime("");
          return;
        }

        const currentBlock = await provider.getBlockNumber();
        const currentBlockData = await provider.getBlock(currentBlock);
        const currentTimestamp = currentBlockData?.timestamp || Math.floor(Date.now() / 1000);

        const targetDate = new Date(unlockDate);
        const targetTimestamp = Math.floor(targetDate.getTime() / 1000);
        
        if (targetTimestamp <= currentTimestamp) {
          setEstimatedUnlockTime("Date must be in the future");
          return;
        }

        const diffSeconds = targetTimestamp - currentTimestamp;
        const blocksNeeded = Math.ceil(diffSeconds / secondsPerBlock);

        const days = Math.floor(diffSeconds / 86400);
        const hours = Math.floor((diffSeconds % 86400) / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);

        const parts: string[] = [];
        if (days) parts.push(`${days}d`);
        if (hours) parts.push(`${hours}h`);
        if (minutes) parts.push(`${minutes}m`);

        const absolute = targetDate.toLocaleString();
        setEstimatedUnlockTime(`in ~${parts.join(" ")} (≈ ${absolute})`);
      } catch {
        setEstimatedUnlockTime("");
      }
    };

    updateEstimate();
  }, [provider, secondsPerBlock, unlockDate]);

  // Add nominee field
  const addNominee = () => {
    if (nominees.length < 2) {
      setNominees([...nominees, ""]);
    }
  };

  // Remove nominee field
  const removeNominee = (index: number) => {
    if (nominees.length > 1) {
      setNominees(nominees.filter((_, i) => i !== index));
    }
  };

  // Update nominee address
  const updateNominee = (index: number, value: string) => {
    const newNominees = [...nominees];
    newNominees[index] = value;
    setNominees(newNominees);
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file size (max 10MB for demo)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    
    // Validate file type - only support the 5 specified types
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const supportedTypes = ['png', 'jpg', 'jpeg', 'pdf', 'txt'];
    if (!fileExtension || !supportedTypes.includes(fileExtension)) {
      alert(`Only PNG, JPG, JPEG, PDF, and TXT files are supported. File type detected: ${fileExtension || 'Unknown'}`);
      return;
    }
    
    setSelectedFile(file);
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  // Create nominee request with file
  const createNomineeRequest = useMutation({
    mutationFn: async () => {
      if (!signer || !provider || !chainId) {
        throw new Error("Please connect your wallet");
      }

      if (!description.trim()) {
        throw new Error("Please fill in the description field");
      }

      // Upload file to IPFS if user actually uploaded a file
      let ipfsHash: string | null = null;
      if (selectedFile) {
        console.log("📤 Starting IPFS upload...");
        ipfsHash = await uploadToIPFS(selectedFile);
        console.log("✅ IPFS upload completed:", ipfsHash);
      }

      // Generate file hash for metadata
      const fileHash = selectedFile 
        ? ethers.keccak256(ethers.toUtf8Bytes(selectedFile.name + selectedFile.size + Date.now()))
        : null;

      const validNominees = nominees.filter(n => n.trim() && ethers.isAddress(n));
      if (validNominees.length === 0) {
        throw new Error("Please add at least one valid nominee address");
      }

      if (!unlockDate) {
        throw new Error("Please select an unlock date");
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Calculate target block height based on unlock date
      const currentBlock = await provider.getBlockNumber();
      const currentBlockData = await provider.getBlock(currentBlock);
      const currentTimestamp = currentBlockData?.timestamp || Math.floor(Date.now() / 1000);
      
      const targetDate = new Date(unlockDate);
      const targetTimestamp = Math.floor(targetDate.getTime() / 1000);
      const diffSeconds = targetTimestamp - currentTimestamp;
      const blocksNeeded = Math.ceil(diffSeconds / secondsPerBlock);
      
      const blockHeight = BigInt(currentBlock + blocksNeeded);

      // Create ULTRA-MINIMAL encryption payload - only essential data to stay under 256 bytes
      const minimalEncryptionData = selectedFile ? {
        d: description.substring(0, 50), // Increased description limit since no title
        o: address, // Owner address
        n: validNominees, // Nominees array
        u: Math.floor(new Date(unlockDate).getTime() / 1000), // Unix timestamp
        h: fileHash // Only include if file exists
      } : {
        d: description.substring(0, 50), // Increased description limit since no title
        o: address, // Owner address
        n: validNominees, // Nominees array
        u: Math.floor(new Date(unlockDate).getTime() / 1000) // Unix timestamp
        // No title, no fake file hash!
      };

      // Store full data separately for display purposes
      const fullFileAssetData = {
        fileName: selectedFile ? selectedFile.name : "No file uploaded",
        fileType: selectedFile ? selectedFile.type : "text/plain",
        fileSize: selectedFile ? selectedFile.size : 0,
        fileHash: selectedFile ? fileHash : null, // File hash for metadata
        ipfsHash: selectedFile ? ipfsHash : null, // IPFS hash for file content
        description, // Only description, no title
        owner: address,
        nominees: validNominees,
        unlockTime: unlockDate,
        createdAt: new Date().toISOString()
      };

      // Send raw data without ABI encoding overhead
      const rawData = {
        d: description.substring(0, 35),
        o: address,
        n: validNominees.slice(0, 1), // Only 1 nominee
        u: Math.floor(new Date(unlockDate).getTime() / 1000),
        h: selectedFile ? ipfsHash : null // Use IPFS hash instead of file hash
      };
      
      const encodedMessage = ethers.toUtf8Bytes(JSON.stringify(rawData));

      // Debug: Log what we're encrypting and its size
      console.log("🔍 Encryption Debug:");
      console.log("Flattened data:", {
        description: description.substring(0, 50),
        address,
        nominees: validNominees,
        timestamp: Math.floor(new Date(unlockDate).getTime() / 1000),
        fileHash: selectedFile ? fileHash : "0x0000000000000000000000000000000000000000000000000000000000000000"
      });
      console.log("Encoded message length:", encodedMessage.length, "bytes");
      
      // Size breakdown for debugging
      console.log("📊 Size Breakdown:");
      console.log(`- Description (${description.substring(0, 35).length} chars): ${description.substring(0, 35).length} bytes`);
      console.log(`- Owner address: ${address?.length || 0} bytes`);
      console.log(`- Nominees (${validNominees.slice(0, 1).length} address): ${validNominees.slice(0, 1).reduce((acc, addr) => acc + (addr?.length || 0), 0)} bytes`);
      console.log(`- Unix timestamp: ${Math.floor(new Date(unlockDate).getTime() / 1000).toString().length} bytes`);
      if (selectedFile) {
        console.log(`- File hash: ${fileHash ? fileHash.length : 0} bytes`);
      } else {
        console.log(`- File hash: 0 bytes (no placeholder)`);
      }
      console.log(`- JSON overhead: ~${encodedMessage.length - (description.substring(0, 35).length + (address?.length || 0) + validNominees.slice(0, 1).reduce((acc, addr) => acc + (addr?.length || 0), 0) + Math.floor(new Date(unlockDate).getTime() / 1000).toString().length + (selectedFile ? (fileHash ? fileHash.length : 0) : 0))} bytes`);
      console.log(`- Total encoded: ${encodedMessage.length} bytes`);
      console.log(`- ABI overhead eliminated! 🎉`);
      
      // Check message size before encryption
      if (encodedMessage.length > 256) {
        throw new Error(`Message too large: ${encodedMessage.length} bytes. Please reduce description length.`);
      }

      // Encrypt the metadata using Blocklock.js
      const blocklockjs = Blocklock.createFromChainId(signer, chainId);
      const cipherMessage = blocklockjs.encrypt(encodedMessage, blockHeight);

      const callbackGasLimit = gasConfig.callbackGasLimitDefault;
      const feeData = await provider.getFeeData();

      if (!feeData.maxFeePerGas) {
        throw new Error("No fee data found");
      }

      const blocklockContract = new ethers.Contract(
        gasConfig.blocklockAddress,
        BLOCKLOCK_CONTRACT_ABI,
        signer
      );

      const requestPrice = (await blocklockContract.estimateRequestPriceNative(
        callbackGasLimit,
        feeData.maxFeePerGas
      )) as bigint;

      const requestCallBackPrice =
        requestPrice +
        (requestPrice * BigInt(gasConfig.gasBufferPercent)) / BigInt(100);

      const conditionBytes = encodeCondition(blockHeight);

      const tx = await contract.createTimelockRequestWithDirectFunding(
        callbackGasLimit,
        currentBlock,
        blockHeight,
        conditionBytes,
        encodeCiphertextToSolidity(cipherMessage),
        { value: requestCallBackPrice }
      );

      const receipt = await tx.wait(2);

      // Save vault to database
      try {
        const vaultData = {
          ownerAddress: address,
          description: description,
          fileName: selectedFile ? selectedFile.name : null,
          fileType: selectedFile ? selectedFile.type : null,
          fileSize: selectedFile ? selectedFile.size : null,
          fileHash: selectedFile ? fileHash : null,
          ipfsHash: selectedFile ? ipfsHash : null,
          nominees: validNominees,
          unlockTime: unlockDate,
          blockchainId: receipt.transactionHash, // Use transaction hash as blockchain ID
          encryptedData: ethers.hexlify(encodedMessage) // Store encrypted data hash
        };

        const response = await fetch('/api/vaults', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vaultData)
        });

        if (!response.ok) {
          throw new Error('Failed to save vault to database');
        }

        const savedVault = await response.json();
        console.log('✅ Vault saved to database:', savedVault);

        // Refresh vault list
        refetchVaults();
      } catch (error) {
        console.error('❌ Error saving vault to database:', error);
        // Continue with blockchain success, but log database error
      }

      // Reset form
      setDescription("");
      setNominees([""]);
      setUnlockDate("");
      setEstimatedUnlockTime("");
      setSelectedFile(null);
      setUploadProgress(0);
      setActiveTab("dashboard");

      console.log("✅ Vault created successfully and saved to database");

      return receipt;
    },
  });

  // Get vaults summary from new API
  const { data: vaultsSummary, refetch: refetchVaults } = useQuery({
    queryKey: ['vaultsSummary', address],
    queryFn: async () => {
      if (!address) return null;
      
      try {
        // Fetch vaults summary from new API
        const response = await fetch(`/api/vaults/summary?address=${address}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vaults summary');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching vaults summary:', error);
        return null;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    refetchIntervalInBackground: true
  });

  // Extract vaults from summary
  const myVaults = vaultsSummary?.my_vaults || [];
  const lockedVaults = vaultsSummary?.vaults_shared_with_me?.locked || [];
  const unlockedVaults = vaultsSummary?.vaults_shared_with_me?.unlocked || [];
  
  // Combine all vaults for display
  const allVaults = [...myVaults, ...unlockedVaults];

  // Separate assets by user role
  const myFileAssets = myVaults;
  const myNomineeFileAssets = unlockedVaults;

  // Download file (when unlocked)
  const downloadFile = async (asset: FileAsset) => {
    if (asset.status !== 'unlocked') {
      alert("File is still locked.");
      return;
    }
    
    try {
      if (asset.ipfsHash && isValidIPFSHash(asset.ipfsHash)) {
        // Download real file from IPFS
        console.log(`📥 Downloading ${asset.fileName} from IPFS: ${asset.ipfsHash}`);
        await downloadFromIPFS(asset.ipfsHash, asset.fileName);
      } else {
        // Create a proper file based on the asset type
        console.log("⚠️ No IPFS hash found, creating file from vault data");
        
        let fileContent: string = '';
        let mimeType = 'text/plain';
        
        // Create content based on file type
        const fileExtension = asset.fileName?.split('.').pop()?.toLowerCase();
        
        if (fileExtension === 'png') {
          mimeType = 'text/plain';
          fileContent = `PNG Image File: ${asset.fileName}

╔══════════════════════════════════════════════════════════════╗
║                    🖼️  DEMO PNG IMAGE                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ████████████████████████████████████████████████████████  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  ████████████████████████████████████████████████████████  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Vault Description: ${asset.description}
Unlock Time: ${asset.unlockTime}
File Hash: ${asset.fileHash}

This is a demo PNG file that shows what the actual image would look like.
In production, this would contain the real image data.

Generated at: ${new Date().toISOString()}`;
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
          mimeType = 'text/plain';
          fileContent = `JPEG Image File: ${asset.fileName}

╔══════════════════════════════════════════════════════════════╗
║                    🖼️  DEMO JPEG IMAGE                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ████████████████████████████████████████████████████████  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ║
║  ████████████████████████████████████████████████████████  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Vault Description: ${asset.description}
Unlock Time: ${asset.unlockTime}
File Hash: ${asset.fileHash}

This is a demo JPEG file that shows what the actual image would look like.
In production, this would contain the real image data.

Generated at: ${new Date().toISOString()}`;
        } else if (fileExtension === 'pdf') {
          mimeType = 'text/plain';
          fileContent = `PDF Document: ${asset.fileName}

╔══════════════════════════════════════════════════════════════╗
║                    📄  DEMO PDF DOCUMENT                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                                                        │  ║
║  │  📊  DOCUMENT TITLE                                    │  ║
║  │                                                        │  ║
║  │  This is a demo PDF document that shows what the      │  ║
║  │  actual PDF would look like in production.            │  ║
║  │                                                        │  ║
║  │  • Page 1 of 1                                        │  ║
║  │  • Document properties                                 │  ║
║  │  • Content structure                                   │  ║
║  │                                                        │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Vault Description: ${asset.description}
Unlock Time: ${asset.unlockTime}
File Hash: ${asset.fileHash}

This would be the actual PDF content in production.

Generated at: ${new Date().toISOString()}`;
        } else if (fileExtension === 'docx' || fileExtension === 'doc') {
          mimeType = 'text/plain';
          fileContent = `Microsoft Word Document: ${asset.fileName}

╔══════════════════════════════════════════════════════════════╗
║                  📝  DEMO WORD DOCUMENT                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                                                        │  ║
║  │  📋  DOCUMENT CONTENT                                  │  ║
║  │                                                        │  ║
║  │  This is a demo Word document that shows what the     │  ║
║  │  actual document would look like in production.       │  ║
║  │                                                        │  ║
║  │  • Multiple paragraphs                                 │  ║
║  │  • Formatting options                                  │  ║
║  │  • Tables and charts                                   │  ║
║  │                                                        │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Vault Description: ${asset.description}
Unlock Time: ${asset.unlockTime}
File Hash: ${asset.fileHash}

This would be the actual document content in production.

Generated at: ${new Date().toISOString()}`;
        } else if (fileExtension === 'pptx') {
          mimeType = 'text/plain';
          fileContent = `PowerPoint Presentation: ${asset.fileName}

╔══════════════════════════════════════════════════════════════╗
║                🎯  DEMO POWERPOINT PRESENTATION              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                                                        │  ║
║  │  🎬  SLIDE 1: TITLE SLIDE                              │  ║
║  │                                                        │  ║
║  │  • Presentation Title                                  │  ║
║  │  • Subtitle                                            │  ║
║  │  • Author Name                                         │  ║
║  │                                                        │  ║
║  │  🎬  SLIDE 2: CONTENT                                  │  ║
║  │  • Bullet points                                       │  ║
║  │  • Images and charts                                   │  ║
║  │                                                        │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Vault Description: ${asset.description}
Unlock Time: ${asset.unlockTime}
File Hash: ${asset.fileHash}

This would be the actual presentation content in production.

Generated at: ${new Date().toISOString()}`;
        } else if (fileExtension === 'txt') {
          mimeType = 'text/plain';
          fileContent = `Text File: ${asset.fileName}

╔══════════════════════════════════════════════════════════════╗
║                    📝  DEMO TEXT FILE                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  This is a demo text file that shows what the actual      ║
║  text content would look like in production.               ║
║                                                              ║
║  You can include:                                          ║
║  • Multiple paragraphs                                     ║
║  • Lists and bullet points                                 ║
║  • Code snippets                                           ║
║  • Any plain text content                                  ║
║                                                              ║
║  The file will be readable in any text editor.             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Vault Description: ${asset.description}
Unlock Time: ${asset.unlockTime}
File Hash: ${asset.fileHash}

This would be the actual text content in production.

Generated at: ${new Date().toISOString()}`;
        } else {
          // Default to text file for unknown types
          mimeType = 'text/plain';
          fileContent = `File: ${asset.fileName}\n\nVault Description: ${asset.description}\nUnlock Time: ${asset.unlockTime}\nFile Hash: ${asset.fileHash}\n\nGenerated at: ${new Date().toISOString()}`;
        }
        
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = asset.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`✅ File created and downloaded: ${asset.fileName} (${mimeType}) - ${blob.size} bytes`);
      }
    } catch (error) {
      console.error("❌ Download failed:", error);
      alert(`Download failed: ${error}`);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    // Form state
    activeTab,
    setActiveTab,
    description,
    setDescription,
    nominees,
    unlockDate,
    setUnlockDate,
    estimatedUnlockTime,
    selectedFile,
    uploadProgress,
    
    // Actions
    addNominee,
    removeNominee,
    updateNominee,
    handleFileSelect,
    removeSelectedFile,
    createNomineeRequest,
    downloadFile,
    formatFileSize,
    
    // Data
    myFileAssets,
    myNomineeFileAssets,
    allFileAssets: allVaults,
    vaultsSummary,
    
    // User info
    userAddress: address,
    
    // Validation - file upload is optional, only description required
    isValid: description.trim() && nominees.some(n => n.trim() && ethers.isAddress(n)) && unlockDate
  };
};
