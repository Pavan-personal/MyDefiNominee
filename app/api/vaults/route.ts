import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/vaults - Fetch vaults for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const type = searchParams.get('type') // 'owner' or 'nominee'

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { address: address.toLowerCase() }
      })
    }

    let vaults: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any

    if (type === 'owner') {
      // Fetch vaults owned by user
      vaults = await prisma.vault.findMany({
        where: { ownerId: user.id },
        include: {
          owner: { select: { address: true } },
          nominees: { select: { address: true } },
          accessLogs: {
            where: { accessType: 'VIEWED' },
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (type === 'nominee') {
      // Fetch vaults where user is a nominee
      vaults = await prisma.vault.findMany({
        where: { nominees: { some: { id: user.id } } },
        include: {
          owner: { select: { address: true } },
          nominees: { select: { address: true } },
          accessLogs: {
            where: { accessType: 'VIEWED' },
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Fetch all vaults for user (both owned and nominee)
      const [ownedVaults, nomineeVaults] = await Promise.all([
        prisma.vault.findMany({
          where: { ownerId: user.id },
          include: {
            owner: { select: { address: true } },
            nominees: { select: { address: true } },
            accessLogs: {
              where: { accessType: 'VIEWED' },
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.vault.findMany({
          where: { nominees: { some: { id: user.id } } },
          include: {
            owner: { select: { address: true } },
            nominees: { select: { address: true } },
            accessLogs: {
              where: { accessType: 'VIEWED' },
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ])

      vaults = [...ownedVaults, ...nomineeVaults]
    }

    // Calculate current status and time remaining
    const vaultsWithStatus = vaults.map(vault => {
      const now = new Date()
      const unlockTime = new Date(vault.unlockTime)
      const isUnlocked = now >= unlockTime
      const timeRemaining = Math.max(0, unlockTime.getTime() - now.getTime())

      // Format time remaining
      const formatTimeRemaining = (ms: number) => {
        if (ms === 0) return 'Unlocked now!'
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        if (minutes > 0) {
          return `${minutes}m ${seconds}s remaining`
        }
        return `${seconds}s remaining`
      }

      return {
        ...vault,
        status: isUnlocked ? 'UNLOCKED' : 'LOCKED',
        timeRemaining,
        timeRemainingFormatted: formatTimeRemaining(timeRemaining),
        isUnlocked,
        userRole: vault.owner.id === user.id ? 'owner' : 'nominee'
      }
    })

    return NextResponse.json({ vaults: vaultsWithStatus })
  } catch (error) {
    console.error('Error fetching vaults:', error)
    return NextResponse.json({ error: 'Failed to fetch vaults' }, { status: 500 })
  }
}

// POST /api/vaults - Create a new vault
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      ownerAddress, 
      description, 
      fileName, 
      fileType, 
      fileSize, 
      fileHash, 
      ipfsHash, 
      nominees, 
      unlockTime,
      blockchainId,
      encryptedData 
    } = body

    if (!ownerAddress || !description || !nominees || !unlockTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create owner user
    let owner = await prisma.user.findUnique({
      where: { address: ownerAddress.toLowerCase() }
    })

    if (!owner) {
      owner = await prisma.user.create({
        data: { address: ownerAddress.toLowerCase() }
      })
    }

    // Get or create nominee users
    const nomineeUsers = await Promise.all(
      nominees.map(async (nomineeAddress: string) => {
        let user = await prisma.user.findUnique({
          where: { address: nomineeAddress.toLowerCase() }
        })

        if (!user) {
          user = await prisma.user.create({
            data: { address: nomineeAddress.toLowerCase() }
          })
        }

        return user
      })
    )

    // Create vault
    const vault = await prisma.vault.create({
      data: {
        title: description.substring(0, 50), // Use description as title
        description,
        fileName,
        fileType,
        fileSize,
        fileHash,
        ipfsHash,
        unlockTime: new Date(unlockTime),
        blockchainId,
        encryptedData,
        ownerId: owner.id,
        nominees: { connect: nomineeUsers.map(u => ({ id: u.id })) }
      },
      include: {
        owner: { select: { address: true } },
        nominees: { select: { address: true } }
      }
    })

    // Log vault creation
    await prisma.accessLog.create({
      data: {
        vaultId: vault.id,
        userId: owner.id,
        accessType: 'CREATED'
      }
    })

    return NextResponse.json({ vault }, { status: 201 })
  } catch (error) {
    console.error('Error creating vault:', error)
    return NextResponse.json({ error: 'Failed to create vault' }, { status: 500 })
  }
}
