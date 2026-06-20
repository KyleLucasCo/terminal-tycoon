import { GameState } from './state';
import { 
  calculateFFCps, calculateRetailCps, TECH_TREE_DATA, 
  FF_UPGRADE_BASE, FF_UPGRADE_MULT, RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT,
  MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, TECH_UPGRADE_BASE, TECH_UPGRADE_MULT,
  COST_FF_MANAGER, COST_RETAIL_MANAGER, COST_MEDIA_MANAGER, COST_TECH_MANAGER,
  FF_CAPACITY_PER_LEVEL, FF_BASE_DEMAND, RETAIL_CAPACITY_PER_LEVEL, RETAIL_BASE_DEMAND,
  AIRTIME_PER_NETWORK, INNOVATION_PER_SECOND_PER_DEV, getMediaUpgradeCost, getTechUpgradeCost
} from './modules/economy';
import { STOCKS } from './modules/market.ts';
import { calculateSingleCost, calculateBulkCost } from './modules/formulas';
import type { ResourceType } from './types';

export let isModalOpenManually = false;
export function setModalViewState(open: boolean) { isModalOpenManually = open; }

function checkAffordability(type: ResourceType, value: number): boolean {
  if (type === 'cash') return GameState.cash >= value;
  if (type === 'influence') return GameState.influence >= value;
  if (type === 'innovation') return GameState.innovation >= value;
  return true;
}

const cashDisplay = document.getElementById('global-cash') as HTMLElement;
const influenceDisplay = document.getElementById('global-influence') as HTMLElement;
const innovationDisplay = document.getElementById('global-innovation') as HTMLElement;
const awaitingMsg = document.getElementById('awaiting-msg') as HTMLElement;
const techTreeContainer = document.getElementById('tech-tree-container') as HTMLElement;

const crisisBanner = document.getElementById('crisis-banner') as HTMLElement;
const crisisModal = document.getElementById('crisis-modal') as HTMLElement;
const eventTitle = document.getElementById('event-title') as HTMLElement;
const eventDesc = document.getElementById('event-desc') as HTMLElement;
const eventPenalty = document.getElementById('event-penalty') as HTMLElement;
const btnEventOpt1 = document.getElementById('btn-event-opt1') as HTMLButtonElement;
const btnEventOpt2 = document.getElementById('btn-event-opt2') as HTMLButtonElement;
const btnEventOpt3 = document.getElementById('btn-event-opt3') as HTMLButtonElement;

const ffCpsDisplay = document.getElementById('ff-cps') as HTMLElement;
const ffLevelDisplay = document.getElementById('ff-level') as HTMLElement;
const btnBuyFf = document.getElementById('btn-buy-ff') as HTMLButtonElement;
const ffCostDisplay = document.getElementById('ff-cost') as HTMLElement;
const ffManagement = document.getElementById('ff-management') as HTMLElement;
const ffCapacityDisplay = document.getElementById('ff-capacity') as HTMLElement;
const ffDemandDisplay = document.getElementById('ff-demand') as HTMLElement;
const ffSalesDisplay = document.getElementById('ff-sales') as HTMLElement;
const ffPriceDisplay = document.getElementById('ff-price-display') as HTMLElement;
const btnFfCampaign = document.getElementById('btn-ff-campaign') as HTMLButtonElement;
const ffManagerControlBox = document.getElementById('ff-manager-control-box') as HTMLElement;
const btnProtocolFf = document.getElementById('btn-protocol-ff') as HTMLButtonElement;
const btnHireFfSupervisor = document.getElementById('btn-hire-ff-supervisor') as HTMLButtonElement;

