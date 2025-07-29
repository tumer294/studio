"use client";

import { useState } from 'react';
import type { Post, User, Comment as CommentType } from "@/lib/types";
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { mockUsers } from '@/lib/mock-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
  user: User;
}

function CommentSection({ comments: initialComments, currentUserAvatar }: { comments: CommentType[], currentUserAvatar: string }) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newComment.trim()) return;

        const newCommentObj: CommentType = {
            id: `comment-${Date.now()}`,
            user: {
                username: mockUsers['user-3'].username,
                name: mockUsers['user-3'].name,
                avatarUrl: mockUsers['user-3'].avatarUrl,
            },
            content: newComment,
            createdAt: 'Just now'
        }
        setComments(prev => [newCommentObj, ...prev]);
        setNewComment("");
    }

    return (
        <div className="space-y-4 pt-4 mt-4 border-t w-full">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 pt-2">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUserAvatar} alt="Current User" data-ai-hint="woman portrait" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Input placeholder="Write a comment..." className="h-9" value={newComment} onChange={e => setNewComment(e.target.value)} />
                <Button size="sm" type="submit">Send</Button>
            </form>
            {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} data-ai-hint="person portrait"/>
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{comment.user.name}</p>
                            <Link href={`/profile/${comment.user.username}`} className="text-xs text-muted-foreground hover:underline">@{comment.user.username}</Link>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function PostCard({ post, user }: PostCardProps) {
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev -1 : prev + 1);
  }
  
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
            @{user.username} · {post.createdAt}
          </p>
        </div>
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
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Post</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.type === 'image' && post.mediaUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border">
            <Image
              src={post.mediaUrl}
              alt="Post image"
              width={600}
              height={400}
              className="w-full object-cover"
              data-ai-hint={post['data-ai-hint']}
            />
          </div>
        )}
        {post.type === 'link' && post.mediaUrl && (
            <div className="mt-3 aspect-video rounded-lg overflow-hidden border">
                <iframe
                    src={post.mediaUrl}
                    title="Embedded content"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-popups"
                ></iframe>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <div className="w-full flex justify-around">
           <Button variant="ghost" className={cn("flex items-center gap-2 text-muted-foreground transition-colors", isLiked ? 'text-destructive' : 'hover:text-destructive')} onClick={handleLike}>
            <Heart className={cn("w-5 h-5", isLiked && 'fill-current')} />
            <span>{likeCount}</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => setIsCommentSectionOpen(!isCommentSectionOpen)}>
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments.length}</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </Button>
        </div>
        {isCommentSectionOpen && <CommentSection comments={post.comments} currentUserAvatar={mockUsers['user-3'].avatarUrl} />}
      </CardFooter>
    </Card>
  );
}
