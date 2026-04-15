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
    ],
  },
];