const retailCpsDisplay = document.getElementById('retail-cps') as HTMLElement;
const retailLevelDisplay = document.getElementById('retail-level') as HTMLElement;
const btnBuyRetail = document.getElementById('btn-buy-retail') as HTMLButtonElement;
const btnBuyRetailBulk = document.getElementById('btn-buy-retail-bulk') as HTMLButtonElement;
const retailCostDisplay = document.getElementById('retail-cost') as HTMLElement;
const retailCostBulkDisplay = document.getElementById('retail-cost-bulk') as HTMLElement;
const retailManagement = document.getElementById('retail-management') as HTMLElement;
const retailCapacityDisplay = document.getElementById('retail-capacity') as HTMLElement;
const retailDemandDisplay = document.getElementById('retail-demand') as HTMLElement;
const retailSalesDisplay = document.getElementById('retail-sales') as HTMLElement;
const retailPriceDisplay = document.getElementById('retail-price-display') as HTMLElement;
const btnRetailCampaign = document.getElementById('btn-retail-campaign') as HTMLButtonElement;
const retailManagerControlBox = document.getElementById('retail-manager-control-box') as HTMLElement;
const btnProtocolRetail = document.getElementById('btn-protocol-retail') as HTMLButtonElement;
const btnHireRetailManager = document.getElementById('btn-hire-retail-manager') as HTMLButtonElement;

const mediaAirtimeDisplay = document.getElementById('media-airtime') as HTMLElement;
const mediaNetworksDisplay = document.getElementById('media-networks') as HTMLElement;
const btnBuyMedia = document.getElementById('btn-buy-media') as HTMLButtonElement;
const btnBuyMediaBulk = document.getElementById('btn-buy-media-bulk') as HTMLButtonElement;
const mediaCostDisplay = document.getElementById('media-cost') as HTMLElement;
const mediaCostBulkDisplay = document.getElementById('media-cost-bulk') as HTMLElement;
const mediaManagement = document.getElementById('media-management') as HTMLElement;
const mediaOutputDesc = document.getElementById('media-output-desc') as HTMLElement;
const btnCampPropaganda = document.getElementById('btn-camp-propaganda') as HTMLButtonElement;
const btnCampHype = document.getElementById('btn-camp-hype') as HTMLButtonElement;
const mediaManagerControlBox = document.getElementById('media-manager-control-box') as HTMLElement;
const btnProtocolMedia = document.getElementById('btn-protocol-media') as HTMLButtonElement;
const btnHireMediaManager = document.getElementById('btn-hire-media-manager') as HTMLButtonElement;

const techIpsDisplay = document.getElementById('tech-ips') as HTMLElement;
const techDevsDisplay = document.getElementById('tech-devs') as HTMLElement;
const btnBuyTech = document.getElementById('btn-buy-tech') as HTMLButtonElement;
const btnBuyTechBulk = document.getElementById('btn-buy-tech-bulk') as HTMLButtonElement;
const techCostDisplay = document.getElementById('tech-cost') as HTMLElement;
const techCostBulkDisplay = document.getElementById('tech-cost-bulk') as HTMLElement;
const techManagement = document.getElementById('tech-management') as HTMLElement;
const techManagerControlBox = document.getElementById('tech-manager-control-box') as HTMLElement;
const btnProtocolTech = document.getElementById('btn-protocol-tech') as HTMLButtonElement;
const btnHireTechManager = document.getElementById('btn-hire-tech-manager') as HTMLButtonElement;

const stockKorpOwned = document.getElementById('stock-korp-owned') as HTMLElement;
const stockKorpPrice = document.getElementById('stock-korp-price') as HTMLElement;
const btnBuyKorp = document.getElementById('btn-buy-korp-10') as HTMLButtonElement;
const btnSellKorp = document.getElementById('btn-sell-korp-10') as HTMLButtonElement;
const stockVltcOwned = document.getElementById('stock-vltc-owned') as HTMLElement;
const stockVltcPrice = document.getElementById('stock-vltc-price') as HTMLElement;
const btnBuyVltc = document.getElementById('btn-buy-vltc-10') as HTMLButtonElement;
const btnSellVltc = document.getElementById('btn-sell-vltc-10') as HTMLButtonElement;
const stockSldgOwned = document.getElementById('stock-sldg-owned') as HTMLElement;
const stockSldgPrice = document.getElementById('stock-sldg-price') as HTMLElement;
const btnBuySldg = document.getElementById('btn-buy-sldg-10') as HTMLButtonElement;
const btnSellSldg = document.getElementById('btn-sell-sldg-10') as HTMLButtonElement;

