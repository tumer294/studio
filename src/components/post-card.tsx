
"use client";

import { useState, useEffect } from 'react';
import type { Post, User, Comment as CommentType } from "@/lib/types";
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit, LinkIcon, PlayCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  user: User;
}

function CommentSection({ postId, currentUser }: { postId: string, currentUser: (User & import('firebase/auth').User) | null }) {
    const { toast } = useToast();
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
        if(!newComment.trim() || !currentUser) return;

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
            toast({ variant: 'destructive', title: "Error", description: "Could not add comment."})
        }
    }

    if (!currentUser) return null;

    return (
        <div className="space-y-4 pt-4 mt-4 border-t w-full">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 pt-2">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser.avatarUrl} alt="Current User" data-ai-hint="woman portrait" />
                    <AvatarFallback>{currentUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Input placeholder="Write a comment..." className="h-9" value={newComment} onChange={e => setNewComment(e.target.value)} />
                <Button size="sm" type="submit" disabled={!newComment.trim()}>Send</Button>
            </form>
            {comments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.avatarUrl} alt={comment.name} data-ai-hint="person portrait"/>
                        <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
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
  const [post, setPost] = useState<Post>(initialPost);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  useEffect(() => {
      if (!initialPost.id) return;
      const postRef = doc(db, 'posts', initialPost.id);
      const unsubscribe = onSnapshot(postRef, (doc) => {
          if (doc.exists()) {
              setPost({ id: doc.id, ...doc.data() } as Post);
          }
      });
      return () => unsubscribe();
  }, [initialPost.id]);

  const isLiked = currentUser ? (post.likes || []).includes(currentUser.uid) : false;
  
  const handleLike = async () => {
      if (!currentUser) {
           toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to like a post."})
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
          toast({ variant: "destructive", title: "Error", description: "Could not update like."})
      }
  }

  const handleDelete = async () => {
    if (!currentUser || (currentUser.uid !== post.userId && currentUser.role !== 'admin')) {
        toast({variant: 'destructive', title: 'Unauthorized', description: 'You can only delete your own posts.'});
        return;
    }
    if (window.confirm('Are you sure you want to delete this post?')) {
        try {
            await deleteDoc(doc(db, 'posts', post.id));
            toast({title: 'Success', description: 'Post deleted successfully.'});
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({variant: 'destructive', title: 'Error', description: 'Could not delete post.'});
        }
    }
  }

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Check out this post on UmmahConnect!',
                text: post.content,
                url: postUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not share post.' });
        }
    } else {
        navigator.clipboard.writeText(postUrl); // Fallback for desktop
        toast({ title: 'Link Copied', description: 'Post link copied to clipboard.' });
    }
  };
  
  const postDate = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now';

  const renderMedia = () => {
    if (!post.mediaUrl) {
      return null;
    }
    const url = post.mediaUrl;

    const isImageFile = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url);
    if (isImageFile) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden border">
          <Image
            src={url}
            alt="Post content"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
            data-ai-hint={post['data-ai-hint'] || 'post image'}
          />
        </div>
      );
    }
    
    const isVideoFile = /\.(mp4|webm|mov)(\?.*)?$/i.test(url);
    if (isVideoFile) {
      return (
        <div className="mt-3 aspect-video rounded-lg overflow-hidden border bg-black">
          <video src={url} controls className="w-full h-full"></video>
        </div>
      );
    }

    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYoutube) {
      const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      if (!videoId) return null;
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
    
    const isFacebook = url.includes('facebook.com');
    if (isFacebook) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 group relative block aspect-video w-full rounded-lg overflow-hidden border bg-black">
                <Image src="https://placehold.co/600x400/000000/FFFFFF.png?text=Facebook+Video" alt="Facebook video placeholder" layout="fill" objectFit="cover" className="opacity-50" />
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <PlayCircle className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
                    <p className="mt-2 font-semibold text-white">Watch on Facebook</p>
                 </div>
            </a>
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
                    <p className="font-semibold truncate">{`View on ${hostname}`}</p>
                    <p className="text-sm text-muted-foreground truncate">{url}</p>
                </div>
            </div>
          </div>
        </a>
    );
  };


  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Link href={`/profile/${user.username}`}>
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user['data-ai-hint']}/>
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${user.username}`} className="font-bold hover:underline">{user.name}</Link>
          <p className="text-sm text-muted-foreground">
            @{user.username} · {postDate}
          </p>
        </div>
        {currentUser && (currentUser.uid === post.userId || currentUser.role === 'admin') && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Post</span>
                    </DropdownMenuItem>
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
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </Button>
        </div>
        {isCommentSectionOpen && <CommentSection postId={post.id} currentUser={currentUser} />}
      </CardFooter>
    </Card>
  );
}
 

    
