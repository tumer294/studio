
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useCreatePost } from "@/hooks/use-create-post";
import CreatePost from "./create-post";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/lib/types";

export default function CreatePostDialog() {
    const { isOpen, onClose } = useCreatePost();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const handleCreatePost = async (newPostData: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments'>) => {
        if (!user) {
          toast({ variant: 'destructive', title: "Not Authenticated", description: "You must be logged in to create a post."});
          return;
        }

        try {
          await addDoc(collection(db, "posts"), {
            ...newPostData,
            userId: user.uid,
            createdAt: serverTimestamp(),
            likes: [],
            comments: [],
          });
        } catch (error) {
           console.error("Error creating post:", error);
           toast({ variant: 'destructive', title: "Post Error", description: "Could not create the post."});
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new post</DialogTitle>
                </DialogHeader>
                <CreatePost user={user} onPostCreated={onClose} handleCreatePost={handleCreatePost} />
            </DialogContent>
        </Dialog>
    )
}
