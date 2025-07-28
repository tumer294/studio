"use client";

import { useState } from 'react';
import type { Post, User, Comment } from "@/lib/types";
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { mockUsers } from '@/lib/mock-data';

interface PostCardProps {
  post: Post;
  user: User;
}

function CommentSection({ comments, currentUserAvatar }: { comments: Comment[], currentUserAvatar: string }) {
    return (
        <div className="space-y-4 pt-4">
            {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} data-ai-hint="person portrait"/>
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{comment.user.name}</p>
                            <p className="text-xs text-muted-foreground">@{comment.user.username}</p>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                    </div>
                </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUserAvatar} alt="Current User" data-ai-hint="woman portrait" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Input placeholder="Write a comment..." className="h-9" />
                <Button size="sm">Send</Button>
            </div>
        </div>
    )
}

export default function PostCard({ post, user }: PostCardProps) {
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  
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
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
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
           <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors">
            <Heart className="w-5 h-5" />
            <span>{post.likes}</span>
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
