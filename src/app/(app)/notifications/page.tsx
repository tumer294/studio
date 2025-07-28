import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                        <Bell className="w-12 h-12" />
                        <p>You have no new notifications.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
