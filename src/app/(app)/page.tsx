
"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDocs, doc, where, getDoc } from "firebase/firestore";
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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { onOpen } = useCreatePost();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setDataLoading(false);
        return;
    };

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setPosts(postsData);

        // Get all unique user IDs from the posts
        const userIds = [...new Set(postsData.map(p => p.userId))];

        // Fetch user data for all posts if there are any user IDs
        if (userIds.length > 0) {
            const usersRef = collection(db, "users");
            const userDocsPromises = userIds.map(id => getDoc(doc(usersRef, id)));
            const userDocs = await Promise.all(userDocsPromises);

            const usersData: Record<string, User> = {};
            userDocs.forEach(userDoc => {
                if (userDoc.exists()) {
                    usersData[userDoc.id] = { id: userDoc.id, ...userDoc.data() } as User;
                }
            });
            setUsers(usersData);
        }
        setDataLoading(false);

    }, (error) => {
        console.error("Error fetching posts:", error);
        toast({variant: 'destructive', title: 'Error', description: 'Could not fetch posts.'});
        setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  if (authLoading || !user) {
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
                return postUser ? <PostCard key={post.id} post={post} user={postUser} /> : (
                    <Card key={post.id} className="p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                         <Skeleton className="h-20 w-full mt-4" />
                    </Card>
                );
            })}
        </div>
      )}
    </div>
  );
}
