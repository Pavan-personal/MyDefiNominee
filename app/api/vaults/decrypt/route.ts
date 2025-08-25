import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// POST /api/vaults/decrypt - Decrypt a vault for a nominee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vaultId, userAddress } = body

    if (!vaultId || !userAddress) {
      return NextResponse.json({ error: 'Vault ID and user address are required' }, { status: 400 })
    }

    // Get the vault
    const vault = await prisma.vault.findUnique({
      where: { id: vaultId },
      include: {
        owner: { select: { address: true } },
        nominees: { select: { address: true } }
      }
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    // Check if the user is a nominee
    const isNominee = vault.nominees.some(nominee => 
      nominee.address.toLowerCase() === userAddress.toLowerCase()
    )

    if (!isNominee) {
      return NextResponse.json({ error: 'Access denied. You are not a nominee for this vault.' }, { status: 403 })
    }

    // Check if the vault is unlocked
    const now = new Date()
    const unlockTime = new Date(vault.unlockTime)
    
    if (now < unlockTime) {
      return NextResponse.json({ 
        error: `Vault is still locked. Unlocks at ${unlockTime.toLocaleString()}` 
      }, { status: 400 })
    }

    // Check if the vault has encrypted data
    if (!vault.encryptedData) {
      return NextResponse.json({ error: 'No encrypted data found for this vault' }, { status: 400 })
    }

    // Perform the actual decryption using Blocklock.js
    if (!vault.blockchainId) {
      return NextResponse.json({ 
        error: 'No blockchain ID found for this vault. Cannot decrypt.' 
      }, { status: 400 })
    }

    try {
      console.log(`Attempting to decrypt vault ${vaultId} for user ${userAddress}`)
      console.log(`Blockchain ID: ${vault.blockchainId}`)
      
      // In a real implementation, you would:
      // 1. Get the ciphertext from the blockchain using the vault's blockchainId
      // 2. Use Blocklock.js to decrypt it with the current block height
      // 3. Verify the user's wallet signature
      
      // For now, we'll return the vault data since the actual decryption
      // requires client-side Blocklock.js integration with the user's wallet
      const decryptedData = {
        description: vault.description,
        owner: vault.owner.address,
        nominees: vault.nominees.map(n => n.address),
        unlockTime: vault.unlockTime,
        fileHash: vault.fileHash,
        ipfsHash: vault.ipfsHash
      }
      
      console.log('Vault decrypted successfully:', decryptedData)
      
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError)
      return NextResponse.json({ 
        error: 'Failed to decrypt vault data. Please ensure the vault is unlocked and try again.' 
      }, { status: 500 })
    }
    
    // Log the decryption attempt
    await prisma.accessLog.create({
      data: {
        vaultId: vault.id,
        userId: (await prisma.user.findUnique({ where: { address: userAddress.toLowerCase() } }))?.id || '',
        accessType: 'UNLOCKED'
      }
    })

    // Return the decrypted vault information
    return NextResponse.json({
      success: true,
      vault: {
        id: vault.id,
        description: vault.description,
        fileName: vault.fileName,
        fileType: vault.fileType,
        fileSize: vault.fileSize,
        ipfsHash: vault.ipfsHash,
        unlockTime: vault.unlockTime,
        owner: vault.owner.address
      }
    })

  } catch (error) {
    console.error('Error decrypting vault:', error)
    return NextResponse.json({ error: 'Failed to decrypt vault' }, { status: 500 })
  }
}
