
export interface User {
  id: string; // This will be the Firebase UID
  name: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  followers: string[]; // Array of user IDs
  following: string[]; // Array of user IDs
  'data-ai-hint'?: string;
  role: 'user' | 'admin';
  createdAt: any; // Firestore Timestamp
}

export type PostType = 'text' | 'image' | 'video' | 'link';

export interface Comment {
  id: string;
  user: Pick<User, 'username' | 'avatarUrl' | 'name'>;
  content: string;
  createdAt: string; // Should be a timestamp or parsable date string
}

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  content: string; // For text post or caption
  mediaUrl?: string; // For image/video/link URL
  createdAt: any; // Firestore Timestamp
  likes: string[]; // Array of user IDs who liked the post
  comments: Comment[];
  'data-ai-hint'?: string;
}
