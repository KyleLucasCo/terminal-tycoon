import './style.css';
import { GameState, loadGame } from './state';
import { startEngine, calculateNextEventInterval } from './engine';
import { updateUI, setModalViewState } from './ui';
import { STOCKS } from './modules/market.ts';
import { 
  FF_UPGRADE_BASE, FF_UPGRADE_MULT, RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT,
  MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, TECH_UPGRADE_BASE, TECH_UPGRADE_MULT,
  COST_FF_MANAGER, COST_RETAIL_MANAGER, COST_MEDIA_MANAGER, COST_TECH_MANAGER,
  TECH_TREE_DATA, getMediaUpgradeCost, getTechUpgradeCost
} from './modules/economy';
import { calculateSingleCost, calculateBulkCost } from './modules/formulas';
import type { ManagerProtocol, ResourceType } from './types';

const PROTOCOLS: ManagerProtocol[] = ['off', 'single', 'bulk'];
function cycleProtocol(current: ManagerProtocol): ManagerProtocol {
  const nextIndex = (PROTOCOLS.indexOf(current) + 1) % PROTOCOLS.length;
  return PROTOCOLS[nextIndex];
}

function processDeduction(type: ResourceType, value: number) {
  if (type === 'cash') GameState.cash -= value;
  if (type === 'influence') GameState.influence -= value;
  if (type === 'innovation') GameState.innovation -= value;
  if (type === 'free') return;
}