export function updateUI() {
  if (!cashDisplay) return;
  
  cashDisplay.innerText = `$${GameState.cash.toFixed(2)}`;
  influenceDisplay.innerText = Math.floor(GameState.influence).toLocaleString();
  innovationDisplay.innerText = Math.floor(GameState.innovation).toLocaleString();

  const ff = GameState.businesses.fastFood;
  const retail = GameState.businesses.retail;
  const media = GameState.businesses.media;
  const tech = GameState.businesses.tech;

  if (ff.unlocked || retail.unlocked || media.unlocked || tech.unlocked) awaitingMsg.classList.add('hidden');

  if (GameState.activeEvent) {
    crisisBanner.classList.remove('hidden');
    if (isModalOpenManually) {
      crisisModal.classList.remove('hidden');
      eventTitle.innerText = `⚠️ ${GameState.activeEvent.title}`;
      eventDesc.innerText = GameState.activeEvent.description;
      eventPenalty.innerText = GameState.activeEvent.penaltyText;
      
      const o1 = GameState.activeEvent.options.opt1;
      const o2 = GameState.activeEvent.options.opt2;
      const o3 = GameState.activeEvent.options.opt3;

      btnEventOpt1.innerText = `${o1.text} (${o1.costValue} ${o1.costType.toUpperCase()})`;
      btnEventOpt2.innerText = `${o2.text} (${o2.costValue} ${o2.costType.toUpperCase()})`;
      btnEventOpt3.innerText = `${o3.text}`;

      btnEventOpt1.disabled = !checkAffordability(o1.costType, o1.costValue);
      btnEventOpt2.disabled = !checkAffordability(o2.costType, o2.costValue);
      btnEventOpt3.disabled = false;
    } else { crisisModal.classList.add('hidden'); }
  } else { crisisBanner.classList.add('hidden'); crisisModal.classList.add('hidden'); }

  ffLevelDisplay.innerText = ff.level.toString();
  if (ff.unlocked) ffManagement.classList.remove('hidden');
  const costScaleFactor = GameState.unlockedTech.includes('quantum_compute') ? 0.85 : 1.0;
  
  const nextFfUpgradeCost = Math.floor(calculateSingleCost(FF_UPGRADE_BASE, FF_UPGRADE_MULT, ff.level) * costScaleFactor);
  const nextFfBulkCost = Math.floor(calculateBulkCost(FF_UPGRADE_BASE, FF_UPGRADE_MULT, ff.level, 5) * costScaleFactor);
  ffCostDisplay.innerText = nextFfUpgradeCost.toLocaleString();
  const ffCostBulkDisplay = document.getElementById('ff-cost-bulk') as HTMLElement;
  if (ffCostBulkDisplay) ffCostBulkDisplay.innerText = nextFfBulkCost.toLocaleString();
  ffCpsDisplay.innerText = calculateFFCps().toFixed(2);
  ffPriceDisplay.innerText = ff.currentPriceSlider.toFixed(2);

  if (ff.level > 0) {
    const capacity = ff.level * FF_CAPACITY_PER_LEVEL;
    let baseDemand = GameState.activeEvent?.id === 'ff_choked' ? FF_BASE_DEMAND * 0.10 : FF_BASE_DEMAND;
    if (ff.marketingActive) baseDemand *= 4.0;
    const ffPriceRatio = 5.00 / ff.currentPriceSlider;
    const totalDemand = baseDemand * Math.pow(ffPriceRatio, 2);
    ffCapacityDisplay.innerText = capacity.toFixed(0);
    ffDemandDisplay.innerText = totalDemand.toFixed(0);
    ffSalesDisplay.innerText = Math.min(capacity, totalDemand).toFixed(0);
    ffDemandDisplay.style.color = totalDemand > capacity ? "var(--neon-red)" : "var(--text-main)";
  }

  if (ff.marketingActive) { btnFfCampaign.innerText = `ADS SURGING: ${ff.marketingTimer.toFixed(1)}s`; btnFfCampaign.disabled = true; } 
  else { btnFfCampaign.innerText = `LAUNCH LIVE AD CAMPAIGN ($150)`; btnFfCampaign.disabled = GameState.cash < 150; }

  if (ff.managerHired) { btnHireFfSupervisor.classList.add('hidden'); ffManagerControlBox.classList.remove('hidden'); btnProtocolFf.innerText = `MODE: ${ff.managerProtocol.toUpperCase()}`; } 
  else { btnHireFfSupervisor.classList.remove('hidden'); ffManagerControlBox.classList.add('hidden'); btnHireFfSupervisor.disabled = GameState.cash < COST_FF_MANAGER; }

  retailLevelDisplay.innerText = retail.level.toString();
  if (retail.unlocked) retailManagement.classList.remove('hidden');
  const nextRetailUpgradeCost = Math.floor(calculateSingleCost(RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT, retail.level) * costScaleFactor);
  const nextRetailBulkCost = Math.floor(calculateBulkCost(RETAIL_UPGRADE_BASE, RETAIL_UPGRADE_MULT, retail.level, 5) * costScaleFactor);
  retailCostDisplay.innerText = nextRetailUpgradeCost.toLocaleString();
  if (retailCostBulkDisplay) retailCostBulkDisplay.innerText = nextRetailBulkCost.toLocaleString();
  retailCpsDisplay.innerText = calculateRetailCps().toFixed(2);
  retailPriceDisplay.innerText = retail.currentPriceSlider.toFixed(2);

  if (retail.level > 0) {
    let capacity = retail.level * RETAIL_CAPACITY_PER_LEVEL;
    if (GameState.activeEvent?.id === 'supply_crunch') capacity *= 0.5;
    let baseDemand = RETAIL_BASE_DEMAND;
    if (retail.marketingActive) baseDemand *= 4.0;
    const retailPriceRatio = 25.00 / retail.currentPriceSlider;
    const totalDemand = baseDemand * Math.pow(retailPriceRatio, 2);
    retailCapacityDisplay.innerText = capacity.toFixed(0);
    retailDemandDisplay.innerText = totalDemand.toFixed(0);
    retailSalesDisplay.innerText = Math.min(capacity, totalDemand).toFixed(0);
    retailDemandDisplay.style.color = totalDemand > capacity ? "var(--neon-red)" : "var(--text-main)";
  }

  if (retail.marketingActive) { btnRetailCampaign.innerText = `SOCIAL SURGE: ${retail.marketingTimer.toFixed(1)}s`; btnRetailCampaign.disabled = true; } 
  else { btnRetailCampaign.innerText = `LAUNCH SOCIAL CAMPAIGN ($750)`; btnRetailCampaign.disabled = GameState.cash < 750; }

  if (retail.managerHired) { btnHireRetailManager.classList.add('hidden'); retailManagerControlBox.classList.remove('hidden'); btnProtocolRetail.innerText = `MODE: ${retail.managerProtocol.toUpperCase()}`; } 
  else { btnHireRetailManager.classList.remove('hidden'); retailManagerControlBox.classList.add('hidden'); btnHireRetailManager.disabled = GameState.cash < COST_RETAIL_MANAGER; }

  mediaNetworksDisplay.innerText = media.networksOwned.toString();
  mediaAirtimeDisplay.innerText = (media.networksOwned * AIRTIME_PER_NETWORK).toString();
  if (media.unlocked) mediaManagement.classList.remove('hidden');
  const nextMediaCost = Math.floor(getMediaUpgradeCost(media.networksOwned) * costScaleFactor);
  const nextMediaBulkCost = Math.floor(calculateBulkCost(MEDIA_UPGRADE_BASE, MEDIA_UPGRADE_MULT, media.networksOwned, 5) * costScaleFactor);
  mediaCostDisplay.innerText = nextMediaCost.toLocaleString();
  if (mediaCostBulkDisplay) mediaCostBulkDisplay.innerText = nextMediaBulkCost.toLocaleString();

  let hypePerNetwork = GameState.unlockedTech.includes('market_manip') ? 50 : 25;
  if (media.networksOwned === 0) { mediaOutputDesc.innerText = "Station dark — No networks acquired."; }
  else if (media.activeCampaign === 'propaganda') { 
    let inflMult = GameState.unlockedTech.includes('subliminal_feeds') ? 2.0 : 1.0;
    mediaOutputDesc.innerText = `Generating Influence (+ ${(media.networksOwned * 2.5 * inflMult).toFixed(1)} /sec)`; 
  } else { mediaOutputDesc.innerText = `Amplifying Corporate Output (+ ${(media.networksOwned * hypePerNetwork)}% Total Revenue)`; }

  if (media.activeCampaign === 'propaganda') {
    btnCampPropaganda.style.backgroundColor = "var(--text-main)"; btnCampPropaganda.style.color = "var(--bg-color)"; btnCampHype.style.backgroundColor = "transparent"; btnCampHype.style.color = "var(--text-main)";
  } else {
    btnCampHype.style.backgroundColor = "var(--text-main)"; btnCampHype.style.color = "var(--bg-color)"; btnCampPropaganda.style.backgroundColor = "transparent"; btnCampPropaganda.style.color = "var(--text-main)";
  }

  if (media.managerHired) { btnHireMediaManager.classList.add('hidden'); mediaManagerControlBox.classList.remove('hidden'); btnProtocolMedia.innerText = `MODE: ${media.managerProtocol.toUpperCase()}`; } 
  else { btnHireMediaManager.classList.remove('hidden'); mediaManagerControlBox.classList.add('hidden'); btnHireMediaManager.disabled = GameState.cash < COST_MEDIA_MANAGER; }

  techDevsDisplay.innerText = tech.devsOwned.toString();
  techIpsDisplay.innerText = (tech.devsOwned * INNOVATION_PER_SECOND_PER_DEV).toFixed(0);
  if (tech.unlocked) techManagement.classList.remove('hidden');
  const nextTechCost = Math.floor(getTechUpgradeCost(tech.devsOwned) * costScaleFactor);
  const nextTechBulkCost = Math.floor(calculateBulkCost(TECH_UPGRADE_BASE, TECH_UPGRADE_MULT, tech.devsOwned, 5) * costScaleFactor);
  techCostDisplay.innerText = nextTechCost.toLocaleString();
  if (techCostBulkDisplay) techCostBulkDisplay.innerText = nextTechBulkCost.toLocaleString();

  if (tech.managerHired) { btnHireTechManager.classList.add('hidden'); techManagerControlBox.classList.remove('hidden'); btnProtocolTech.innerText = `MODE: ${tech.managerProtocol.toUpperCase()}`; } 
  else { btnHireTechManager.classList.remove('hidden'); techManagerControlBox.classList.add('hidden'); btnHireTechManager.disabled = GameState.cash < COST_TECH_MANAGER; }

  stockKorpOwned.innerText = GameState.sharesOwned.KORP.toString();
  stockKorpPrice.innerText = `$${STOCKS[0].currentPrice.toFixed(2)}`;
  stockKorpPrice.style.color = STOCKS[0].currentPrice > STOCKS[0].previousPrice ? 'var(--neon-green)' : STOCKS[0].currentPrice < STOCKS[0].previousPrice ? 'var(--neon-red)' : 'var(--text-main)';
  btnBuyKorp.disabled = GameState.cash < STOCKS[0].currentPrice * 10;
  btnSellKorp.disabled = GameState.sharesOwned.KORP < 10;

  stockVltcOwned.innerText = GameState.sharesOwned.VLTC.toString();
  stockVltcPrice.innerText = `$${STOCKS[1].currentPrice.toFixed(2)}`;
  stockVltcPrice.style.color = STOCKS[1].currentPrice > STOCKS[1].previousPrice ? 'var(--neon-green)' : STOCKS[1].currentPrice < STOCKS[1].previousPrice ? 'var(--neon-red)' : 'var(--text-main)';
  btnBuyVltc.disabled = GameState.cash < STOCKS[1].currentPrice * 10;
  btnSellVltc.disabled = GameState.sharesOwned.VLTC < 10;

  stockSldgOwned.innerText = GameState.sharesOwned.SLDG.toString();
  stockSldgPrice.innerText = `$${STOCKS[2].currentPrice.toFixed(2)}`;
  stockSldgPrice.style.color = STOCKS[2].currentPrice > STOCKS[2].previousPrice ? 'var(--neon-green)' : STOCKS[2].currentPrice < STOCKS[2].previousPrice ? 'var(--neon-red)' : 'var(--text-main)';
  btnBuySldg.disabled = GameState.cash < STOCKS[2].currentPrice * 10;
  btnSellSldg.disabled = GameState.sharesOwned.SLDG < 10;

  let treeHtml = '';
  TECH_TREE_DATA.forEach((node) => {
    const isUnlocked = GameState.unlockedTech.includes(node.id);
    const hasRequirement = node.requires === null || GameState.unlockedTech.includes(node.requires);
    let branchColor = node.branch === 'media' ? '#da70d6' : node.branch === 'tech' ? '#00ffff' : '#00ff41';
    
    if (isUnlocked) { treeHtml += `<div class="tech-node-card" style="border: 1px solid var(--text-muted); padding: 8px; margin-top: 5px; opacity: 0.5;"><p style="color: var(--text-muted)">[RESEARCHED] ${node.name}</p></div>`; }
    else if (hasRequirement) {
      const canAfford = GameState.innovation >= node.cost;
      treeHtml += `<div class="tech-node-card" style="border: 1px solid var(--border-color); padding: 8px; margin-top: 5px;"><p style="color: ${branchColor}; font-size:0.9rem;">${node.name} (${node.cost} Innovation)</p><p style="font-size:0.8rem; color: var(--text-muted); margin: 3px 0;">${node.description}</p><button class="action-btn btn-research-node" data-id="${node.id}" ${canAfford ? '' : 'disabled'} style="font-size:0.75rem; padding: 4px; margin-top:5px;">Deploy Research</button></div>`;
    } else { treeHtml += `<div class="tech-node-card" style="border: 1px dotted #333; padding: 8px; margin-top: 5px; text-align: center;"><p style="color: var(--text-muted); font-size:0.85rem;">[ENCRYPTED DATA SEGMENT]</p></div>`; }
  });
  techTreeContainer.innerHTML = treeHtml;

  btnBuyFf.disabled = GameState.cash < nextFfUpgradeCost;
  const btnBuyFfBulk = document.getElementById('btn-buy-ff-bulk') as HTMLButtonElement;
  if (btnBuyFfBulk) btnBuyFfBulk.disabled = GameState.cash < nextFfBulkCost;
  btnBuyRetail.disabled = GameState.cash < nextRetailUpgradeCost;
  if (btnBuyRetailBulk) btnBuyRetailBulk.disabled = GameState.cash < nextRetailBulkCost;
  btnBuyMedia.disabled = GameState.cash < nextMediaCost;
  if (btnBuyMediaBulk) btnBuyMediaBulk.disabled = GameState.cash < nextMediaBulkCost;
  btnBuyTech.disabled = GameState.cash < nextTechCost;
  if (btnBuyTechBulk) btnBuyTechBulk.disabled = GameState.cash < nextTechBulkCost;
}