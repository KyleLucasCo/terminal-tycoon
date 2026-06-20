import { GameState } from '../state';
import type { TechTreeNode } from '../types';
import { calculateSingleCost } from './formulas';

// Fast Food Balance Constants
export const FF_BASE_COST = 1.50; 
export const FF_CAPACITY_PER_LEVEL = 5; 
export const FF_BASE_DEMAND = 10; 
export const FF_UPGRADE_BASE = 100; 
export const FF_UPGRADE_MULT = 1.15;
export const COST_FF_MANAGER = 1000;

// Retail Balance Constants
export const RETAIL_BASE_COST = 12.00; 
export const RETAIL_CAPACITY_PER_LEVEL = 2; 
export const RETAIL_BASE_DEMAND = 4; 
export const RETAIL_UPGRADE_BASE = 500; 
export const RETAIL_UPGRADE_MULT = 1.35;
export const COST_RETAIL_MANAGER = 5000;

// Media Balance Constants
export const MEDIA_UPGRADE_BASE = 5000; 
export const MEDIA_UPGRADE_MULT = 1.50; 
export const INFLUENCE_PER_SECOND_PER_NETWORK = 2.5; 
export const AIRTIME_PER_NETWORK = 15;
export const COST_MEDIA_MANAGER = 25000;

// Tech Balance Constants
export const TECH_UPGRADE_BASE = 25000; 
export const TECH_UPGRADE_MULT = 1.60; 
export const INNOVATION_PER_SECOND_PER_DEV = 1.0;
export const COST_TECH_MANAGER = 100000;

export const TECH_TREE_DATA: TechTreeNode[] = [
  { id: 'auto_fryers', name: 'AI AUTOMATED FRYERS', cost: 50, description: 'Fast Food sales output scales up by +50% permanently.', requires: null, branch: 'core' },
  { id: 'high_speed_pos', name: 'HIGH-SPEED TERMINALS', cost: 150, description: 'Retail traffic capacities scale up by +50% permanently.', requires: 'auto_fryers', branch: 'core' },
  { id: 'subliminal_feeds', name: 'SUBLIMINAL NARRATIVE FEEDS', cost: 300, description: 'Farming Broadcast Influence outputs scale up by +100%.', requires: 'high_speed_pos', branch: 'media' },
  { id: 'market_manip', name: 'ALGORITHMIC AGGREGATION', cost: 800, description: 'Consumer Hype campaigns scale from +25% revenue tracking up to +50% per asset node.', requires: 'subliminal_feeds', branch: 'media' },
  { id: 'quantum_compute', name: 'QUANTUM INVENTORY PIPELINES', cost: 400, description: 'Reduces ALL dynamic portfolio asset structural scale costs by 15%.', requires: 'high_speed_pos', branch: 'tech' },
  { id: 'deep_space', name: 'DEEP-SPACE TELEMETRY', cost: 1200, description: 'Unlocks satellite signals. Required to access the Space Race portal interface.', requires: 'quantum_compute', branch: 'tech' }
];

export function getMediaUpgradeCost(networksOwned: number): number {
  return calculateSingleCost(MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, networksOwned);
}

export function getTechUpgradeCost(devsOwned: number): number {
  return calculateSingleCost(TECH_UPGRADE_BASE, TECH_UPGRADE_MULT, devsOwned);
}

export function calculateFFCps(): number {
  const ff = GameState.businesses.fastFood;
  if (ff.level === 0) return 0;
  let baseDemand = GameState.activePenaltyId === 'ff_choked' ? FF_BASE_DEMAND * 0.10 : FF_BASE_DEMAND;
  if (ff.marketingActive) baseDemand *= 4.0;
  const capacity = ff.level * FF_CAPACITY_PER_LEVEL;
  const ffPriceRatio = 5.00 / ff.currentPriceSlider;
  const totalDemand = baseDemand * Math.pow(ffPriceRatio, 2);
  const sales = Math.min(capacity, totalDemand);
  const profitPerUnit = Math.max(0, ff.currentPriceSlider - FF_BASE_COST);
  let cps = sales * profitPerUnit * GameState.multipliers.globalCash;
  if (GameState.unlockedTech.includes('auto_fryers')) cps *= 1.5;
  return Math.max(0, cps);
}

export function calculateRetailCps(): number {
  const retail = GameState.businesses.retail;
  if (retail.level === 0) return 0;
  let capacity = retail.level * RETAIL_CAPACITY_PER_LEVEL;
  if (GameState.activePenaltyId === 'retail_choked') capacity *= 0.10;
  const baseDemand = retail.marketingActive ? RETAIL_BASE_DEMAND * 4.0 : RETAIL_BASE_DEMAND;
  const retailPriceRatio = 25.00 / retail.currentPriceSlider;
  const totalDemand = baseDemand * Math.pow(retailPriceRatio, 2);
  const sales = Math.min(capacity, totalDemand);
  const profitPerUnit = Math.max(0, retail.currentPriceSlider - RETAIL_BASE_COST);
  let cps = sales * profitPerUnit * GameState.multipliers.globalCash;
  if (GameState.unlockedTech.includes('high_speed_pos')) cps *= 1.5;
  return Math.max(0, cps);
}