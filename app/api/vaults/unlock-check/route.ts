import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET /api/vaults/unlock-check - Check for vaults that should be unlocked
export async function GET() {
  try {
    const now = new Date()
    
    // Find all locked vaults where unlock time has passed
    const vaultsToUnlock = await prisma.vault.findMany({
      where: {
        status: 'LOCKED',
        unlockTime: {
          lte: now
        }
      },
      include: {
        owner: { select: { address: true } },
        nominees: { select: { id: true, address: true } }
      }
    })

    if (vaultsToUnlock.length === 0) {
      return NextResponse.json({ unlockedVaults: [] })
    }

    // Update vaults to unlocked status
    const updatedVaults = await Promise.all(
      vaultsToUnlock.map(async (vault) => {
        const updatedVault = await prisma.vault.update({
          where: { id: vault.id },
          data: {
            status: 'UNLOCKED',
            unlockedAt: now
          },
          include: {
            owner: { select: { address: true } },
            nominees: { select: { id: true, address: true } }
          }
        })

        // Log unlock access for all nominees
        await Promise.all(
          vault.nominees.map(async (nominee) => {
            await prisma.accessLog.create({
              data: {
                vaultId: vault.id,
                userId: nominee.id,
                accessType: 'UNLOCKED'
              }
            })
          })
        )

        return updatedVault
      })
    )

    console.log(`Unlocked ${updatedVaults.length} vaults`)

    return NextResponse.json({ 
      unlockedVaults: updatedVaults,
      message: `Successfully unlocked ${updatedVaults.length} vaults`
    })
  } catch (error) {
    console.error('Error checking for unlocks:', error)
    return NextResponse.json({ error: 'Failed to check for unlocks' }, { status: 500 })
  }
}
