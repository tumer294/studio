
"use client";

import { useState } from "react";
import DailyWisdom from "@/components/daily-wisdom";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { mockPosts as initialMockPosts, mockUsers } from "@/lib/mock-data";
import type { Post, User } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);

  const handleCreatePost = (newPostData: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'>) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: 'user-3', // Assuming the current user is user-3
      createdAt: 'Just now',
      likes: 0,
      comments: [],
      ...newPostData,
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="space-y-6 p-4 md:p-0">
      <DailyWisdom />
      <CreatePost user={mockUsers['user-3']} onCreatePost={handleCreatePost} />
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold">Feed</h2>
        <Separator className="flex-1" />
      </div>
      <div className="space-y-4">
        {posts.map((post) => {
          const user = mockUsers[post.userId] as User | undefined;
          if (!user) return null;
          return <PostCard key={post.id} post={post} user={user} />;
        })}
      </div>
    </div>
  );
}
