export function calculateBulkCost(baseCost: number, multiplier: number, currentLevel: number, count: number): number {
  let totalCost = 0;
  for (let i = 0; i < count; i++) {
    totalCost += Math.floor(baseCost * Math.pow(multiplier, currentLevel + i));
  }
  return totalCost;
}

export function calculateSingleCost(baseCost: number, multiplier: number, currentLevel: number): number {
  return calculateBulkCost(baseCost, multiplier, currentLevel, 1);
}