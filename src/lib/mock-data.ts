import type { User, Post } from './types';

export const mockUsers: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'Fatima Al-Fihri',
    username: 'fatima_alfihri',
    avatarUrl: 'https://placehold.co/100x100/17633D/E0E5DA',
    'data-ai-hint': 'woman portrait',
    bio: 'Founder of the world\'s oldest university. Seeker of knowledge and truth.',
    followers: 1204,
    following: 150,
  },
  'user-2': {
    id: 'user-2',
    name: 'Ibn Battuta',
    username: 'ibn_battuta',
    avatarUrl: 'https://placehold.co/100x100/17633D/E0E5DA',
    'data-ai-hint': 'man portrait',
    bio: 'Explorer, traveler, and storyteller. Sharing glimpses from my journeys.',
    followers: 8932,
    following: 5,
  },
  'user-3': {
    id: 'user-3',
    name: 'Aisha Bint Abu Bakr',
    username: 'aisha_bint_abubakr',
    avatarUrl: 'https://placehold.co/100x100/17633D/E0E5DA',
    'data-ai-hint': 'woman scholar',
    bio: 'Narrator of Hadith and scholar. Wife of the Prophet (PBUH).',
    followers: 1200,
    following: 1,
  },
};

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    type: 'text',
    content: 'The pursuit of knowledge is obligatory for every Muslim. Let us always strive to learn and grow, not just for ourselves, but for our communities. 🌱',
    createdAt: '3h ago',
    likes: 156,
    comments: [
      {
        id: 'comment-1-1',
        user: { username: 'ibn_battuta', name: 'Ibn Battuta', avatarUrl: 'https://placehold.co/100x100/17633D/E0E5DA' },
        content: 'A beautiful reminder. Knowledge illuminates the path.',
        createdAt: '2h ago',
      },
    ],
  },
  {
    id: 'post-2',
    userId: 'user-2',
    type: 'image',
    content: 'A stunning sunset over the Sahara. The beauty in Allah\'s creation is truly limitless. SubhanAllah.',
    mediaUrl: 'https://placehold.co/600x400',
    'data-ai-hint': 'desert sunset',
    createdAt: '1d ago',
    likes: 842,
    comments: [],
  },
  {
    id: 'post-3',
    userId: 'user-1',
    type: 'link',
    content: 'Sharing this insightful lecture on the history of Islamic art and its spiritual significance. Highly recommended for anyone interested in our rich heritage.',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder link
    createdAt: '2d ago',
    likes: 302,
    comments: [],
  },
  {
    id: 'post-4',
    userId: 'user-3',
    type: 'text',
    content: 'The Prophet (ﷺ) said, "The best among you are those who have the best manners and character."',
    createdAt: '5d ago',
    likes: 2105,
    comments: [],
  },
];
