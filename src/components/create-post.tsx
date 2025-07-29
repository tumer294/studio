
"use client";

import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Post } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TextIcon, ImageIcon, Link2Icon, Film, Loader2 } from "lucide-react";
import { storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface CreatePostProps {
  onCreatePost: (post: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>;
  user: any; 
}

export default function CreatePost({ user, onCreatePost }: CreatePostProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "video" | "link">("text");
  const [postContent, setPostContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); 
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (activeTab === 'image' && !allowedImageTypes.includes(selectedFile.type)) {
          toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image file (jpg, png, gif, webp).' });
          return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
          toast({ variant: 'destructive', title: 'File Too Large', description: 'File must be smaller than 5MB.' });
          return;
      }
      
      setFile(selectedFile);
    }
  };

  const resetState = () => {
    setPostContent("");
    setMediaUrl("");
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setActiveTab("text");
    setIsUploading(false);
  }

  const handlePost = async () => {
    if ((!postContent.trim() && !file && !mediaUrl.trim()) || isUploading) return;
    
    setIsUploading(true);
    
    try {
        let finalMediaUrl = mediaUrl;
        let postType: Post['type'] = activeTab;

        // The core logic fix: Upload the file to Storage and get a URL.
        if (file && activeTab === 'image') {
            postType = 'image';
            // 1. Create a reference in Firebase Storage
            const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${file.name}`);
            
            // 2. Upload the file
            const snapshot = await uploadBytes(storageRef, file);
            
            // 3. Get the public download URL
            finalMediaUrl = await getDownloadURL(snapshot.ref);
        } else if (activeTab === 'video') {
            postType = 'video';
        } else if (activeTab === 'link') {
            postType = 'link';
        } else {
            postType = 'text';
        }


        const newPost: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'> = {
            content: postContent,
            type: postType,
            mediaUrl: finalMediaUrl,
        };

        await onCreatePost(newPost);
        
        toast({ title: 'Success', description: 'Your post has been published.' });
        resetState();

    } catch(error: any) {
        console.error("Error during post creation:", error);
        toast({variant: 'destructive', title: 'Upload Error', description: error.message || 'Could not create the post.'})
    } finally {
        setIsUploading(false);
    }
  };
  
  const TABS = [
      { id: 'text', icon: TextIcon, label: 'Text' },
      { id: 'image', icon: ImageIcon, label: 'Image' },
      { id: 'video', icon: Film, label: 'Video' },
      { id: 'link', icon: Link2Icon, label: 'Link' },
  ] as const;
  
  const handleTabClick = (tabId: "text" | "image" | "video" | "link") => {
      // Reset state when switching tabs to avoid confusion
      setPostContent(""); // Clear text content as well
      setFile(null);
      setMediaUrl("");
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setActiveTab(tabId);
  }

  const isPostButtonDisabled = (postContent.trim() === "" && !file && mediaUrl.trim() === "") || isUploading;


  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl || user.photoURL} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback>{user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder="What's on your mind?"
              className="mb-2 min-h-[80px] text-base focus:ring-0 border-0 focus-visible:ring-offset-0 focus-visible:ring-0"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            
            {(activeTab === 'image') && (
              <div className="mt-2">
                 <Label htmlFor="image-upload" className="text-sm font-medium text-muted-foreground">Select an image to upload</Label>
                <Input 
                  id="image-upload"
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="file:text-foreground"
                />
              </div>
            )}
            {(activeTab === 'video') && (
               <div className="mt-2">
                 <Input type="url" placeholder="Enter video URL (e.g., YouTube, .mp4)" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} />
              </div>
            )}
            {(activeTab === 'link') && (
               <div className="mt-2">
                 <Input type="url" placeholder="Enter link to share" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} />
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
                <div className="flex gap-1">
                    {TABS.map(tab => (
                        <Button key={tab.id} variant={activeTab === tab.id ? "secondary" : "ghost"} size="icon" onClick={() => handleTabClick(tab.id)} aria-label={tab.label} disabled={isUploading}>
                            <tab.icon className="w-5 h-5"/>
                        </Button>
                    ))}
                </div>
               <div className="flex items-center gap-2">
                <Button onClick={handlePost} disabled={isPostButtonDisabled}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
