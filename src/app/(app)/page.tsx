
"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import DailyWisdom from "@/components/daily-wisdom";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { mockUsers as initialMockUsers } from "@/lib/mock-data";
import type { Post, User } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    if (!loading && user) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const postsData: Post[] = [];
        const userPromises: Promise<void>[] = [];
        const fetchedUserIds = new Set<string>();

        querySnapshot.forEach((doc) => {
          const post = { id: doc.id, ...doc.data() } as Post;
          postsData.push(post);

          if (!users[post.userId] && !fetchedUserIds.has(post.userId)) {
            fetchedUserIds.add(post.userId);
            const userDocRef = doc(db, "users", post.userId);
            const userPromise = getDoc(userDocRef).then(userDoc => {
              if (userDoc.exists()) {
                setUsers(prevUsers => ({
                  ...prevUsers,
                  [post.userId]: { id: userDoc.id, ...userDoc.data() } as User
                }));
              }
            });
            userPromises.push(userPromise);
          }
        });
        
        await Promise.all(userPromises);
        setPosts(postsData);
      });

      return () => unsubscribe();
    }
  }, [user, loading]);

  const handleCreatePost = async (newPostData: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'>) => {
    if (!user) {
      toast({ variant: 'destructive', title: "Not Authenticated", description: "You must be logged in to create a post."});
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        ...newPostData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
      });
    } catch (error) {
       console.error("Error creating post:", error);
       toast({ variant: 'destructive', title: "Post Error", description: "Could not create the post."});
    }
  };

  if (loading || !user) {
    // You can show a loading skeleton here
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <DailyWisdom />
      <CreatePost user={user} onCreatePost={handleCreatePost} />
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold">Feed</h2>
        <Separator className="flex-1" />
      </div>
      <div className="space-y-4">
        {posts.map((post) => {
          const postUser = users[post.userId];
          if (!postUser) return null; // Or a loading skeleton for the card
          return <PostCard key={post.id} post={post} user={postUser} />;
        })}
      </div>
    </div>
  );
}