function setupInteractions() {
  const btnBuyFf = document.getElementById('btn-buy-ff') as HTMLButtonElement;
  const btnBuyFfBulk = document.getElementById('btn-buy-ff-bulk') as HTMLButtonElement;
  const ffPriceSlider = document.getElementById('ff-price-slider') as HTMLInputElement;
  const btnFfCampaign = document.getElementById('btn-ff-campaign') as HTMLButtonElement;
  const btnProtocolFf = document.getElementById('btn-protocol-ff') as HTMLButtonElement;
  const btnHireFfSupervisor = document.getElementById('btn-hire-ff-supervisor') as HTMLButtonElement;

  const btnBuyRetail = document.getElementById('btn-buy-retail') as HTMLButtonElement;
  const btnBuyRetailBulk = document.getElementById('btn-buy-retail-bulk') as HTMLButtonElement;
  const retailPriceSlider = document.getElementById('retail-price-slider') as HTMLInputElement;
  const btnRetailCampaign = document.getElementById('btn-retail-campaign') as HTMLButtonElement;
  const btnProtocolRetail = document.getElementById('btn-protocol-retail') as HTMLButtonElement;
  const btnHireRetailManager = document.getElementById('btn-hire-retail-manager') as HTMLButtonElement;

  const btnBuyMedia = document.getElementById('btn-buy-media') as HTMLButtonElement;
  const btnBuyMediaBulk = document.getElementById('btn-buy-media-bulk') as HTMLButtonElement;
  const btnCampPropaganda = document.getElementById('btn-camp-propaganda') as HTMLButtonElement;
  const btnCampHype = document.getElementById('btn-camp-hype') as HTMLButtonElement;
  const btnProtocolMedia = document.getElementById('btn-protocol-media') as HTMLButtonElement;
  const btnHireMediaManager = document.getElementById('btn-hire-media-manager') as HTMLButtonElement;

  const btnBuyTech = document.getElementById('btn-buy-tech') as HTMLButtonElement;
  const btnBuyTechBulk = document.getElementById('btn-buy-tech-bulk') as HTMLButtonElement;
  const techTreeContainer = document.getElementById('tech-tree-container') as HTMLElement;
  const btnProtocolTech = document.getElementById('btn-protocol-tech') as HTMLButtonElement;
  const btnHireTechManager = document.getElementById('btn-hire-tech-manager') as HTMLButtonElement;

  const btnBuyKorp = document.getElementById('btn-buy-korp-10') as HTMLButtonElement;
  const btnSellKorp = document.getElementById('btn-sell-korp-10') as HTMLButtonElement;
  const btnBuyVltc = document.getElementById('btn-buy-vltc-10') as HTMLButtonElement;
  const btnSellVltc = document.getElementById('btn-sell-vltc-10') as HTMLButtonElement;
  const btnBuySldg = document.getElementById('btn-buy-sldg-10') as HTMLButtonElement;
  const btnSellSldg = document.getElementById('btn-sell-sldg-10') as HTMLButtonElement;

  const crisisBanner = document.getElementById('crisis-banner') as HTMLElement;
  const btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
  const btnEventOpt1 = document.getElementById('btn-event-opt1') as HTMLButtonElement;
  const btnEventOpt2 = document.getElementById('btn-event-opt2') as HTMLButtonElement;
  const btnEventOpt3 = document.getElementById('btn-event-opt3') as HTMLButtonElement;
  
  crisisBanner.addEventListener('click', () => { setModalViewState(true); updateUI(); });
  btnCloseModal.addEventListener('click', () => { setModalViewState(false); updateUI(); });

  // --- FAST FOOD ---
  btnBuyFf.addEventListener('click', () => {
    const cost = calculateSingleCost(FF_UPGRADE_BASE, FF_UPGRADE_MULT, GameState.businesses.fastFood.level);
    if (GameState.cash >= cost) {
      GameState.cash -= cost;
      GameState.businesses.fastFood.level = Math.max(1, GameState.businesses.fastFood.level + 1);
      GameState.businesses.fastFood.unlocked = true;
      updateUI();
    }
  });
  btnBuyFfBulk.addEventListener('click', () => {
    const cost = calculateBulkCost(FF_UPGRADE_BASE, FF_UPGRADE_MULT, GameState.businesses.fastFood.level, 5);
    if (GameState.cash >= cost) { GameState.cash -= cost; GameState.businesses.fastFood.level += 5; GameState.businesses.fastFood.unlocked = true; updateUI(); }
  });
  ffPriceSlider.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement; GameState.businesses.fastFood.currentPriceSlider = parseFloat(target.value); updateUI(); 
  });
  btnFfCampaign.addEventListener('click', () => {
    if (GameState.cash >= 150) { GameState.cash -= 150; GameState.businesses.fastFood.marketingActive = true; GameState.businesses.fastFood.marketingTimer = 30; updateUI(); }
  });
  btnProtocolFf.addEventListener('click', () => { GameState.businesses.fastFood.managerProtocol = cycleProtocol(GameState.businesses.fastFood.managerProtocol); updateUI(); });
  btnHireFfSupervisor.addEventListener('click', () => {
    if (GameState.cash >= COST_FF_MANAGER) { GameState.cash -= COST_FF_MANAGER; GameState.businesses.fastFood.managerHired = true; GameState.businesses.fastFood.managerProtocol = 'off'; updateUI(); }
  });

  // --- RETAIL ---
  btnBuyRetail.addEventListener('click', () => {
    const cost = calculateSingleCost(RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT, GameState.businesses.retail.level);
    if (GameState.cash >= cost) { GameState.cash -= cost; GameState.businesses.retail.level += 1; GameState.businesses.retail.unlocked = true; updateUI(); }
  });
  btnBuyRetailBulk.addEventListener('click', () => {
    const cost = calculateBulkCost(RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT, GameState.businesses.retail.level, 5);
    if (GameState.cash >= cost) { GameState.cash -= cost; GameState.businesses.retail.level += 5; GameState.businesses.retail.unlocked = true; updateUI(); }
  });
  retailPriceSlider.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement; GameState.businesses.retail.currentPriceSlider = parseFloat(target.value); updateUI();
  });
  btnRetailCampaign.addEventListener('click', () => {
    if (GameState.cash >= 750) { GameState.cash -= 750; GameState.businesses.retail.marketingActive = true; GameState.businesses.retail.marketingTimer = 45; updateUI(); }
  });
  btnProtocolRetail.addEventListener('click', () => { GameState.businesses.retail.managerProtocol = cycleProtocol(GameState.businesses.retail.managerProtocol); updateUI(); });
  btnHireRetailManager.addEventListener('click', () => {
    if (GameState.cash >= COST_RETAIL_MANAGER) { GameState.cash -= COST_RETAIL_MANAGER; GameState.businesses.retail.managerHired = true; GameState.businesses.retail.managerProtocol = 'off'; updateUI(); }
  });

  // --- MEDIA ---
  btnBuyMedia.addEventListener('click', () => {
    const cost = getMediaUpgradeCost(GameState.businesses.media.networksOwned);
    if (GameState.cash >= cost) { GameState.cash -= cost; GameState.businesses.media.networksOwned += 1; GameState.businesses.media.unlocked = true; updateUI(); }
  });
  btnBuyMediaBulk.addEventListener('click', () => {
    const cost = calculateBulkCost(MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, GameState.businesses.media.networksOwned, 5);
    if (GameState.cash >= cost) { GameState.cash -= cost; GameState.businesses.media.networksOwned += 5; GameState.businesses.media.unlocked = true; updateUI(); }
  });
  btnCampPropaganda.addEventListener('click', () => { GameState.businesses.media.activeCampaign = 'propaganda'; updateUI(); });
  btnCampHype.addEventListener('click', () => { GameState.businesses.media.activeCampaign = 'hype'; updateUI(); });
  btnProtocolMedia.addEventListener('click', () => { GameState.businesses.media.managerProtocol = cycleProtocol(GameState.businesses.media.managerProtocol); updateUI(); });
  btnHireMediaManager.addEventListener('click', () => {
    if (GameState.cash >= COST_MEDIA_MANAGER) { GameState.cash -= COST_MEDIA_MANAGER; GameState.businesses.media.managerHired = true; GameState.businesses.media.managerProtocol = 'off'; updateUI(); }
  });

  // --- TECH ---
  btnBuyTech.addEventListener('click', () => {
    const cost = getTechUpgradeCost(GameState.businesses.tech.devsOwned);
    if (GameState.cash >= cost) { GameState.cash -= cost; GameState.businesses.tech.devsOwned += 1; GameState.businesses.tech.unlocked = true; updateUI(); }
  });
  btnBuyTechBulk.addEventListener('click', () => {
    const cost = calculateBulkCost(TECH_UPGRADE_BASE, TECH_UPGRADE_MULT, GameState.businesses.tech.devsOwned, 5);
    if (GameState.cash >= cost) { GameState.cash -= cost; GameState.businesses.tech.devsOwned += 5; GameState.businesses.tech.unlocked = true; updateUI(); }
  });
  techTreeContainer.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest('.btn-research-node') as HTMLElement | null;
    if (!button) return;
    const nodeId = button.getAttribute('data-id');
    const nodeConfig = TECH_TREE_DATA.find(n => n.id === nodeId);
    if (nodeConfig && GameState.innovation >= nodeConfig.cost) {
      GameState.innovation -= nodeConfig.cost;
      GameState.unlockedTech.push(nodeConfig.id);
      updateUI();
    }
  });
  btnProtocolTech.addEventListener('click', () => { GameState.businesses.tech.managerProtocol = cycleProtocol(GameState.businesses.tech.managerProtocol); updateUI(); });
  btnHireTechManager.addEventListener('click', () => {
    if (GameState.cash >= COST_TECH_MANAGER) { GameState.cash -= COST_TECH_MANAGER; GameState.businesses.tech.managerHired = true; GameState.businesses.tech.managerProtocol = 'off'; updateUI(); }
  });

  btnBuyKorp.addEventListener('click', () => {
    const cost = STOCKS.find((stock) => stock.symbol === 'KORP')?.currentPrice ?? 0;
    if (GameState.cash >= cost * 10) {
      GameState.cash -= cost * 10;
      GameState.sharesOwned.KORP += 10;
      updateUI();
    }
  });

  btnSellKorp.addEventListener('click', () => {
    const cost = STOCKS.find((stock) => stock.symbol === 'KORP')?.currentPrice ?? 0;
    if (GameState.sharesOwned.KORP >= 10) {
      GameState.cash += cost * 10;
      GameState.sharesOwned.KORP -= 10;
      updateUI();
    }
  });

  btnBuyVltc.addEventListener('click', () => {
    const cost = STOCKS.find((stock) => stock.symbol === 'VLTC')?.currentPrice ?? 0;
    if (GameState.cash >= cost * 10) {
      GameState.cash -= cost * 10;
      GameState.sharesOwned.VLTC += 10;
      updateUI();
    }
  });

  btnSellVltc.addEventListener('click', () => {
    const cost = STOCKS.find((stock) => stock.symbol === 'VLTC')?.currentPrice ?? 0;
    if (GameState.sharesOwned.VLTC >= 10) {
      GameState.cash += cost * 10;
      GameState.sharesOwned.VLTC -= 10;
      updateUI();
    }
  });

  btnBuySldg.addEventListener('click', () => {
    const cost = STOCKS.find((stock) => stock.symbol === 'SLDG')?.currentPrice ?? 0;
    if (GameState.cash >= cost * 10) {
      GameState.cash -= cost * 10;
      GameState.sharesOwned.SLDG += 10;
      updateUI();
    }
  });

  btnSellSldg.addEventListener('click', () => {
    const cost = STOCKS.find((stock) => stock.symbol === 'SLDG')?.currentPrice ?? 0;
    if (GameState.sharesOwned.SLDG >= 10) {
      GameState.cash += cost * 10;
      GameState.sharesOwned.SLDG -= 10;
      updateUI();
    }
  });

  // --- CRISIS RESOLUTIONS ---
  btnEventOpt1.addEventListener('click', () => {
    if (!GameState.activeEvent) return;
    const opt = GameState.activeEvent.options.opt1;
    processDeduction(opt.costType, opt.costValue);
    GameState.activePenaltyId = null;
    GameState.activeEvent = null; setModalViewState(false); GameState.nextEventTime = calculateNextEventInterval(); updateUI();
  });

  btnEventOpt2.addEventListener('click', () => {
    if (!GameState.activeEvent) return;
    const opt = GameState.activeEvent.options.opt2;
    processDeduction(opt.costType, opt.costValue);
    GameState.activePenaltyId = null;
    GameState.activeEvent = null; setModalViewState(false); GameState.nextEventTime = calculateNextEventInterval(); updateUI();
  });

  btnEventOpt3.addEventListener('click', () => {
    if (!GameState.activeEvent) return;
    const opt = GameState.activeEvent.options.opt3;
    GameState.activeEvent = null;
    GameState.activePenaltyId = opt.penaltyId;
    setModalViewState(false);
    GameState.nextEventTime = calculateNextEventInterval();
    updateUI();
  });
}

function initGame() {
  loadGame();
  const ffPriceSlider = document.getElementById('ff-price-slider') as HTMLInputElement; if (ffPriceSlider) ffPriceSlider.value = GameState.businesses.fastFood.currentPriceSlider.toString();
  const retailPriceSlider = document.getElementById('retail-price-slider') as HTMLInputElement; if (retailPriceSlider) retailPriceSlider.value = GameState.businesses.retail.currentPriceSlider.toString();
  setupInteractions(); updateUI(); startEngine();
}

initGame();