export type ManagerProtocol = 'off' | 'single' | 'bulk';
export type ResourceType = 'cash' | 'influence' | 'innovation' | 'free';

export interface BusinessState {
  unlocked: boolean;
  level: number;
  currentPriceSlider: number;
  marketingActive: boolean;
  marketingTimer: number;
  managerHired: boolean;
  managerProtocol: ManagerProtocol;
}

export interface MediaState {
  unlocked: boolean;
  networksOwned: number;
  activeCampaign: 'propaganda' | 'hype';
  managerHired: boolean;
  managerProtocol: ManagerProtocol;
}

export interface TechState {
  unlocked: boolean;
  devsOwned: number;
  managerHired: boolean;
  managerProtocol: ManagerProtocol;
}

export interface EventOption {
  text: string;
  costType: ResourceType;
  costValue: number;
  penaltyId: string;
}

export interface ActiveEventData {
  id: string;
  title: string;
  description: string;
  penaltyText: string;
  options: {
    opt1: EventOption;
    opt2: EventOption;
    opt3: EventOption;
  };
}

export interface TechTreeNode {
  id: string;
  name: string;
  cost: number;
  description: string;
  requires: string | null;
  branch: 'core' | 'media' | 'tech';
}

export interface StockAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  volatility: number;
  trend: number;
}

export interface GameStateData {
  cash: number;
  lifetimeCash: number;
  influence: number;
  innovation: number;
  lastTickTime: number;
  activeEvent: ActiveEventData | null;
  activePenaltyId: string | null;
  nextEventTime: number;
  unlockedTech: string[];
  businesses: {
    fastFood: BusinessState;
    retail: BusinessState;
    media: MediaState;
    tech: TechState;
  };
  sharesOwned: Record<string, number>;
  multipliers: {
    globalCash: number;
    marketingDemand: number;
    upgradeCostReduction: number;
  };
}