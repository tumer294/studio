
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Post } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Trash2, Users, FileText, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';


function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-1/2" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [stats, setStats] = useState({ userCount: 0, postCount: 0 });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const fetchStats = async () => {
             try {
                const usersCol = collection(db, 'users');
                const postsCol = collection(db, 'posts');
                const userSnapshot = await getCountFromServer(usersCol);
                const postSnapshot = await getCountFromServer(postsCol);
                setStats({
                    userCount: userSnapshot.data().count,
                    postCount: postSnapshot.data().count
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch dashboard stats.' });
            }
        };
        
        fetchStats();

        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
        }, (error) => {
             console.error("Error fetching posts:", error);
        });

        return () => {
            unsubUsers();
            unsubPosts();
        };
    }, [toast]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                toast({ title: 'User Deleted', description: `${userName} has been successfully deleted.` });
            } catch (error) {
                console.error("Error deleting user: ", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not delete user. Check Firestore rules.' });
            }
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (window.confirm(`Are you sure you want to delete this post?`)) {
            try {
                await deleteDoc(doc(db, 'posts', postId));
                toast({ title: 'Post Deleted', description: 'The post has been successfully deleted.' });
            } catch (error) {
                console.error("Error deleting post: ", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not delete post. Check Firestore rules.' });
            }
        }
    };

    const usersById = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);


    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <BarChart2 className="w-8 h-8"/>
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Welcome to the admin control center.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={stats.userCount} icon={Users} isLoading={loading} />
                <StatCard title="Total Posts" value={stats.postCount} icon={FileText} isLoading={loading} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View and manage all registered users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && Array.from({length: 3}).map((_, i) => (
                                     <TableRow key={`user-skel-${i}`}>
                                        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                     </TableRow>
                                ))}
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={user.avatarUrl} />
                                                    <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p>{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.createdAt?.toDate ? formatDistanceToNow(user.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteUser(user.id, user.name)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Post Management</CardTitle>
                        <CardDescription>View and manage all user posts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {loading && posts.length === 0 && Array.from({length: 3}).map((_, i) => (
                                     <TableRow key={`post-skel-${i}`}>
                                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                     </TableRow>
                                ))}
                                {posts.map((post) => {
                                    const author = usersById[post.userId];
                                    return (
                                        <TableRow key={post.id}>
                                            <TableCell>{author?.name || 'Unknown User'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{post.content || 'Media Post'}</TableCell>
                                            <TableCell>{post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
