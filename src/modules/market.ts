import type { StockAsset } from '../types';

const BASELINE_PRICES: Record<string, number> = {
  KORP: 150.00,
  VLTC: 45.00,
  SLDG: 2.00
};

const MIN_PRICE = 0.05;
const MAX_PRICE: Record<string, number> = {
  KORP: 500.00,
  VLTC: 250.00,
  SLDG: 50.00
};

export const STOCKS: StockAsset[] = [
  { symbol: 'KORP', name: 'MegaCorp', currentPrice: 150.00, previousPrice: 150.00, volatility: 0.02, trend: 0.01 },
  { symbol: 'VLTC', name: 'VeloTech', currentPrice: 45.00, previousPrice: 45.00, volatility: 0.08, trend: 0.03 },
  { symbol: 'SLDG', name: 'SludgeCoin', currentPrice: 2.00, previousPrice: 2.00, volatility: 0.25, trend: 0.08 }
];

export function tickMarket(): void {
  STOCKS.forEach((asset) => {
    asset.previousPrice = asset.currentPrice;
    asset.trend = asset.trend * 0.75 + (Math.random() - 0.5) * asset.volatility;

    const baseline = BASELINE_PRICES[asset.symbol] ?? asset.currentPrice;
    const deviation = (asset.currentPrice - baseline) / baseline;
    const meanReversion = -deviation * 0.04;
    asset.trend += meanReversion;

    asset.currentPrice += asset.trend * asset.currentPrice;

    const maxPrice = MAX_PRICE[asset.symbol] ?? Number.MAX_VALUE;
    if (asset.currentPrice < MIN_PRICE) asset.currentPrice = MIN_PRICE;
    if (asset.currentPrice > maxPrice) asset.currentPrice = maxPrice;
  });
}
