
"use client";

import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Post } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextIcon, ImageIcon, Link2Icon, Film, Loader2 } from "lucide-react";
import { storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

interface CreatePostProps {
  user: any; 
  onPostCreated: () => void;
  handleCreatePost: (post: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments' | 'reports' | 'status'>) => Promise<void>;
}

export default function CreatePost({ user, onPostCreated, handleCreatePost }: CreatePostProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "video" | "link">("text");
  const [postContent, setPostContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); 
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

      if (activeTab === 'image' && !allowedImageTypes.includes(selectedFile.type)) {
          toast({ variant: 'destructive', title: t.invalidFile, description: t.invalidImageFile });
          return;
      }
      if (activeTab === 'video' && !allowedVideoTypes.includes(selectedFile.type)) {
          toast({ variant: 'destructive', title: t.invalidFile, description: t.invalidVideoFile });
          return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
          toast({ variant: 'destructive', title: t.fileTooLarge, description: t.fileTooLarge20MB });
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
    if ((!postContent.trim() && !file && !mediaUrl.trim()) || isUploading) {
        return;
    }
    
    setIsUploading(true);
    
    try {
        let finalMediaUrl = mediaUrl;
        let postType: Post['type'] = activeTab;

        if (file) {
            postType = activeTab as 'image' | 'video';
            const storagePath = postType === 'image' ? `posts/images/${user.uid}/${Date.now()}-${file.name}` : `posts/videos/${user.uid}/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, storagePath);
            
            const snapshot = await uploadBytes(storageRef, file);
            finalMediaUrl = await getDownloadURL(snapshot.ref);
        }

        const newPost: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments' | 'reports' | 'status'> = {
            content: postContent,
            type: postType,
            mediaUrl: finalMediaUrl,
        };
        
        await handleCreatePost(newPost);
        
        toast({ title: t.success, description: t.postPublished });
        resetState();
        onPostCreated();

    } catch(error: any) {
        toast({variant: 'destructive', title: t.uploadError, description: error.message || t.couldNotCreatePost})
    } finally {
        setIsUploading(false);
    }
  };
  
  const TABS = [
      { id: 'text', icon: TextIcon, label: 'Text' },
      { id: 'image', icon: ImageIcon, label: t.selectImageToUpload },
      { id: 'video', icon: Film, label: t.selectVideoToUpload },
      { id: 'link', icon: Link2Icon, label: 'Link' },
  ] as const;
  
  const handleTabClick = (tabId: "text" | "image" | "video" | "link") => {
      setFile(null);
      setMediaUrl("");
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setActiveTab(tabId);
  }

  const isPostButtonDisabled = (postContent.trim() === "" && !file && (activeTab !== 'link' || mediaUrl.trim() === "")) || isUploading;


  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl || user.photoURL} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback>{user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder={t.whatsOnYourMind}
              className="mb-2 min-h-[80px] text-base focus:ring-0 border-0 focus-visible:ring-offset-0 focus-visible:ring-0"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
          </div>
        </div>
        <div>
           {(activeTab === 'image') && (
              <div className="mt-2">
                 <Label htmlFor="image-upload" className="text-sm font-medium text-muted-foreground">{t.selectImageToUpload}</Label>
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
                 <Label htmlFor="video-upload" className="text-sm font-medium text-muted-foreground">{t.selectVideoToUpload}</Label>
                <Input 
                  id="video-upload"
                  type="file" 
                  accept="video/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="file:text-foreground"
                />
              </div>
            )}
            {(activeTab === 'link') && (
               <div className="mt-2">
                 <Input type="url" placeholder={t.linkUrlPlaceholder} value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} />
              </div>
            )}
        </div>
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
              {isUploading ? t.posting : t.post}
            </Button>
          </div>
        </div>
    </div>
  );
}
