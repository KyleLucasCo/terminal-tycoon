import { GameState } from './state';
import { updateUI } from './ui';
import { tickMarket } from './modules/market.ts';
import { 
  calculateFFCps, calculateRetailCps, 
  FF_UPGRADE_BASE, FF_UPGRADE_MULT, RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT,
  MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, TECH_UPGRADE_BASE, TECH_UPGRADE_MULT,
  INFLUENCE_PER_SECOND_PER_NETWORK, INNOVATION_PER_SECOND_PER_DEV
} from './modules/economy';
import { CRISIS_POOL } from './modules/eventsData';
import { calculateSingleCost, calculateBulkCost } from './modules/formulas';

export const TICK_RATE = 100;
const MARKET_TICK_INTERVAL = 2000;
let marketAccumulator = 0;

export function calculateNextEventInterval(): number {
  const min = 60000;
  const max = 300000;
  return Date.now() + Math.floor(Math.random() * (max - min + 1) + min);
}

function isCrisisUnlocked(): boolean {
  const distinctOwnedBusinessCount = [
    GameState.businesses.fastFood.unlocked,
    GameState.businesses.retail.unlocked,
    GameState.businesses.media.unlocked,
    GameState.businesses.tech.unlocked
  ].filter(Boolean).length;
  return GameState.lifetimeCash >= 5000 || distinctOwnedBusinessCount >= 2;
}

function creditOfflineProgress() {
  const now = Date.now();
  const deltaSeconds = Math.max(0, (now - GameState.lastTickTime) / 1000);
  if (deltaSeconds <= 0) {
    GameState.lastTickTime = now;
    return;
  }

  const media = GameState.businesses.media;
  const tech = GameState.businesses.tech;
  const ffIncome = calculateFFCps() * deltaSeconds;
  const retailIncome = calculateRetailCps() * deltaSeconds;
  const offlineIncome = ffIncome + retailIncome;

  if (offlineIncome > 0) {
    GameState.cash += offlineIncome;
    GameState.lifetimeCash += offlineIncome;
  }

  if (media.unlocked && media.activeCampaign === 'propaganda' && GameState.activePenaltyId !== 'media_choked') {
    const inflMult = GameState.unlockedTech.includes('subliminal_feeds') ? 2.0 : 1.0;
    GameState.influence += (media.networksOwned * INFLUENCE_PER_SECOND_PER_NETWORK * inflMult) * deltaSeconds;
  }

  if (tech.unlocked) {
    GameState.innovation += (tech.devsOwned * INNOVATION_PER_SECOND_PER_DEV) * deltaSeconds;
  }

  GameState.lastTickTime = now;
}

function gameLoop() {
  const now = Date.now();
  const deltaTime = now - GameState.lastTickTime;
  const secondsPassed = deltaTime / 1000;
  
  const ff = GameState.businesses.fastFood;
  const retail = GameState.businesses.retail;
  const media = GameState.businesses.media;
  const tech = GameState.businesses.tech;

  if (ff.marketingActive) { ff.marketingTimer -= secondsPassed; if (ff.marketingTimer <= 0) ff.marketingActive = false; }
  if (retail.marketingActive) { retail.marketingTimer -= secondsPassed; if (retail.marketingTimer <= 0) retail.marketingActive = false; }

  marketAccumulator += deltaTime;
  while (marketAccumulator >= MARKET_TICK_INTERVAL) {
    tickMarket();
    marketAccumulator -= MARKET_TICK_INTERVAL;
  }

  if (!GameState.activeEvent && now > GameState.nextEventTime) {
    if (isCrisisUnlocked()) {
      const randomIndex = Math.floor(Math.random() * CRISIS_POOL.length);
      GameState.activeEvent = { ...CRISIS_POOL[randomIndex] };
    } else {
      GameState.nextEventTime = calculateNextEventInterval();
    }
  }

  if (GameState.activeEvent) {
    GameState.lastTickTime = now;
    updateUI();
    return;
  }

  if (ff.managerHired && ff.managerProtocol !== 'off') {
    const isBulk = ff.managerProtocol === 'bulk';
    const cost = isBulk ? calculateBulkCost(FF_UPGRADE_BASE, FF_UPGRADE_MULT, ff.level, 5) : calculateSingleCost(FF_UPGRADE_BASE, FF_UPGRADE_MULT, ff.level);
    if (GameState.cash >= cost) { GameState.cash -= cost; ff.level += isBulk ? 5 : 1; }
  }
  if (retail.managerHired && retail.managerProtocol !== 'off') {
    const isBulk = retail.managerProtocol === 'bulk';
    const cost = isBulk ? calculateBulkCost(RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT, retail.level, 5) : calculateSingleCost(RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT, retail.level);
    if (GameState.cash >= cost) { GameState.cash -= cost; retail.level += isBulk ? 5 : 1; }
  }
  if (media.managerHired && media.managerProtocol !== 'off') {
    const isBulk = media.managerProtocol === 'bulk';
    const cost = isBulk ? calculateBulkCost(MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, media.networksOwned, 5) : calculateSingleCost(MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, media.networksOwned);
    if (GameState.cash >= cost) { GameState.cash -= cost; media.networksOwned += isBulk ? 5 : 1; media.unlocked = true; }
  }
  if (tech.managerHired && tech.managerProtocol !== 'off') {
    const isBulk = tech.managerProtocol === 'bulk';
    const cost = isBulk ? calculateBulkCost(TECH_UPGRADE_BASE, TECH_UPGRADE_MULT, tech.devsOwned, 5) : calculateSingleCost(TECH_UPGRADE_BASE, TECH_UPGRADE_MULT, tech.devsOwned);
    if (GameState.cash >= cost) { GameState.cash -= cost; tech.devsOwned += isBulk ? 5 : 1; tech.unlocked = true; }
  }

  const hypePerNetwork = GameState.unlockedTech.includes('market_manip') ? 0.50 : 0.25;
  const mediaChoked = GameState.activePenaltyId === 'media_choked';
  GameState.multipliers.globalCash = media.unlocked && media.activeCampaign === 'hype' && !mediaChoked
    ? 1.0 + (media.networksOwned * hypePerNetwork)
    : 1.0;
  
  const earnedCash = (calculateFFCps() + calculateRetailCps()) * secondsPassed;
  if (earnedCash > 0) {
    GameState.cash += earnedCash;
    GameState.lifetimeCash += earnedCash;
  }

  if (media.unlocked && media.activeCampaign === 'propaganda' && !mediaChoked) {
    const inflMult = GameState.unlockedTech.includes('subliminal_feeds') ? 2.0 : 1.0;
    GameState.influence += (media.networksOwned * INFLUENCE_PER_SECOND_PER_NETWORK * inflMult) * secondsPassed;
  }
  if (tech.unlocked) GameState.innovation += (tech.devsOwned * INNOVATION_PER_SECOND_PER_DEV) * secondsPassed;

  GameState.lastTickTime = now;
  updateUI();
}

export function startEngine() {
  creditOfflineProgress();
  GameState.nextEventTime = calculateNextEventInterval();
  marketAccumulator = 0;
  setInterval(gameLoop, TICK_RATE);
}