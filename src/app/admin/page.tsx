
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Pencil, PlusCircle, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const eventProposals = [
  { id: 1, eventName: "Charity Flea Market", eventDate: "25 August 2024", description: "A flea market to raise funds for the local animal shelter.", organizerName: "Jane Doe", organizerEmail: "jane.d@example.com" },
  { id: 2, eventName: "Neighborhood Movie Night", eventDate: "5 September 2024", description: "Outdoor screening of a family-friendly movie at the community park.", organizerName: "John Smith", organizerEmail: "john.s@example.com" },
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
  const [isReviewingProposals, setIsReviewingProposals] = useState(false);
  const [proposalToReject, setProposalToReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const handleAction = (type: 'add' | 'edit' | 'delete', itemType: string, data?: any) => {
    setAction({ type, itemType, data });
  };
  
  const closeDialogs = () => {
    setAction(null);
  };
  
  const handleRejectSubmit = () => {
    console.log(`Rejecting proposal ${proposalToReject.id} for reason: ${rejectionReason}`);
    // Here you would typically call an API to reject the proposal
    setProposalToReject(null);
    setRejectionReason('');
  };

  const handleApprove = (proposalId: number) => {
    console.log(`Approving proposal ${proposalId}`);
    // Here you would typically call an API to approve the proposal
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle data-speakable="true">Road Disruptions</CardTitle>
                <CardDescription data-speakable="true">
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
                    <TableHead data-speakable="true">Title</TableHead>
                    <TableHead data-speakable="true">Reported</TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roadDisruptions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{item.time}</TableCell>
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
                <CardTitle data-speakable="true">Shop Notifications</CardTitle>
                <CardDescription data-speakable="true">
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
                    <TableHead data-speakable="true">Title</TableHead>
                    <TableHead data-speakable="true">Location</TableHead>
                    <TableHead data-speakable="true">Status</TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopNotifications.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{item.location}</TableCell>
                      <TableCell>
                        <Badge data-speakable="true" variant={item.status === 'new' ? 'default' : 'destructive'} className={item.status === 'new' ? 'bg-green-600' : ''}>
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
                <CardTitle data-speakable="true">Park Status</CardTitle>
                <CardDescription data-speakable="true">Manage local park statuses.</CardDescription>
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
                    <TableHead data-speakable="true">Park</TableHead>
                    <TableHead data-speakable="true">Message</TableHead>
                    <TableHead data-speakable="true">Status</TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parkStatus.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium" data-speakable="true">{item.park}</TableCell>
                      <TableCell data-speakable="true">{item.message}</TableCell>
                      <TableCell>
                        <Badge data-speakable="true" variant={item.status === 'open' ? 'default' : 'secondary'} className={item.status === 'open' ? 'bg-green-600' : ''}>
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
                <CardTitle data-speakable="true">Local Events</CardTitle>
                <CardDescription data-speakable="true">Manage community events and review proposals.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-1" onClick={() => setIsReviewingProposals(true)}>
                  <Bell className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Review Proposals
                  </span>
                </Button>
                <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Local Event')}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add New
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-speakable="true">Event</TableHead>
                    <TableHead data-speakable="true">Date</TableHead>
                    <TableHead data-speakable="true">Time</TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localEvents.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{item.date}</TableCell>
                      <TableCell data-speakable="true">{item.time}</TableCell>
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
            <DialogTitle data-speakable="true">
              {action?.type === 'add' ? 'Add New' : 'Edit'} {action?.itemType}
            </DialogTitle>
            <DialogDescription data-speakable="true">
              Make changes here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p data-speakable="true">Form fields for the {action?.itemType?.toLowerCase()} will go here.</p>
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
            <AlertDialogTitle data-speakable="true">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription data-speakable="true">
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

      {/* Dialog for reviewing event proposals */}
      <Dialog open={isReviewingProposals} onOpenChange={setIsReviewingProposals}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle data-speakable="true">Review Event Proposals</DialogTitle>
            <DialogDescription data-speakable="true">
              Approve or reject the following event proposals.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-4">
              {eventProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <CardTitle data-speakable="true">{proposal.eventName}</CardTitle>
                    <CardDescription data-speakable="true">Proposed by: {proposal.organizerName} ({proposal.organizerEmail})</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p data-speakable="true"><span className="font-semibold">Proposed Date:</span> {proposal.eventDate}</p>
                    <p className="text-muted-foreground" data-speakable="true">{proposal.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleApprove(proposal.id)}>Approve</Button>
                    <Button variant="destructive" onClick={() => setProposalToReject(proposal)}>Reject</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for rejection reason */}
      <Dialog open={!!proposalToReject} onOpenChange={() => setProposalToReject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle data-speakable="true">Reason for Rejection</DialogTitle>
            <DialogDescription data-speakable="true">
              Please provide a reason for rejecting the event proposal "{proposalToReject?.eventName}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="rejection-reason" className="sr-only" data-speakable="true">
              Reason for Rejection
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g., Event conflicts with another scheduled activity."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProposalToReject(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
