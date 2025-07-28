import Image from "next/image";
import { mockUsers, mockPosts } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/post-card";
import { UserPlus, Mail } from "lucide-react";

export default function ProfilePage({ params }: { params: { username: string } }) {
  const username = params.username;
  const user = Object.values(mockUsers).find(u => u.username === username || (username === 'me' && u.id === 'user-3'));

  if (!user) {
    notFound();
  }

  const userPosts = mockPosts.filter(p => p.userId === user.id);

  return (
    <div className="p-4 md:p-0">
        <Card className="overflow-hidden">
            <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-accent/20" />
            <div className="p-4 relative">
                <div className="absolute -top-16 left-6">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card shadow-md">
                        <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                        <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                
                <div className="flex justify-end items-center mb-4">
                   <div className="flex gap-2">
                     <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Follow
                     </Button>
                     <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4"/> Message
                     </Button>
                   </div>
                </div>

                <div className="pt-8">
                    <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <p className="mt-2 text-foreground/90">{user.bio}</p>
                </div>

                <div className="flex gap-6 mt-4 text-sm">
                    <div>
                        <span className="font-bold">{user.following}</span>
                        <span className="text-muted-foreground"> Following</span>
                    </div>
                    <div>
                        <span className="font-bold">{user.followers}</span>
                        <span className="text-muted-foreground"> Followers</span>
                    </div>
                </div>
            </div>
        </Card>

        <Tabs defaultValue="posts" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="replies">Replies</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4 space-y-4">
                {userPosts.map(post => (
                    <PostCard key={post.id} post={post} user={user} />
                ))}
                 {userPosts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No posts yet.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
}
