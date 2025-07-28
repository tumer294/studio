export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  followers: number;
  following: number;
  'data-ai-hint'?: string;
}

export type PostType = 'text' | 'image' | 'video' | 'link';

export interface Comment {
  id: string;
  user: Pick<User, 'username' | 'avatarUrl' | 'name'>;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  content: string; // For text post or caption
  mediaUrl?: string; // For image/video/link URL
  createdAt: string;
  likes: number;
  comments: Comment[];
  'data-ai-hint'?: string;
}
