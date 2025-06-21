
import Link from "next/link";
import { Home, LogIn, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IssueReportForm } from "./issue-report-form";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-lg font-headline">JiranTetangga</span>
        </Link>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Wrench className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Submit an Issue Report</DialogTitle>
                <DialogDescription>
                  Let us know about any problems in the neighborhood. Your report will be sent to the administrators.
                </DialogDescription>
              </DialogHeader>
              <IssueReportForm />
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                  <AvatarFallback>JT</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/admin">
                <DropdownMenuItem>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Admin Login</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
