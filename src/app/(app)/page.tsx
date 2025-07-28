import DailyWisdom from "@/components/daily-wisdom";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { mockPosts, mockUsers } from "@/lib/mock-data";
import type { User } from "@/lib/types";

export default function FeedPage() {
  return (
    <div className="space-y-6 p-4 md:p-0">
      <DailyWisdom />
      <CreatePost user={mockUsers['user-3']} />
      <div className="space-y-4">
        {mockPosts.map((post) => {
          const user = mockUsers[post.userId] as User | undefined;
          if (!user) return null;
          return <PostCard key={post.id} post={post} user={user} />;
        })}
      </div>
    </div>
  );
}
