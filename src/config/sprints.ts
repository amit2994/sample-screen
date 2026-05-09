export interface UserStory {
  id: string;
  title: string;
  path: string;
  screen_id: string; // The ID used in the commenting system
}

export interface Sprint {
  id: string;
  name: string;
  stories: UserStory[];
}

export const sprints: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    stories: [
      { id: 'story-1', title: 'Deposit Account Creation', path: '/sprint/1/story/1', screen_id: 'sprint1-story1' },
      { id: 'story-2', title: 'Interest Rate Configuration', path: '/sprint/1/story/2', screen_id: 'sprint1-story2' },
    ],
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2',
    stories: [
      { id: 'story-3', title: 'Account Number Generation', path: '/sprint/2/story/1', screen_id: 'sprint2-story1-deposit-account-number' },
      { id: 'story-4', title: 'Reports & Analytics', path: '/sprint/2/story/2', screen_id: 'sprint2-story2' },
      { id: 'story-5', title: 'Deposit Fund Transfer (CF)', path: '/sprint/2/story/3', screen_id: 'sprint2-story3-deposit-fund-transfer' },
      { id: 'story-6', title: 'Sub-PD Creation', path: '/sprint/2/story/4', screen_id: 'sprint2-story4-sub-pd-creation' },
      { id: 'story-7', title: 'Deposit Fund Transfer (Challan)', path: '/sprint/2/story/5', screen_id: 'sprint2-story5-deposit-fund-transfer-challan' },
      { id: 'story-8', title: 'Sub-PD Bill Creation', path: '/sprint/2/story/6', screen_id: 'sprint2-story6-sub-pd-bill-creation' },
      { id: 'story-9', title: 'Payment Advice Gen.', path: '/sprint/2/story/7', screen_id: 'sprint2-story7-payment-advice-gen' },
    ],
  },
  {
    id: 'sprint-3',
    name: 'Sprint 3',
    stories: [
      { id: 'story-10', title: 'Plus–Minus Memo & Certification', path: '/sprint/3/story/1', screen_id: 'sprint3-story1-plus-minus-memo' },
      { id: 'story-11', title: 'Deposit Statement / Passbook', path: '/sprint/3/story/2', screen_id: 'sprint3-story2-deposit-statement' },
      { id: 'story-12', title: 'Deposit Lapse Management', path: '/sprint/3/story/3', screen_id: 'sprint3-story3-deposit-lapse' },
    ],
  },
];
