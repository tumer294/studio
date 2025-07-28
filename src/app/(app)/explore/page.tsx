import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExplorePage() {
    return (
        <div className="p-4 md:p-0">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Explore</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The explore page is under construction. Check back later to discover new content and users!</p>
                </CardContent>
            </Card>
        </div>
    );
}
