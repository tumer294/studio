
"use client";

import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
       if (selectedFile.size > 5 * 1024 * 1024 && (activeTab === 'image' || activeTab === 'video')) {
            toast({
                variant: 'destructive',
                title: 'File Too Large',
                description: 'Please select a file smaller than 5MB.',
            });
            event.target.value = ''; // Reset file input
            return;
        }
      setFile(selectedFile);
    }
  };

  const handlePost = async () => {
    if ((!postContent.trim() && !file && !mediaUrl.trim()) || isUploading) return;
    
    setIsUploading(true);
    let finalMediaUrl = mediaUrl;

    try {
        if (file) {
            const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            finalMediaUrl = await getDownloadURL(snapshot.ref);
        }

        const newPost: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'> = {
            content: postContent,
            type: activeTab,
            mediaUrl: finalMediaUrl,
        };

        await onCreatePost(newPost);
        
        // Reset state after posting
        setPostContent("");
        setMediaUrl("");
        setFile(null);
        // We can leave the active tab as is, or reset it. Resetting is cleaner.
        setActiveTab("text");
    } catch(error) {
        console.error("Error during post creation:", error);
        toast({variant: 'destructive', title: 'Upload Error', description: 'Could not upload the media file.'})
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
                        <Button key={tab.id} variant={activeTab === tab.id ? "secondary" : "ghost"} size="icon" onClick={() => setActiveTab(tab.id)} aria-label={tab.label} disabled={isUploading}>
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
