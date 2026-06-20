import type { GameStateData } from './types';

export const INITIAL_STATE: GameStateData = {
  cash: 500,
  lifetimeCash: 500,
  influence: 0,
  innovation: 0,
  lastTickTime: Date.now(),
  activeEvent: null,
  activePenaltyId: null,
  nextEventTime: Date.now() + 45000,
  unlockedTech: [],
  businesses: {
    fastFood: { unlocked: false, level: 0, currentPriceSlider: 5.00, marketingActive: false, marketingTimer: 0, managerHired: false, managerProtocol: 'off' },
    retail: { unlocked: false, level: 0, currentPriceSlider: 25.00, marketingActive: false, marketingTimer: 0, managerHired: false, managerProtocol: 'off' },
    media: { unlocked: false, networksOwned: 0, activeCampaign: 'propaganda', managerHired: false, managerProtocol: 'off' },
    tech: { unlocked: false, devsOwned: 0, managerHired: false, managerProtocol: 'off' }
  },
  sharesOwned: { KORP: 0, VLTC: 0, SLDG: 0 },
  multipliers: { globalCash: 1.0, marketingDemand: 1.0, upgradeCostReduction: 1.0 }
};

export const GameState: GameStateData = JSON.parse(JSON.stringify(INITIAL_STATE));

const SAVE_KEY = 'terminal_tycoon_save_v1';

export function saveGame(): void {
  GameState.lastTickTime = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(GameState));
}

export function loadGame(): boolean {
  const rawSave = localStorage.getItem(SAVE_KEY);
  if (!rawSave) return false;

  try {
    const parsed = JSON.parse(rawSave);
    
    GameState.cash = parsed.cash ?? INITIAL_STATE.cash;
    GameState.lifetimeCash = parsed.lifetimeCash ?? INITIAL_STATE.lifetimeCash;
    GameState.influence = parsed.influence ?? INITIAL_STATE.influence;
    GameState.innovation = parsed.innovation ?? INITIAL_STATE.innovation;
    GameState.lastTickTime = parsed.lastTickTime ?? INITIAL_STATE.lastTickTime;
    GameState.nextEventTime = parsed.nextEventTime ?? INITIAL_STATE.nextEventTime;
    GameState.activeEvent = parsed.activeEvent ?? INITIAL_STATE.activeEvent;
    GameState.activePenaltyId = parsed.activePenaltyId ?? INITIAL_STATE.activePenaltyId;
    GameState.unlockedTech = parsed.unlockedTech ?? [];
    Object.assign(GameState.multipliers, INITIAL_STATE.multipliers, parsed.multipliers ?? {});
    
    if (parsed.businesses) {
      Object.assign(GameState.businesses.fastFood, parsed.businesses.fastFood);
      Object.assign(GameState.businesses.retail, parsed.businesses.retail);
      Object.assign(GameState.businesses.media, parsed.businesses.media);
      Object.assign(GameState.businesses.tech, parsed.businesses.tech);
    }
    Object.assign(GameState.sharesOwned, INITIAL_STATE.sharesOwned, parsed.sharesOwned ?? {});
    
    return true;
  } catch (e) {
    console.error("Failed to parse save file:", e);
    return false;
  }
}