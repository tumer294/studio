
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function ExploreSkeleton() {
    return (
        <div className="space-y-8 p-4 md:p-0">
            <div>
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                </div>
            </div>
            <div>
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                </div>
            </div>
        </div>
    );
}

function PostGrid({ title, posts, icon: Icon }: { title: string, posts: Post[], icon: React.ElementType }) {
    if (posts.length === 0) {
        return null;
    }
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                 <Icon className="w-6 h-6 text-primary"/>
                 <h2 className="text-2xl font-bold font-headline">{title}</h2>
                 <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <div key={post.id} className="group relative aspect-square overflow-hidden rounded-lg">
                        <img src={post.mediaUrl} alt="Post image" className="w-full h-full object-cover transition-transform group-hover:scale-110" data-ai-hint={post['data-ai-hint']} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white">
                           <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Heart className="w-4 h-4"/>
                                    <span>{post.likes?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4"/>
                                    <span>{post.comments?.length || 0}</span>
                                </div>
                           </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default function ExplorePage() {
    const [mostLikedPosts, setMostLikedPosts] = useState<Post[]>([]);
    const [mostCommentedPosts, setMostCommentedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "posts"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allPosts: Post[] = [];
            querySnapshot.forEach((doc) => {
                allPosts.push({ id: doc.id, ...doc.data() } as Post);
            });

            const imagePosts = allPosts.filter(p => p.type === 'image' && p.mediaUrl && p.status !== 'banned');

            const sortedByLikes = [...imagePosts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
            setMostLikedPosts(sortedByLikes.slice(0, 9));

            const sortedByComments = [...imagePosts].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
            setMostCommentedPosts(sortedByComments.slice(0, 9));
            
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
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Explore</CardTitle>
                <p className="text-muted-foreground">Discover the most popular content from the community.</p>
            </CardHeader>
            <CardContent className="space-y-8">
                 <PostGrid title="Most Liked Posts" posts={mostLikedPosts} icon={Heart} />
                 <PostGrid title="Most Commented Posts" posts={mostCommentedPosts} icon={MessageCircle} />

                 {mostLikedPosts.length === 0 && mostCommentedPosts.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No image posts to explore yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
