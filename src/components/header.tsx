
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogIn, Wrench, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { IssueReportForm } from "./issue-report-form";
import { Badge } from "./ui/badge";
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAdminLoggedIn(!!token);
    setIsAdminPage(pathname.startsWith('/admin'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    setIsAdminLoggedIn(false);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-lg font-headline">JiranTetangga</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAdminLoggedIn ? (
            <>
              {isAdminPage ? (
                 <Button variant="ghost" asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      View Dashboard
                    </Link>
                  </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link href="/admin">
                    <User className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will end your current session.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Badge variant="outline" className="hidden font-semibold md:block">Admin</Badge>
            </>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Wrench className="mr-2 h-4 w-4" />
                    Report an Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle data-speakable="true">Submit an Issue Report</DialogTitle>
                    <DialogDescription data-speakable="true">
                      Let us know about any problems in the neighborhood. Your report will be sent to the administrators.
                    </DialogDescription>
                  </DialogHeader>
                  <IssueReportForm />
                </DialogContent>
              </Dialog>
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Admin Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
