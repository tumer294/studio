
"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function ExploreSkeleton() {
    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Explore</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ExplorePage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData: Post[] = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() } as Post);
            });
            setPosts(postsData.filter(p => p.type === 'image' && p.mediaUrl));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts for explore page: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <ExploreSkeleton />;
    }

    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Explore</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {posts.map((post) => (
                            <div key={post.id} className="group relative aspect-square overflow-hidden rounded-lg">
                                <img src={post.mediaUrl} alt="Post image" className="w-full h-full object-cover transition-transform group-hover:scale-110" data-ai-hint={post['data-ai-hint']} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                    <p className="text-white text-sm text-center line-clamp-3">{post.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                     {posts.length === 0 && !loading && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No image posts to explore yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
