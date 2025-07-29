import PostCard from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPosts, mockUsers } from "@/lib/mock-data";
import type { User } from "@/lib/types";

export default function ExplorePage() {
    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Explore</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mockPosts.map((post) => {
                            if (post.type === 'image' && post.mediaUrl) {
                                const user = mockUsers[post.userId] as User | undefined;
                                if (!user) return null;
                                return (
                                    <div key={post.id} className="group relative aspect-square overflow-hidden rounded-lg">
                                        <img src={post.mediaUrl} alt="Post image" className="w-full h-full object-cover transition-transform group-hover:scale-110" data-ai-hint={post['data-ai-hint']} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                            <p className="text-white text-sm text-center line-clamp-3">{post.content}</p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
