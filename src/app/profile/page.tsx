
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home } from "lucide-react";

export default function ProfilePage() {
  const user = {
    fullName: "Muhammad Ehsan Imran",
    address: "123 Taman Komuniti, 81750 Masai, Johor",
    dateJoined: "July 1, 2024",
    avatar: "https://placehold.co/100x100.png",
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 pt-24">
       <div className="absolute left-4 top-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.fullName} data-ai-hint="user avatar" />
            <AvatarFallback>JT</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl font-headline">{user.fullName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
           <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="font-semibold text-muted-foreground">Full Name</span>
              <span>{user.fullName}</span>
           </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-muted-foreground">Address</span>
                <span>{user.address}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-muted-foreground">Date Joined</span>
                <span>{user.dateJoined}</span>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
