import type { ActiveEventData } from '../types';

export const CRISIS_POOL: ActiveEventData[] = [
  {
    id: 'pr_nightmare',
    title: 'PR NIGHTMARE: TOXIC INGREDIENTS',
    description: 'An investigative broadcast reveals your fast food supply chain uses unapproved chemical fillers.',
    penaltyText: 'IMPACT: Total portfolio income FROZEN until executive arbitration completes.',
    options: {
      opt1: { text: 'Bribe Network Executives', costType: 'influence', costValue: 300, penaltyId: 'resolved' },
      opt2: { text: 'Run Mass Product Recall', costType: 'cash', costValue: 5000, penaltyId: 'resolved' },
      opt3: { text: 'Weather the Storm', costType: 'free', costValue: 0, penaltyId: 'ff_choked' }
    }
  },
  {
    id: 'hacker_attack',
    title: 'CYBER SECURITY BREACH: RANSOMWARE',
    description: 'A decentralized syndicate locks down your retail inventory logging servers.',
    penaltyText: 'IMPACT: Total portfolio income FROZEN until executive arbitration completes.',
    options: {
      opt1: { text: 'Deploy Encryption Countermeasures', costType: 'innovation', costValue: 120, penaltyId: 'resolved' },
      opt2: { text: 'Pay the Crypto Ransom', costType: 'cash', costValue: 12000, penaltyId: 'resolved' },
      opt3: { text: 'Refuse to Pay', costType: 'free', costValue: 0, penaltyId: 'retail_choked' }
    }
  },
  {
    id: 'antitrust_probe',
    title: 'REGULATORY SHOCK: ANTITRUST PROBE',
    description: 'Federal anti-monopoly commissions target your media market aggregation sizing patterns.',
    penaltyText: 'IMPACT: Total portfolio income FROZEN until executive arbitration completes.',
    options: {
      opt1: { text: 'Deploy Washington Lobbyists', costType: 'influence', costValue: 600, penaltyId: 'resolved' },
      opt2: { text: 'Pay Compliance Settlement', costType: 'cash', costValue: 35000, penaltyId: 'resolved' },
      opt3: { text: 'Accept Sanctions', costType: 'free', costValue: 0, penaltyId: 'media_choked' }
    }
  }
];