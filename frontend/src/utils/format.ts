/**
 * Format a new-api quota value (500000 = 1 积分) to a human-readable string.
 */
export function formatBalance(quota: number): string {
  return (quota / 500000).toFixed(1) + ' 积分'
}

/**
 * Convert quota to numeric balance (积分).
 */
export function quotaToBalance(quota: number): number {
  return quota / 500000
}
