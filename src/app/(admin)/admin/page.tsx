
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, getCountFromServer, updateDoc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Post, StorageStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Trash2, Users, FileText, BarChart2, ShieldAlert, Ban, HardDrive, Send, RefreshCw, Power } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const STORAGE_LIMIT_GB = 9.9;
const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_GB * 1024 * 1024 * 1024;


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

function StorageUsageChart({ storageStats, isLoading }: { storageStats: StorageStats | null, isLoading: boolean }) {
    const { t } = useTranslation();
    const usedBytes = storageStats?.totalStorageUsed || 0;
    const remainingBytes = Math.max(0, STORAGE_LIMIT_BYTES - usedBytes);
    const usedGb = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
    const percentage = ((usedBytes / STORAGE_LIMIT_BYTES) * 100).toFixed(2);

    const data = [
        { name: t.usedStorage, value: usedBytes, color: 'hsl(var(--primary))' },
        { name: t.remainingStorage, value: remainingBytes, color: 'hsl(var(--secondary))' },
    ];

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HardDrive /> {t.storageUsage}</CardTitle>
                    <CardDescription>{t.storageUsageDesc}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[200px]">
                    <Skeleton className="h-40 w-40 rounded-full" />
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><HardDrive /> {t.storageUsage}</CardTitle>
                <CardDescription>
                    {t.storageUsageDetail(usedGb, percentage, STORAGE_LIMIT_GB)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="hsl(var(--background))"
                                strokeWidth={3}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                                formatter={(value: number) => `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`}
                            />
                             <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}


export default function AdminPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [stats, setStats] = useState({ userCount: 0, postCount: 0, reportedCount: 0, bannedCount: 0 });
    const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [notificationMessage, setNotificationMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCounts = async () => {
        try {
            const usersCol = collection(db, 'users');
            const postsCol = collection(db, 'posts');
            const userSnapshot = await getCountFromServer(usersCol);
            const postSnapshot = await getCountFromServer(postsCol);
             setStats(prev => ({ ...prev, userCount: userSnapshot.data().count, postCount: postSnapshot.data().count }));
        } catch (error) {
            console.error("Error fetching counts:", error);
            toast({ variant: 'destructive', title: t.error, description: t.couldNotFetchDashboardStats });
        }
    };
    
    useEffect(() => {
        setLoading(true);
        fetchCounts();

        const unsubUsers = onSnapshot(collection(db, 'users'), 
            (snapshot) => setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))),
            (error) => {
                console.error("Error fetching users:", error);
                toast({ variant: 'destructive', title: "Error", description: "Could not fetch users." });
            }
        );

        const unsubPosts = onSnapshot(collection(db, 'posts'), 
            (snapshot) => {
                const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
                setPosts(postsData);
                setStats(prev => ({
                    ...prev,
                    postCount: postsData.length,
                    reportedCount: postsData.filter(p => (p.reports?.length || 0) > 0).length,
                    bannedCount: postsData.filter(p => p.status === 'banned').length
                }));
                 if(loading) setLoading(false);
            },
            (error) => {
                console.error("Error fetching posts:", error);
                toast({ variant: 'destructive', title: "Error", description: "Could not fetch posts." });
                 if(loading) setLoading(false);
            }
        );

        const unsubStorage = onSnapshot(doc(db, 'storageStats', 'global'), 
            (doc) => {
                if (doc.exists()) {
                    setStorageStats(doc.data() as StorageStats);
                } else {
                    setStorageStats({ totalStorageUsed: 0, currentCycleStart: new Date() });
                }
            },
            (error) => console.error("Error fetching storage stats:", error)
        );

        return () => {
            unsubUsers();
            unsubPosts();
            unsubStorage();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                toast({ title: t.userDeleted, description: t.userDeletedDesc(userName) });
            } catch (error) {
                console.error("Error deleting user: ", error);
                toast({ variant: 'destructive', title: t.error, description: t.couldNotDeleteUser });
            }
        }
    };

    const handlePostStatusChange = async (postId: string, status: 'active' | 'banned') => {
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, { status });
            toast({ title: t.postUpdated, description: t.postUpdatedDesc(status) });
        } catch (error) {
            console.error("Error updating post status: ", error);
            toast({ variant: 'destructive', title: t.error, description: t.couldNotUpdatePost });
        }
    };


    const handleDeletePost = async (postId: string) => {
        if (window.confirm(`Are you sure you want to delete this post?`)) {
            try {
                await deleteDoc(doc(db, 'posts', postId));
                toast({ title: t.postDeleted, description: t.postDeletedDesc });
            } catch (error) {
                console.error("Error deleting post: ", error);
                toast({ variant: 'destructive', title: t.error, description: t.couldNotDeletePost });
            }
        }
    };

    const handleSendNotification = async () => {
        if (!notificationMessage.trim()) return;
        setIsSubmitting(true);
        try {
            const notificationsRef = collection(db, 'notifications');
            await addDoc(notificationsRef, {
                message: notificationMessage,
                createdAt: serverTimestamp(),
                type: 'global'
            });
            toast({ title: "Notification Sent", description: "The global notification has been sent to all users." });
            setNotificationMessage("");
        } catch(error) {
            console.error("Error sending notification:", error);
            toast({ variant: 'destructive', title: t.error, description: "Could not send the notification." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecalculateStats = async () => {
        setIsSubmitting(true);
        await fetchCounts();
        setIsSubmitting(false);
        toast({ title: "Stats Recalculated", description: "The dashboard statistics have been updated." });
    };
    
    const handleToggleSiteStatus = async (disable: boolean) => {
        setIsSubmitting(true);
        try {
            const statusRef = doc(db, 'site_status', 'main');
            await setDoc(statusRef, { 
                isEnabled: !disable,
                updatedAt: serverTimestamp() 
            }, { merge: true });
            toast({ title: "Site Status Updated", description: `The site has been ${disable ? 'disabled' : 'enabled'}.` });
        } catch (error) {
            console.error("Error updating site status:", error);
            toast({ variant: 'destructive', title: t.error, description: "Could not update site status." });
        } finally {
            setIsSubmitting(false);
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
                    {t.adminDashboard}
                </h1>
                <p className="text-muted-foreground">{t.adminWelcome}</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title={t.totalUsers} value={stats.userCount} icon={Users} isLoading={loading} />
                <StatCard title={t.totalPosts} value={stats.postCount} icon={FileText} isLoading={loading} />
                <StatCard title={t.reportedPosts} value={stats.reportedCount} icon={ShieldAlert} isLoading={loading} />
                <StatCard title={t.bannedPosts} value={stats.bannedCount} icon={Ban} isLoading={loading} />
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
                <StorageUsageChart storageStats={storageStats} isLoading={loading} />
                <Card>
                    <CardHeader>
                        <CardTitle>{t.quickActions}</CardTitle>
                        <CardDescription>{t.quickActionsDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full"><Send className="mr-2"/>{t.sendGlobalNotification}</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t.sendGlobalNotification}</DialogTitle>
                                    <DialogDescription>
                                        This message will be shown to all users. Use for important announcements.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Label htmlFor="notification" className="sr-only">Notification Message</Label>
                                    <Textarea id="notification" value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} placeholder="Enter your notification message here..." />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="ghost">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button onClick={handleSendNotification} disabled={isSubmitting || !notificationMessage.trim()}>
                                            {isSubmitting ? "Sending..." : "Send Notification"}
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        
                         <Button variant="outline" className="w-full" onClick={handleRecalculateStats} disabled={isSubmitting}>
                           <RefreshCw className={`mr-2 ${isSubmitting ? 'animate-spin' : ''}`} />
                           {isSubmitting ? "Recalculating..." : t.recalculateStats}
                        </Button>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="destructive" className="w-full"><Power className="mr-2"/>{t.disableSite}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will make the site inaccessible to regular users. You will need to re-enable it manually from here.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleToggleSiteStatus(true)} disabled={isSubmitting}>
                                        Yes, disable the site
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t.postManagement}</CardTitle>
                        <CardDescription>{t.postManagementDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.author}</TableHead>
                                    <TableHead>{t.content}</TableHead>
                                    <TableHead>{t.reports}</TableHead>
                                    <TableHead>{t.status}</TableHead>
                                    <TableHead>{t.created}</TableHead>
                                    <TableHead className="text-right">{t.actions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {loading && posts.length === 0 && Array.from({length: 3}).map((_, i) => (
                                     <TableRow key={`post-skel-${i}`}>
                                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                     </TableRow>
                                ))}
                                {posts.map((post) => {
                                    const author = usersById[post.userId];
                                    const postStatus = post.status || 'active';
                                    return (
                                        <TableRow key={post.id}>
                                            <TableCell>{author?.name || t.unknownUser}</TableCell>
                                            <TableCell className="max-w-xs truncate">{post.content || t.mediaPost}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={(post.reports?.length || 0) > 0 ? "destructive" : "secondary"}>
                                                   {post.reports?.length || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={postStatus === 'banned' ? "destructive" : "default"} className="capitalize">
                                                   {postStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {postStatus === 'active' ? (
                                                            <DropdownMenuItem onClick={() => handlePostStatusChange(post.id, 'banned')}>
                                                                <Ban className="mr-2 h-4 w-4" /> {t.banPost}
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => handlePostStatusChange(post.id, 'active')}>
                                                                <Ban className="mr-2 h-4 w-4" /> {t.unbanPost}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeletePost(post.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> {t.deletePost}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t.userManagement}</CardTitle>
                        <CardDescription>{t.userManagementDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.user}</TableHead>
                                    <TableHead>{t.email}</TableHead>
                                    <TableHead>{t.joined}</TableHead>
                                    <TableHead className="text-right">{t.actions}</TableHead>
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
                                                        {t.deleteUser}
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
            </div>
        </div>
    );
}
