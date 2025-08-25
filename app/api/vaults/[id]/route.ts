import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// PUT /api/vaults/[id] - Update vault (e.g., mark as unlocked)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, unlockedAt } = body

    const vault = await prisma.vault.update({
      where: { id },
      data: {
        status,
        unlockedAt: unlockedAt ? new Date(unlockedAt) : undefined
      },
      include: {
        owner: { select: { address: true } },
        nominees: { select: { address: true } }
      }
    })

    return NextResponse.json({ vault })
  } catch (error) {
    console.error('Error updating vault:', error)
    return NextResponse.json({ error: 'Failed to update vault' }, { status: 500 })
  }
}

// GET /api/vaults/[id] - Get specific vault
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const vault = await prisma.vault.findUnique({
      where: { id },
      include: {
        owner: { select: { address: true } },
        nominees: { select: { id: true, address: true } },
        accessLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    // Check if user has access to this vault
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isOwner = vault.ownerId === user.id
    const isNominee = vault.nominees.some(n => n.id === user.id)

    if (!isOwner && !isNominee) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Log access
    await prisma.accessLog.create({
      data: {
        vaultId: vault.id,
        userId: user.id,
        accessType: 'VIEWED'
      }
    })

    // Calculate current status
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

    const vaultWithStatus = {
      ...vault,
      status: isUnlocked ? 'UNLOCKED' : 'LOCKED',
      timeRemaining,
      timeRemainingFormatted: formatTimeRemaining(timeRemaining),
      isUnlocked,
      userRole: isOwner ? 'owner' : 'nominee'
    }

    return NextResponse.json({ vault: vaultWithStatus })
  } catch (error) {
    console.error('Error fetching vault:', error)
    return NextResponse.json({ error: 'Failed to fetch vault' }, { status: 500 })
  }
}
