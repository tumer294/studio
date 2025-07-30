
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, orderBy, documentId } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { User, Post } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/post-card";
import { UserPlus, Mail, Camera, UserCheck, Loader2 } from "lucide-react";
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
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState< 'avatar' | 'cover' | null >(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isFollowing = currentUser && profileUser ? (profileUser.followers || []).includes(currentUser.uid) : false;

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubPosts: (() => void) | undefined;
    let unsubSavedPosts: (() => void) | undefined;

    const fetchProfileAndPosts = async (username: string) => {
        setLoading(true);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const userQuerySnapshot = await getDocs(q);

            if (userQuerySnapshot.empty) {
                setProfileUser(null);
                setLoading(false);
                return;
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userId = userDoc.id;

            unsubProfile = onSnapshot(doc(db, "users", userId), (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = { id: docSnapshot.id, ...docSnapshot.data() } as User;
                    setProfileUser(userData);

                    // Fetch saved posts if they exist
                    if (userData.savedPosts && userData.savedPosts.length > 0) {
                        const savedPostsQuery = query(collection(db, "posts"), where(documentId(), "in", userData.savedPosts));
                        unsubSavedPosts = onSnapshot(savedPostsQuery, (postsSnapshot) => {
                             const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
                             setSavedPosts(postsData);
                        });
                    } else {
                        setSavedPosts([]);
                    }
                } else {
                    setProfileUser(null);
                }
            });

            const postsRef = collection(db, "posts");
            const postsQuery = query(postsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
            
            unsubPosts = onSnapshot(postsQuery, (postsSnapshot) => {
                let postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
                if (currentUser?.role !== 'admin') {
                    postsData = postsData.filter(p => p.status !== 'banned');
                }
                setUserPosts(postsData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching posts:", error);
                setUserPosts([]);
                setLoading(false);
            });

        } catch (error) {
            console.error("Error fetching profile data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch profile data.' });
            setProfileUser(null);
            setUserPosts([]);
            setLoading(false);
        }
    };

    if (authLoading) return;
    if (!usernameFromUrl) {
      setLoading(false);
      return;
    }

    if (usernameFromUrl === 'me') {
        if (currentUser?.username) {
            router.replace(`/profile/${currentUser.username}`);
        } else if (!authLoading) {
            router.replace('/login');
        }
    } else {
        fetchProfileAndPosts(usernameFromUrl);
    }

    return () => {
      if (unsubProfile) unsubProfile();
      if (unsubPosts) unsubPosts();
      if (unsubSavedPosts) unsubSavedPosts();
    };
  }, [usernameFromUrl, currentUser, authLoading, router, toast]);

  const handleFollow = async () => {
    if (!currentUser || !profileUser || currentUser.uid === profileUser.id) return;

    const currentUserRef = doc(db, "users", currentUser.uid);
    const profileUserRef = doc(db, "users", profileUser.id);

    try {
        if (isFollowing) {
            await updateDoc(currentUserRef, { following: arrayRemove(profileUser.id) });
            await updateDoc(profileUserRef, { followers: arrayRemove(currentUser.uid) });
            toast({ title: 'Unfollowed', description: `You are no longer following ${profileUser.name}.` });
        } else {
            await updateDoc(currentUserRef, { following: arrayUnion(profileUser.id) });
            await updateDoc(profileUserRef, { followers: arrayUnion(currentUser.uid) });
            toast({ title: 'Followed', description: `You are now following ${profileUser.name}.` });
        }
    } catch(error) {
        console.error("Error following user:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the action.' });
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (!e.target.files || e.target.files.length === 0 || !profileUser) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'File Too Large', description: 'Image must be smaller than 5MB.' });
        return;
    }
    
    setIsUploading(type);
    
    const filePath = type === 'avatar' 
      ? `avatars/${profileUser.id}/${Date.now()}-${file.name}` 
      : `covers/${profileUser.id}/${Date.now()}-${file.name}`;
      
    const storageRef = ref(storage, filePath);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const userDocRef = doc(db, "users", profileUser.id);
      if (type === 'avatar') {
        await updateDoc(userDocRef, { avatarUrl: downloadURL });
        toast({ title: 'Avatar Updated', description: 'Your new avatar has been saved.' });
      } else {
        await updateDoc(userDocRef, { coverPhotoUrl: downloadURL });
        toast({ title: 'Cover Photo Updated', description: 'Your new cover photo has been saved.' });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your image.' });
    } finally {
      setIsUploading(null);
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
            <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-accent/20 relative group">
                <Image src={profileUser.coverPhotoUrl || 'https://placehold.co/1500x500'} alt="Cover photo" layout="fill" objectFit="cover" />
                {isOwnProfile && (
                  <>
                    <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
                    <Button size="sm" variant="outline" className="absolute bottom-2 right-2 bg-background/50 backdrop-blur-sm" onClick={() => coverInputRef.current?.click()} disabled={isUploading === 'cover'}>
                        {isUploading === 'cover' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />} 
                        {isUploading === 'cover' ? 'Uploading...' : 'Cover Photo'}
                    </Button>
                  </>
                )}
            </div>
            <div className="p-4 relative">
                <div className="absolute -top-16 left-6 group">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card shadow-md">
                        <AvatarImage src={profileUser.avatarUrl} data-ai-hint="person portrait" />
                        <AvatarFallback className="text-4xl">{profileUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     {isOwnProfile && (
                       <>
                         <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleImageUpload(e, 'avatar')} className="hidden" />
                         <div 
                           className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                           onClick={() => avatarInputRef.current?.click()}
                         >
                           {isUploading === 'avatar' ? <Loader2 className="text-white w-8 h-8 animate-spin" /> : <Camera className="text-white w-8 h-8"/>}
                         </div>
                       </>
                     )}
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
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="replies">Replies</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4 space-y-4">
                {userPosts.length > 0 ? (
                  userPosts.map(post => (
                    <PostCard key={post.id} post={post} user={profileUser} />
                  ))
                ) : (
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
            <TabsContent value="saved" className="mt-4 space-y-4">
                {isOwnProfile ? (
                    savedPosts.length > 0 ? (
                        savedPosts.map(post => {
                            // Note: The user prop for saved posts should be the post's original author, not the current profile user.
                            // This part of the logic needs to fetch the authors for the saved posts.
                            // For now, we pass the profileUser, but a more robust solution would fetch the correct author.
                            return <PostCard key={post.id} post={post} user={profileUser} />;
                        })
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12 text-muted-foreground">
                                <p>You haven't saved any posts yet.</p>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            <p>Saved posts are private.</p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
}
