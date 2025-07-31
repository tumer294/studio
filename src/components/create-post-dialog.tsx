
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
import { useTranslation } from "@/hooks/use-translation";

export default function CreatePostDialog() {
    const { isOpen, onClose } = useCreatePost();
    const { user } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();
    
    const handleCreatePost = async (newPostData: Omit<Post, 'id' | 'userId' | 'createdAt' | 'likes' | 'comments' | 'reports' | 'status'>) => {
        if (!user) {
          toast({ variant: 'destructive', title: t.notAuthenticated, description: t.mustBeLoggedIn});
          return;
        }

        try {
          const postPayload = {
            ...newPostData,
            userId: user.uid,
            createdAt: serverTimestamp(),
            likes: [],
            comments: [],
            reports: [],
            status: 'active',
          };
          await addDoc(collection(db, "posts"), postPayload);
        } catch (error) {
           console.error("Error creating post in Firestore:", error);
           toast({ variant: 'destructive', title: t.postError, description: t.couldNotCreatePost});
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.createNewPost}</DialogTitle>
                     <DialogDescription>
                        Share your thoughts, photos, videos, or links with the community.
                    </DialogDescription>
                </DialogHeader>
                <CreatePost user={user} onPostCreated={onClose} handleCreatePost={handleCreatePost} />
            </DialogContent>
        </Dialog>
    )
}

    