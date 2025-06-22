"use client";

import { useState } from "react";
import { AppHeader } from "@/components/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";

const roadDisruptions = [
  { id: 1, title: "Jalan Cenderai Water Pipe Burst", time: "2 hours ago" },
  { id: 2, title: "Accident near Taman Rinting exit", time: "5 hours ago" },
  { id: 3, title: "Roadworks on Jalan Merbuk until 5 PM", time: "8 hours ago" },
  { id: 4, title: "Fallen tree on Jalan Delima", time: "1 day ago" },
];

const localEvents = [
  { id: 1, title: "Community Gotong-Royong", date: "28 July 2024", time: "8:00 AM" },
  { id: 2, title: "Weekly Pasar Malam", date: "Every Friday", time: "5:00 PM - 10:00 PM" },
  { id: 3, title: "Sungai Tiram Fun Run", date: "15 August 2024", time: "7:00 AM" },
];

const shopNotifications = [
  { id: 1, title: "New Bakery 'Roti Sedap' now open!", location: "Lot 23, Jalan Nuri", status: "new" },
  { id: 2, title: "Kedai Runcit Ah Meng has closed", location: "No. 12, Jalan Merpati", status: "closed" },
  { id: 3, title: "Grand Opening: Bubble Tea Shop", location: "Near 7-Eleven", status: "new" },
];

const parkStatus = [
  { id: 1, park: "Taman Permainan Utama", status: "open", message: "Playground swings repaired." },
  { id: 2, park: "Taman Rekreasi Sungai Tiram", status: "partial", message: "Jogging track closed for maintenance." },
  { id: 3, park: "Laman Komuniti", status: "open", message: "All facilities are operational." },
];


export default function AdminDashboardPage() {
  const [action, setAction] = useState<{ type: 'add' | 'edit' | 'delete', itemType: string, data?: any } | null>(null);
  
  const handleAction = (type: 'add' | 'edit' | 'delete', itemType: string, data?: any) => {
    setAction({ type, itemType, data });
  };
  
  const closeDialogs = () => {
    setAction(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Road Disruptions</CardTitle>
                <CardDescription>
                  Manage all road disruption reports.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Road Disruption')}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add New
                </span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roadDisruptions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.time}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleAction('edit', 'Road Disruption', item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('delete', 'Road Disruption', item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Shop Notifications</CardTitle>
                <CardDescription>
                  Manage local business notifications.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Shop Notification')}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add New
                </span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopNotifications.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'new' ? 'default' : 'destructive'} className={item.status === 'new' ? 'bg-green-600' : ''}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleAction('edit', 'Shop Notification', item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('delete', 'Shop Notification', item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Park Status</CardTitle>
                <CardDescription>Manage local park statuses.</CardDescription>
              </div>
              <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Park Status')}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add New
                </span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Park</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parkStatus.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.park}</TableCell>
                      <TableCell>{item.message}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'open' ? 'default' : 'secondary'} className={item.status === 'open' ? 'bg-green-600' : ''}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleAction('edit', 'Park Status', item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('delete', 'Park Status', item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Local Events</CardTitle>
                <CardDescription>Manage community events.</CardDescription>
              </div>
               <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Local Event')}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add New
                </span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localEvents.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.time}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleAction('edit', 'Local Event', item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('delete', 'Local Event', item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Dialog for Add/Edit */}
      <Dialog open={action?.type === 'add' || action?.type === 'edit'} onOpenChange={closeDialogs}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {action?.type === 'add' ? 'Add New' : 'Edit'} {action?.itemType}
            </DialogTitle>
            <DialogDescription>
              Make changes here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Form fields for the {action?.itemType?.toLowerCase()} will go here.</p>
            {action?.type === 'edit' && (
              <pre className="mt-4 rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(action.data, null, 2)}
              </pre>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
            <Button onClick={closeDialogs}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AlertDialog for Delete */}
      <AlertDialog open={action?.type === 'delete'} onOpenChange={closeDialogs}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {action?.itemType?.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialogs}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={closeDialogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
