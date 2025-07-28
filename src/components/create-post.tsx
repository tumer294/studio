"use client";

import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextIcon, ImageIcon, Link2Icon } from "lucide-react";

interface CreatePostProps {
  user: User;
}

export default function CreatePost({ user }: CreatePostProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="woman portrait" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Tabs defaultValue="text" className="w-full">
              <Textarea
                placeholder="What's on your mind?"
                className="mb-2 min-h-[60px] text-base"
              />
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text"><TextIcon className="w-4 h-4 mr-2"/>Text</TabsTrigger>
                <TabsTrigger value="image"><ImageIcon className="w-4 h-4 mr-2"/>Image/Video</TabsTrigger>
                <TabsTrigger value="link"><Link2Icon className="w-4 h-4 mr-2"/>Link</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-2">
                {/* Content is the textarea above */}
              </TabsContent>
              <TabsContent value="image" className="mt-2">
                <Input type="text" placeholder="Enter image or video URL" />
              </TabsContent>
              <TabsContent value="link" className="mt-2">
                 <Input type="text" placeholder="Enter link to embed" />
              </TabsContent>
               <div className="flex justify-end mt-2">
                <Button>Post</Button>
              </div>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
