
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

type PostWithUser = Post & { author: User };

function ProfileSkeleton() {
    return (
        <div className="p-4 md:p-0 space-y-6">
            <Card className="overflow-hidden">
                <Skeleton className="h-32 md:h-48 w-full" />
                <div className="p-4 relative">
                    <div className="absolute -top-12 md:-top-16 left-4 md:left-6">
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
  const [savedPostsWithUsers, setSavedPostsWithUsers] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState< 'avatar' | 'cover' | null >(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isFollowing = currentUser && profileUser ? (profileUser.followers || []).includes(currentUser.uid) : false;

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    
    const fetchProfile = async (username: string) => {
        setLoading(true);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        
        try {
            const userQuerySnapshot = await getDocs(q);

            if (userQuerySnapshot.empty) {
                setProfileUser(null);
                setLoading(false);
                return;
            }

            const userDoc = userQuerySnapshot.docs[0];
            
            unsubProfile = onSnapshot(userDoc.ref, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = { id: docSnapshot.id, ...docSnapshot.data() } as User;
                    setProfileUser(userData);
                } else {
                    setProfileUser(null);
                }
            });

        } catch (error) {
            console.error("Error fetching profile user:", error);
            setProfileUser(null);
        } finally {
            // We will set loading to false in other effects
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
            // This case might happen briefly, or if a user has no username.
            // Let the loading skeleton show until redirection or data is found.
        }
    } else {
        fetchProfile(usernameFromUrl);
    }

    return () => {
      if (unsubProfile) unsubProfile();
    };
  }, [usernameFromUrl, currentUser, authLoading, router]);

  // Effect for fetching user's own posts
  useEffect(() => {
      if (!profileUser) return;

      setLoading(true);
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, where("userId", "==", profileUser.uid));
      
      const unsubPosts = onSnapshot(postsQuery, (postsSnapshot) => {
          let postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
          
          if (currentUser?.role !== 'admin' && currentUser?.uid !== profileUser.uid) {
              postsData = postsData.filter(p => p.status !== 'banned');
          }
          
          // Sort posts by date on the client side
          postsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA;
          });

          setUserPosts(postsData);
          setLoading(false); 
      }, (error) => {
           console.error("Error fetching user posts:", error);
           setLoading(false);
      });

      return () => unsubPosts();
  }, [profileUser, currentUser]);


  // Effect for fetching saved posts and their authors
  useEffect(() => {
    if (!profileUser || !currentUser || profileUser.id !== currentUser.uid || !profileUser.savedPosts || profileUser.savedPosts.length === 0) {
        setSavedPostsWithUsers([]);
        return;
    }

    const fetchSavedPosts = async () => {
        const savedPostsIds = profileUser.savedPosts || [];
        if (savedPostsIds.length === 0) return;

        try {
            const postsRef = collection(db, 'posts');
            const savedPostsQuery = query(postsRef, where(documentId(), 'in', savedPostsIds));
            const postsSnapshot = await getDocs(savedPostsQuery);
            const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

            const authorIds = [...new Set(postsData.map(post => post.userId))];
            if (authorIds.length === 0) {
                setSavedPostsWithUsers([]);
                return;
            }

            const usersRef = collection(db, 'users');
            // Firestore 'in' queries are limited to 10 items. For more, this needs batching.
            const authorsQuery = query(usersRef, where('uid', 'in', authorIds.slice(0, 10)));
            const authorsSnapshot = await getDocs(authorsQuery);
            
            const authors: Record<string, User> = {};
            authorsSnapshot.forEach(doc => {
                const user = { id: doc.id, ...doc.data() } as User;
                authors[user.uid] = user;
            });
            
            const populatedPosts = postsData
                .map(post => ({
                    ...post,
                    author: authors[post.userId]
                }))
                .filter(p => p.author) // Filter out posts where author couldn't be found
                .sort((a, b) => savedPostsIds.indexOf(b.id) - savedPostsIds.indexOf(a.id)); 

            setSavedPostsWithUsers(populatedPosts);
        } catch(error) {
            console.error("Error fetching saved posts:", error);
        }
    };

    fetchSavedPosts();

  }, [profileUser, currentUser]);


  const handleFollow = async () => {
    if (!currentUser || !profileUser || currentUser.uid === profileUser.uid) return;

    const currentUserRef = doc(db, "users", currentUser.uid);
    const profileUserRef = doc(db, "users", profileUser.uid);

    try {
        if (isFollowing) {
            await updateDoc(currentUserRef, { following: arrayRemove(profileUser.uid) });
            await updateDoc(profileUserRef, { followers: arrayRemove(currentUser.uid) });
            toast({ title: 'Unfollowed', description: `You are no longer following ${profileUser.name}.` });
        } else {
            await updateDoc(currentUserRef, { following: arrayUnion(profileUser.uid) });
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
      ? `avatars/${profileUser.uid}/${Date.now()}-${file.name}` 
      : `covers/${profileUser.uid}/${Date.now()}-${file.name}`;
      
    const storageRef = ref(storage, filePath);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const userDocRef = doc(db, "users", profileUser.uid);
      if (type === 'avatar') {
        await updateDoc(userDocRef, { avatarUrl: downloadURL });
        setProfileUser(prev => prev ? { ...prev, avatarUrl: downloadURL } : null);
        toast({ title: 'Avatar Updated', description: 'Your new avatar has been saved.' });
      } else {
        await updateDoc(userDocRef, { coverPhotoUrl: downloadURL });
        setProfileUser(prev => prev ? { ...prev, coverPhotoUrl: downloadURL } : null);
        toast({ title: 'Cover Photo Updated', description: 'Your new cover photo has been saved.' });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your image.' });
    } finally {
      setIsUploading(null);
      if (e.target) {
          e.target.value = '';
      }
    }
  }

  if (loading || authLoading || !profileUser) {
      return <ProfileSkeleton />;
  }
  
  if (!profileUser) {
    notFound();
  }
  
  const isOwnProfile = currentUser?.uid === profileUser.uid;

  return (
    <div className="p-4 md:p-0">
        <Card className="overflow-hidden">
            <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-accent/20 relative group">
                {profileUser.coverPhotoUrl && <Image src={profileUser.coverPhotoUrl} alt="Cover photo" layout="fill" objectFit="cover" />}
                {isOwnProfile && (
                  <>
                    <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
                    <Button size="sm" variant="outline" className="absolute bottom-2 right-2 bg-background/50 backdrop-blur-sm" onClick={() => coverInputRef.current?.click()} disabled={!!isUploading}>
                        {isUploading === 'cover' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />} 
                        {isUploading === 'cover' ? 'Uploading...' : 'Cover Photo'}
                    </Button>
                  </>
                )}
            </div>
            <div className="p-4 relative">
                 <div className="absolute -top-12 md:-top-16 left-4 md:left-6 group">
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
                
                <div className="flex justify-end items-center mb-4 min-h-[40px]">
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
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
                    savedPostsWithUsers.length > 0 ? (
                        savedPostsWithUsers.map(postWithUser => (
                            <PostCard key={postWithUser.id} post={postWithUser} user={postWithUser.author} />
                        ))
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


    