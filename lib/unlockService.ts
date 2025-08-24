// Background service for detecting vault unlocks
class UnlockService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      await this.checkForUnlocks();
    }, 30000); // Check every 30 seconds
    
    console.log('🔓 Unlock service started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🔓 Unlock service stopped');
  }

  private async checkForUnlocks() {
    try {
      // Get all locked vaults that should be unlocked
      const response = await fetch('/api/vaults/unlock-check');
      if (response.ok) {
        const { unlockedVaults } = await response.json();
        if (unlockedVaults && unlockedVaults.length > 0) {
          console.log(`🔓 Found ${unlockedVaults.length} newly unlocked vaults`);
          // Trigger UI refresh for connected clients
          this.notifyUnlocks(unlockedVaults);
        }
      }
    } catch (error) {
      console.error('Error checking for unlocks:', error);
    }
  }

  private notifyUnlocks(unlockedVaults: Array<{
    id: string;
    description: string;
    status: string;
    unlockTime: Date;
    unlockedAt?: Date;
    owner: { address: string };
    nominees: Array<{ address: string }>;
  }>) {
    // In a real app, you'd use WebSockets or Server-Sent Events
    // For now, we'll rely on the 30-second polling in the UI
    console.log('🔓 Unlocked vaults:', unlockedVaults);
  }
}

// Export singleton instance
export const unlockService = new UnlockService();

// Auto-start service when imported
if (typeof window !== 'undefined') {
  unlockService.start();
}
