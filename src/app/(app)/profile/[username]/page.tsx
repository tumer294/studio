
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import type { User, Post } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/post-card";
import { UserPlus, Mail, Camera, UserCheck } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
    return (
        <div className="p-4 md:p-0 space-y-6">
            <Card className="overflow-hidden">
                <Skeleton className="h-32 md:h-48 w-full" />
                <div className="p-4 relative">
                    <div className="absolute -top-16 left-6">
                        <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-card" />
                    </div>
                    <div className="flex justify-end items-center mb-4 h-10">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24 ml-2" />
                    </div>
                    <div className="pt-8 md:pt-12 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full mt-2" />
                         <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex gap-6 mt-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
            </Card>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    )
}


export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const usernameFromUrl = Array.isArray(params.username) ? params.username[0] : params.username;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isFollowing = currentUser && profileUser ? (profileUser.followers || []).includes(currentUser.uid) : false;

  useEffect(() => {
    let active = true;
    let unsubProfile: (() => void) | undefined;
    let unsubPosts: (() => void) | undefined;

    const fetchUserProfile = async (usernameToFetch: string) => {
      if (!active) return;
      setLoading(true);
      
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", usernameToFetch));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          if (active) setProfileUser(null);
        } else {
          const userDoc = querySnapshot.docs[0];
          
          unsubProfile = onSnapshot(userDoc.ref, (doc) => {
            if(active) setProfileUser({ id: doc.id, ...doc.data() } as User);
          });

          const postsRef = collection(db, "posts");
          const postsQuery = query(postsRef, where("userId", "==", userDoc.id), orderBy("createdAt", "desc"));
          
          unsubPosts = onSnapshot(postsQuery, (postsSnapshot) => {
            if(active) {
                const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
                setUserPosts(postsData);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if(active) toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch profile data.' });
        if(active) setProfileUser(null);
      } finally {
        if(active) setLoading(false);
      }
    };

    if (authLoading) {
      // Still waiting for auth state to resolve, do nothing yet.
      // The skeleton will be shown because `loading` is true by default.
      return;
    }
    
    let userToFetch: string | null = usernameFromUrl;

    if (usernameFromUrl === 'me') {
      if (currentUser) {
        userToFetch = currentUser.username;
      } else {
        // Not logged in, but trying to access /profile/me
        router.replace('/login');
        return;
      }
    }
    
    if (userToFetch) {
      fetchUserProfile(userToFetch);
    } else {
      // If we still don't have a username to fetch, it's a genuine not found case.
      setLoading(false);
    }

    return () => {
      active = false;
      if (unsubProfile) unsubProfile();
      if (unsubPosts) unsubPosts();
    };
  }, [usernameFromUrl, currentUser, authLoading, router, toast]);

  const handleFollow = async () => {
    if (!currentUser || !profileUser || currentUser.uid === profileUser.id) return;

    const currentUserRef = doc(db, "users", currentUser.uid);
    const profileUserRef = doc(db, "users", profileUser.id);

    try {
        if (isFollowing) {
            // Unfollow
            await updateDoc(currentUserRef, { following: arrayRemove(profileUser.id) });
            await updateDoc(profileUserRef, { followers: arrayRemove(currentUser.uid) });
            toast({ title: 'Unfollowed', description: `You are no longer following ${profileUser.name}.` });
        } else {
            // Follow
            await updateDoc(currentUserRef, { following: arrayUnion(profileUser.id) });
            await updateDoc(profileUserRef, { followers: arrayUnion(currentUser.uid) });
            toast({ title: 'Followed', description: `You are now following ${profileUser.name}.` });
        }
    } catch(error) {
        console.error("Error following user:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the action.' });
    }
  }


  if (loading || authLoading) {
      return <ProfileSkeleton />;
  }
  
  if (!profileUser) {
    notFound();
  }
  
  const isOwnProfile = currentUser?.uid === profileUser.id;

  return (
    <div className="p-4 md:p-0">
        <Card className="overflow-hidden">
            <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-accent/20 relative">
                <Image src={profileUser.coverPhotoUrl || 'https://placehold.co/1500x500'} alt="Cover photo" layout="fill" objectFit="cover" />
                {isOwnProfile && <Button size="sm" variant="outline" className="absolute bottom-2 right-2 bg-background/50 backdrop-blur-sm">
                    <Camera className="mr-2 h-4 w-4" /> Cover Photo
                </Button>}
            </div>
            <div className="p-4 relative">
                <div className="absolute -top-16 left-6 group">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card shadow-md">
                        <AvatarImage src={profileUser.avatarUrl} data-ai-hint="person portrait" />
                        <AvatarFallback className="text-4xl">{profileUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     {isOwnProfile && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white w-8 h-8"/>
                    </div>}
                </div>
                
                <div className="flex justify-end items-center mb-4">
                   {!isOwnProfile && currentUser && (
                     <div className="flex gap-2">
                       <Button onClick={handleFollow} disabled={!currentUser}>
                          {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                          {isFollowing ? 'Following' : 'Follow'}
                       </Button>
                       <Button variant="outline">
                          <Mail className="mr-2 h-4 w-4"/> Message
                       </Button>
                     </div>
                   )}
                </div>

                <div className="pt-8 md:pt-12">
                    <h2 className="text-2xl font-bold font-headline">{profileUser.name}</h2>
                    <p className="text-muted-foreground">@{profileUser.username}</p>
                    <p className="mt-2 text-foreground/90">{profileUser.bio}</p>
                </div>

                <div className="flex gap-6 mt-4 text-sm">
                    <div>
                        <span className="font-bold">{(profileUser.following || []).length}</span>
                        <span className="text-muted-foreground"> Following</span>
                    </div>
                    <div>
                        <span className="font-bold">{(profileUser.followers || []).length}</span>
                        <span className="text-muted-foreground"> Followers</span>
                    </div>
                </div>
            </div>
        </Card>

        <Tabs defaultValue="posts" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="replies">Replies</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4 space-y-4">
                {userPosts.map(post => (
                    <PostCard key={post.id} post={post} user={profileUser} />
                ))}
                 {userPosts.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            <p>No posts yet.</p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="replies" className="mt-4">
                 <Card>
                    <CardContent className="text-center py-12 text-muted-foreground">
                        <p>No replies yet.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="likes" className="mt-4">
                 <Card>
                    <CardContent className="text-center py-12 text-muted-foreground">
                        <p>No likes yet.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
