
"use client";

import { useState, useEffect } from 'react';
import type { Post, User, Comment as CommentType, Report } from "@/lib/types";
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Trash2, LinkIcon, PlayCircle, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from './ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';


async function getDownloadUrl(key: string): Promise<string | null> {
    if (!key) return null;
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
        });
        if (!response.ok) {
            console.error("Failed to get download URL:", await response.text());
            return null;
        }
        const data = await response.json();
        return data.signedUrl;
    } catch (error) {
        console.error("Error getting download URL", error);
        return null;
    }
}

function DisplayMedia({ mediaKey, mediaType, ...props }: { mediaKey?: string, mediaType?: Post['type']} & any) {
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;
        if (mediaKey && (mediaType === 'image' || mediaType === 'video')) {
            setIsLoading(true);
            getDownloadUrl(mediaKey).then(downloadUrl => {
                if (!isCancelled) {
                    setUrl(downloadUrl);
                    setIsLoading(false);
                }
            });
        } else {
            setIsLoading(false);
        }
        return () => { isCancelled = true };
    }, [mediaKey, mediaType]);

    if (isLoading) {
        return <div className="mt-3 aspect-video w-full bg-muted animate-pulse rounded-lg"></div>;
    }

    if (mediaType === 'image' && url) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden border relative w-full aspect-video max-h-[600px]">
          <Image
            src={url}
            alt="Post content"
            fill
            className="object-cover"
            data-ai-hint={props['data-ai-hint'] || 'post image'}
          />
        </div>
      );
    }
    
    if (mediaType === 'video' && url) {
        return (
            <div className="mt-3 aspect-video rounded-lg overflow-hidden border bg-black max-h-[600px]">
                <video src={url} controls className="w-full h-full object-contain"></video>
            </div>
        );
    }

    return null;
}

function DisplayAvatar({ imageKey, fallback, ...props }: { imageKey?: string, fallback: React.ReactNode } & Omit<React.ComponentProps<typeof AvatarImage>, 'src'>) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        if (imageKey) {
            getDownloadUrl(imageKey).then(downloadUrl => {
                if (!isCancelled) setUrl(downloadUrl);
            });
        }
        return () => { isCancelled = true };
    }, [imageKey]);

    return url ? <AvatarImage src={url} {...props} /> : fallback;
}

interface PostCardProps {
  post: Post;
  user: User;
}

function ReportDialog({ post, currentUser, children }: { post: Post, currentUser: (User & import('firebase/auth').User) | null, children: React.ReactNode }) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleReportSubmit = async () => {
        if (!reason.trim() || !currentUser) return;

        const report: Report = {
            userId: currentUser.uid,
            reason: reason,
            createdAt: new Date(),
        };

        try {
            const postRef = doc(db, 'posts', post.id);
            await updateDoc(postRef, {
                reports: arrayUnion(report)
            });
            toast({ title: t.postReported, description: t.reportThanks });
            setReason("");
            setIsOpen(false);
        } catch (error) {
            console.error("Error reporting post: ", error);
            toast({ variant: 'destructive', title: t.error, description: t.couldNotSubmitReport });
        }
    };

    const hasReported = post.reports?.some(r => r.userId === currentUser?.uid);

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.reportPost}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t.reportDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                    placeholder={t.reportPlaceholder}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={hasReported}
                />
                {hasReported && <p className="text-sm text-yellow-600">You have already reported this post.</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReportSubmit} disabled={!reason.trim() || hasReported}>
                        {t.submitReport}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


