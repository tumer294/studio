
"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import DailyWisdom from "@/components/daily-wisdom";
import PostCard from "@/components/post-card";
import type { Post, User } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { useCreatePost } from "@/hooks/use-create-post";

function FeedSkeleton() {
    return (
        <div className="space-y-6 p-4 md:p-0">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold">Feed</h2>
                <Separator className="flex-1" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
            </div>
        </div>
    )
}

export default function FeedPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { onOpen } = useCreatePost();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        setDataLoading(true);
        const postsData: Post[] = [];
        const userPromises: Promise<void>[] = [];
        const fetchedUserIds = new Set<string>([user.uid]); // Start with the current user
        setUsers(prev => ({...prev, [user.uid]: user}));

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
        setDataLoading(false);
      }, (error) => {
        console.error("Error fetching posts:", error);
        toast({variant: 'destructive', title: 'Error', description: 'Could not fetch posts.'});
        setDataLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, loading, toast]);


  if (loading || !user) {
    return <FeedSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <DailyWisdom />
      <div className="p-4 bg-card border rounded-lg shadow-sm">
        <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={onOpen}>
            <PenSquare className="mr-2" /> What's on your mind?
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold">Feed</h2>
        <Separator className="flex-1" />
      </div>
      {dataLoading ? (
        <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : (
        <div className="space-y-4">
            {posts.map((post) => {
            const postUser = users[post.userId];
            // Render post only if user data is available
            return postUser ? <PostCard key={post.id} post={post} user={postUser} /> : null;
            })}
        </div>
      )}
    </div>
  );
}
