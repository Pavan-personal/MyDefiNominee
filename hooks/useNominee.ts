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

export interface FileAsset {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileHash: string; // Unique hash instead of file data
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

      // Only generate file hash if user actually uploaded a file
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
        fileHash: selectedFile ? minimalEncryptionData.h : null,
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
        h: selectedFile ? fileHash : null
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

      // Reset form
      setTitle("");
      setDescription("");
      setNominees([""]);
      setUnlockDate("");
      setEstimatedUnlockTime("");
      setSelectedFile(null);
      setUploadProgress(0);
      setActiveTab("dashboard");

      return receipt;
    },
  });

  // Get file assets based on user role
  const { data: fileAssets = [] } = useQuery({
    queryKey: ['fileAssets', address],
    queryFn: async () => {
      if (!address) return [];
      
      // This would normally fetch from blockchain
      // For now, return mock data to demonstrate the concept
      const mockFileAssets = [
        {
          id: "1",
          fileName: "important_document.pdf",
          fileType: "application/pdf",
          fileSize: 2048576, // 2MB
          fileHash: "0x1234567890abcdef",
          title: "Legal Documents",
          description: "Important legal documents and contracts",
          owner: "0x1234567890123456789012345678901234567890",
          nominees: ["0x2345678901234567890123456789012345678901", "0x3456789012345678901234567890123456789012"],
          unlockTime: new Date(Date.now() + 86400000), // 24 hours from now
          status: 'locked' as const,
          createdAt: new Date()
        },
        {
          id: "2",
          fileName: "family_photos.zip",
          fileType: "application/zip",
          fileSize: 5242880, // 5MB
          fileHash: "0xabcdef1234567890",
          title: "Family Memories",
          description: "Personal family photos and videos",
          owner: "0x4567890123456789012345678901234567890123",
          nominees: ["0x1234567890123456789012345678901234567890", "0x5678901234567890123456789012345678901234"],
          unlockTime: new Date(Date.now() - 86400000), // 24 hours ago (unlocked)
          status: 'unlocked' as const,
          createdAt: new Date(Date.now() - 172800000) // 2 days ago
        }
      ];

      // Filter based on user role
      const userFileAssets = mockFileAssets.filter(asset => 
        asset.owner.toLowerCase() === address.toLowerCase() || 
        asset.nominees.some(nominee => nominee.toLowerCase() === address.toLowerCase())
      );

      return userFileAssets.map(asset => ({
        ...asset,
        userRole: asset.owner.toLowerCase() === address.toLowerCase() ? ('owner' as const) : ('nominee' as const)
      }));
    }
  });

  // Separate assets by user role
  const myFileAssets = fileAssets.filter(asset => asset.userRole === 'owner');
  const myNomineeFileAssets = fileAssets.filter(asset => asset.userRole === 'nominee');

  // Download file (when unlocked)
  const downloadFile = (asset: FileAsset) => {
    if (asset.status !== 'unlocked') {
      alert("File is still locked.");
      return;
    }
    
    // Since we're not storing actual file data, show a message
    alert(`File: ${asset.fileName}\nHash: ${asset.fileHash}\n\nNote: This is a demo. In production, files would be stored on IPFS or similar decentralized storage.`);
    
    // For demo purposes, create a placeholder file
    const placeholderContent = `This is a placeholder for: ${asset.fileName}\nFile Hash: ${asset.fileHash}\nTitle: ${asset.title}\nDescription: ${asset.description}\nUnlock Time: ${asset.unlockTime}`;
    const blob = new Blob([placeholderContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = asset.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    allFileAssets: fileAssets,
    
    // User info
    userAddress: address,
    
    // Validation - file upload is optional, only description required
    isValid: description.trim() && nominees.some(n => n.trim() && ethers.isAddress(n)) && unlockDate
  };
};