function CommentSection({ postId, currentUser }: { postId: string, currentUser: (User & import('firebase/auth').User) | null }) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const postRef = doc(db, 'posts', postId);
        const unsubscribe = onSnapshot(postRef, (doc) => {
            setComments(doc.data()?.comments || []);
        });
        return unsubscribe;
    }, [postId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newComment.trim() || !currentUser) {
            if(!currentUser) toast({ variant: 'destructive', title: t.authError, description: t.mustBeLoggedInToComment });
            return;
        };

        const newCommentObj: CommentType = {
            id: `comment-${Date.now()}-${Math.random()}`,
            userId: currentUser.uid,
            username: currentUser.username,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
            content: newComment,
            createdAt: new Date().toISOString()
        }
        
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                comments: arrayUnion(newCommentObj)
            });
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment: ", error);
            toast({ variant: 'destructive', title: t.error, description: t.couldNotAddComment})
        }
    }

    if (!currentUser) return null;

    return (
        <div className="space-y-4 pt-4 mt-4 border-t w-full">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 pt-2">
                <Avatar className="w-8 h-8">
                     <DisplayAvatar imageKey={currentUser.avatarUrl} fallback={<AvatarFallback>{currentUser.name?.charAt(0) || 'U'}</AvatarFallback>} />
                </Avatar>
                <Input placeholder={t.writeAComment} className="h-9" value={newComment} onChange={e => setNewComment(e.target.value)} />
                <Button size="sm" type="submit" disabled={!newComment.trim()}>{t.send}</Button>
            </form>
            {comments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                        <DisplayAvatar imageKey={comment.avatarUrl} fallback={<AvatarFallback>{comment.name?.charAt(0)}</AvatarFallback>} />
                    </Avatar>
                    <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                             <Link href={`/profile/${comment.username}`} className="font-bold text-sm hover:underline">{comment.name}</Link>
                            <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function PostCard({ post: initialPost, user }: PostCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [post, setPost] = useState<Post>(initialPost);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  
  useEffect(() => {
      if (!initialPost.id) return;
      const postRef = doc(db, 'posts', initialPost.id);
      const unsubscribe = onSnapshot(postRef, (doc) => {
          if (doc.exists()) {
              const postData = { id: doc.id, ...doc.data() } as Post;
              setPost(postData);
          }
      });
      return () => unsubscribe();
  }, [initialPost.id]);

  const isLiked = currentUser ? (post.likes || []).includes(currentUser.uid) : false;
  const isSaved = currentUser ? (currentUser.savedPosts || []).includes(post.id) : false;
  
  const handleLike = async () => {
      if (!currentUser) {
           toast({ variant: "destructive", title: t.authError, description: t.mustBeLoggedInToLike})
           return;
      }
      const postRef = doc(db, 'posts', post.id);
      try {
          if (isLiked) {
              await updateDoc(postRef, {
                  likes: arrayRemove(currentUser.uid)
              });
          } else {
              await updateDoc(postRef, {
                  likes: arrayUnion(currentUser.uid)
              });
          }
      } catch (error) {
          console.error("Error liking post: ", error);
          toast({ variant: "destructive", title: t.error, description: t.couldNotUpdateLike})
      }
  }

  const handleSavePost = async () => {
      if (!currentUser) {
           toast({ variant: "destructive", title: t.authError, description: t.mustBeLoggedInToSave})
           return;
      }
      const userRef = doc(db, 'users', currentUser.uid);
      try {
          if (isSaved) {
              await updateDoc(userRef, {
                  savedPosts: arrayRemove(post.id)
              });
              toast({ title: t.postUnsaved, description: t.postUnsavedDesc });
          } else {
              await updateDoc(userRef, {
                  savedPosts: arrayUnion(post.id)
              });
              toast({ title: t.postSaved, description: t.postSavedDesc });
          }
      } catch (error) {
          console.error("Error saving post: ", error);
          toast({ variant: "destructive", title: t.error, description: t.couldNotSavePost})
      }
  }

  const handleDelete = async () => {
    if (!currentUser || (currentUser.uid !== post.userId && currentUser.role !== 'admin')) {
        toast({variant: 'destructive', title: t.unauthorized, description: t.unauthorizedDelete});
        return;
    }
    if (window.confirm('Are you sure you want to delete this post?')) {
        try {
            await deleteDoc(doc(db, 'posts', post.id));
            toast({title: t.success, description: t.postDeletedDesc});
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({variant: 'destructive', title: t.error, description: t.couldNotDeletePost});
        }
    }
  }
  
  const postDate = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now';

  const renderMedia = () => {
    if (!post.mediaUrl || !post.type) {
      return null;
    }
    
    if (post.type === 'image' || post.type === 'video') {
      return <DisplayMedia mediaKey={post.mediaUrl} mediaType={post.type} data-ai-hint={post['data-ai-hint']} />;
    }

    if(post.type === 'link') {
        const url = post.mediaUrl;
        const isImageLink = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url);
        if (isImageLink) {
            return (
                <div className="mt-3 rounded-lg overflow-hidden border">
                    <Image
                        src={url}
                        alt="Post content"
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                    />
                </div>
            );
        }

        const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
        if (isYoutube) {
            const videoIdMatch = url.match(/(?:v=|\/|embed\/|watch\?v=|\&v=)([a-zA-Z0-9_-]{11})(?:\?|&|$)/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;
            if (videoId) {
                return (
                    <div className="mt-3 aspect-video rounded-lg overflow-hidden border bg-black">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            }
        }
        
        const isDirectVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(url);
        if (isDirectVideo) {
            return (
                <div className="mt-3 aspect-video rounded-lg overflow-hidden border bg-black">
                    <video src={url} controls className="w-full h-full"></video>
                </div>
            );
        }

        let hostname = 'link';
        try {
            hostname = new URL(url).hostname.replace('www.', '');
        } catch (e) { /* ignore invalid urls */ }
        
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-lg overflow-hidden border hover:bg-muted/50 transition-colors">
                <div className="p-4 bg-muted/20">
                <div className="flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{hostname}</p>
                        <p className="text-sm text-muted-foreground truncate">{url}</p>
                    </div>
                </div>
                </div>
            </a>
        );
    }

    return null;
  };


  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Link href={`/profile/${user.username}`}>
          <Avatar>
            <DisplayAvatar imageKey={user.avatarUrl} fallback={<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>} />
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${user.username}`} className="font-bold hover:underline">{user.name}</Link>
          <p className="text-sm text-muted-foreground">
            @{user.username} · {postDate}
          </p>
        </div>
        {currentUser && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {(currentUser.uid === post.userId || currentUser.role === 'admin') && (
                      <>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{t.deletePost}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <ReportDialog post={post} currentUser={currentUser}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>{t.reportPost}</span>
                        </DropdownMenuItem>
                    </ReportDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-2">
        {post.content && <p className="whitespace-pre-wrap">{post.content}</p>}
        {renderMedia()}
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <div className="w-full flex justify-around">
           <Button variant="ghost" className={cn("flex items-center gap-2 text-muted-foreground transition-colors", isLiked ? 'text-destructive' : 'hover:text-destructive')} onClick={handleLike} disabled={!currentUser}>
            <Heart className={cn("w-5 h-5", isLiked && 'fill-current')} />
            <span>{(post.likes || []).length}</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => setIsCommentSectionOpen(!isCommentSectionOpen)} disabled={!currentUser}>
            <MessageCircle className="w-5 h-5" />
            <span>{(post.comments || []).length}</span>
          </Button>
          <Button variant="ghost" className={cn("flex items-center gap-2 text-muted-foreground transition-colors", isSaved ? 'text-primary' : 'hover:text-primary')} onClick={handleSavePost} disabled={!currentUser}>
            <Bookmark className={cn("w-5 h-5", isSaved && 'fill-current')} />
            <span>{isSaved ? t.saved : t.save}</span>
          </Button>
        </div>
        {isCommentSectionOpen && <CommentSection postId={post.id} currentUser={currentUser} />}
      </CardFooter>
    </Card>
  );
}
