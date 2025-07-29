"use client";

import { useState } from 'react';
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TextIcon, ImageIcon, Link2Icon, Film } from "lucide-react";

interface CreatePostProps {
  user: User;
}

export default function CreatePost({ user }: CreatePostProps) {
  const [activeTab, setActiveTab] = useState("text");
  const [postContent, setPostContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handlePost = () => {
    console.log({
      content: postContent,
      type: activeTab,
      mediaUrl: file ? URL.createObjectURL(file) : mediaUrl,
    });
    // Reset state after posting
    setPostContent("");
    setMediaUrl("");
    setFile(null);
  };
  
  const TABS = [
      { id: 'text', icon: TextIcon, label: 'Text' },
      { id: 'image', icon: ImageIcon, label: 'Image' },
      { id: 'video', icon: Film, label: 'Video' },
      { id: 'link', icon: Link2Icon, label: 'Link' },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="woman portrait" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder="What's on your mind?"
              className="mb-2 min-h-[80px] text-base focus:ring-0 border-0 focus-visible:ring-offset-0 focus-visible:ring-0"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            
            {activeTab === 'image' && (
              <div className="mt-2">
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            )}
             {activeTab === 'video' && (
              <div className="mt-2">
                <Input type="file" accept="video/*" onChange={handleFileChange} />
              </div>
            )}
            {activeTab === 'link' && (
              <div className="mt-2">
                 <Input type="text" placeholder="Enter link to embed" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} />
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
                <div className="flex gap-1">
                    {TABS.map(tab => (
                        <Button key={tab.id} variant={activeTab === tab.id ? "secondary" : "ghost"} size="icon" onClick={() => setActiveTab(tab.id)} aria-label={tab.label}>
                            <tab.icon className="w-5 h-5"/>
                        </Button>
                    ))}
                </div>
               <div className="flex items-center gap-2">
                <Button onClick={handlePost} disabled={!postContent.trim()}>Post</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
