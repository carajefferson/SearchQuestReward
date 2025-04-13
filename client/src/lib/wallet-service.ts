/**
 * Simple wallet service to manage local wallet state in development mode
 */

// Event callbacks for balance updates
type BalanceUpdateCallback = (newBalance: number) => void;
const listeners: BalanceUpdateCallback[] = [];

// Add a listener for balance updates
export function addBalanceUpdateListener(callback: BalanceUpdateCallback): void {
  listeners.push(callback);
}

// Remove a listener
export function removeBalanceUpdateListener(callback: BalanceUpdateCallback): void {
  const index = listeners.indexOf(callback);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
}

// Update the balance and notify all listeners
export function updateBalance(coinsToAdd: number): void {
  try {
    // Get current balance from localStorage
    const currentBalance = localStorage.getItem('wallet_balance');
    const balance = currentBalance ? parseInt(currentBalance, 10) : 0;
    
    // Add coins
    const newBalance = balance + coinsToAdd;
    
    // Update localStorage
    localStorage.setItem('wallet_balance', newBalance.toString());
    
    // Notify all listeners
    listeners.forEach(callback => callback(newBalance));
  } catch (error) {
    console.error("Error updating wallet balance:", error);
  }
}

// Get the current balance
export function getCurrentBalance(): number {
  try {
    const currentBalance = localStorage.getItem('wallet_balance');
    return currentBalance ? parseInt(currentBalance, 10) : 0;
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return 0;
  }
}