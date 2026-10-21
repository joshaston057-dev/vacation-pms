// Utility snippet for financial calculations in app/reports/page.tsx
const UGX_EXCHANGE_RATE = 3750;

export function calculatePayout(amountUSD: number, feePercentage: number = 15) {
  const netUSD = amountUSD * (1 - feePercentage / 100);
  const netUGX = netUSD * UGX_EXCHANGE_RATE;
  
  return {
    netUSD: netUSD.toFixed(2),
    netUGX: Math.round(netUGX).toLocaleString('en-US') + ' UGX',
  };
}