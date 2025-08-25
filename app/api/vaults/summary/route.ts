import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET /api/vaults/summary - Get vaults summary with locked/unlocked separation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

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

    const now = new Date()

    // Get vaults where user is creator (all data)
    const myVaults = await prisma.vault.findMany({
      where: { ownerId: user.id },
      include: {
        owner: { select: { address: true } },
        nominees: { select: { address: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get vaults where user is nominee
    const nomineeVaults = await prisma.vault.findMany({
      where: { nominees: { some: { id: user.id } } },
      include: {
        owner: { select: { address: true } },
        nominees: { select: { address: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Separate nominee vaults into locked and unlocked
    const lockedVaults = []
    const unlockedVaults = []

    for (const vault of nomineeVaults) {
      const unlockTime = new Date(vault.unlockTime)
      const isUnlocked = now >= unlockTime

      if (isUnlocked) {
        // Unlocked: send full data
        unlockedVaults.push({
          ...vault,
          status: 'UNLOCKED',
          isUnlocked: true
        })
      } else {
        // Locked: send owner object and unlock time (consistent with other vaults)
        lockedVaults.push({
          id: vault.id,
          owner: { address: vault.owner.address },
          unlocks_on: vault.unlockTime
        })
      }
    }

    // Update my vaults status
    const myVaultsWithStatus = myVaults.map(vault => {
      const unlockTime = new Date(vault.unlockTime)
      const isUnlocked = now >= unlockTime
      
      return {
        ...vault,
        status: isUnlocked ? 'UNLOCKED' : 'LOCKED',
        isUnlocked
      }
    })

    return NextResponse.json({
      vaults_shared_with_me: {
        locked: lockedVaults,
        unlocked: unlockedVaults
      },
      my_vaults: myVaultsWithStatus
    })
  } catch (error) {
    console.error('Error fetching vaults summary:', error)
    return NextResponse.json({ error: 'Failed to fetch vaults summary' }, { status: 500 })
  }
}
