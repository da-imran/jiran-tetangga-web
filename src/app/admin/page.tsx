
"use client";

import { useState, useMemo } from "react";
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
import { Bell, Pencil, PlusCircle, Trash2, ArrowUpDown, ChevronDown } from "lucide-react";
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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, subDays, subHours } from "date-fns";


const roadDisruptions = [
  { id: 1, title: "Jalan Cenderai Water Pipe Burst", date: subHours(new Date(), 2) },
  { id: 2, title: "Accident near Taman Rinting exit", date: subHours(new Date(), 5) },
  { id: 3, title: "Roadworks on Jalan Merbuk until 5 PM", date: subHours(new Date(), 8) },
  { id: 4, title: "Fallen tree on Jalan Delima", date: subDays(new Date(), 1) },
  { id: 5, title: "Pothole repair on Jalan Seri Austin", date: subDays(new Date(), 2) },
  { id: 6, title: "Traffic light out at Jalan Perjiranan", date: subDays(new Date(), 3) },
];

const localEvents = [
  { id: 1, title: "Community Gotong-Royong", date: "28 July 2024", time: "8:00 AM" },
  { id: 2, title: "Weekly Pasar Malam", date: "Every Friday", time: "5:00 PM - 10:00 PM" },
  { id: 3, title: "Sungai Tiram Fun Run", date: "15 August 2024", time: "7:00 AM" },
  { id: 4, title: "National Day Celebration", date: "31 August 2024", time: "9:00 AM" },
  { id: 5, title: "Gardening Workshop", date: "5 September 2024", time: "10:00 AM" },
];

const eventProposals = [
  { id: 1, eventName: "Charity Flea Market", eventDate: new Date("2024-08-25"), description: "A flea market to raise funds for the local animal shelter.", organizerName: "Jane Doe", organizerEmail: "jane.d@example.com" },
  { id: 2, eventName: "Neighborhood Movie Night", eventDate: new Date("2024-09-05"), description: "Outdoor screening of a family-friendly movie at the community park.", organizerName: "John Smith", organizerEmail: "john.s@example.com" },
  { id: 3, eventName: "Zumba Fitness Class", eventDate: new Date("2024-09-12"), description: "Weekly zumba class for all residents.", organizerName: "Alicia Keys", organizerEmail: "alicia.k@example.com" },
  { id: 4, eventName: "Baking Competition", eventDate: new Date("2024-10-20"), description: "A friendly baking competition for all ages.", organizerName: "Gordon Ramsay", organizerEmail: "gordon.r@example.com" },
];

const shopNotifications = [
  { id: 1, title: "New Bakery 'Roti Sedap' now open!", location: "Lot 23, Jalan Nuri", status: "new" },
  { id: 2, title: "Kedai Runcit Ah Meng has closed", location: "No. 12, Jalan Merpati", status: "closed" },
  { id: 3, title: "Grand Opening: Bubble Tea Shop", location: "Near 7-Eleven", status: "new" },
  { id: 4, title: "Hardware store 20% discount", location: "Jalan Delima 5", status: "promo" },
  { id: 5, title: "Clinic opening soon", location: "Taman Daya", status: "new" },
];

const parkStatus = [
  { id: 1, park: "Taman Permainan Utama", status: "open", message: "Playground swings repaired." },
  { id: 2, park: "Taman Rekreasi Sungai Tiram", status: "partial", message: "Jogging track closed for maintenance." },
  { id: 3, park: "Laman Komuniti", status: "open", message: "All facilities are operational." },
  { id: 4, park: "Park Connector", status: "closed", message: "Upgrade works in progress." },
  { id: 5, park: "Dog Park", status: "open", message: "New water fountain installed." },
];

const ITEMS_PER_PAGE = 3;
type SortDirection = "ascending" | "descending";
interface SortConfig {
  key: string;
  direction: SortDirection;
}

export default function AdminDashboardPage() {
  const [action, setAction] = useState<{ type: 'add' | 'edit' | 'delete', itemType: string, data?: any } | null>(null);
  const [isReviewingProposals, setIsReviewingProposals] = useState(false);
  const [proposalToReject, setProposalToReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [search, setSearch] = useState({
    roadDisruptions: "",
    shopNotifications: "",
    parkStatus: "",
    localEvents: "",
    eventProposals: "",
  });

  const [currentPage, setCurrentPage] = useState({
    roadDisruptions: 1,
    shopNotifications: 1,
    parkStatus: 1,
    localEvents: 1,
    eventProposals: 1,
  });

  const [sortConfig, setSortConfig] = useState<{ [key: string]: SortConfig }>({
    roadDisruptions: { key: 'date', direction: 'descending' },
    shopNotifications: { key: 'title', direction: 'ascending' },
    parkStatus: { key: 'park', direction: 'ascending' },
    localEvents: { key: 'title', direction: 'ascending' },
    eventProposals: { key: 'eventName', direction: 'ascending' },
  });

  const [filters, setFilters] = useState<{ [key: string]: string[] }>({
    shopNotifications: [],
    parkStatus: [],
  });
  
  const handleSort = (table: keyof typeof sortConfig, key: string) => {
    setSortConfig(prev => {
      const currentDirection = prev[table].direction;
      const currentKey = prev[table].key;
      let direction: SortDirection = 'ascending';
      if (currentKey === key && currentDirection === 'ascending') {
        direction = 'descending';
      }
      return { ...prev, [table]: { key, direction } };
    });
  };
  
  const handleFilterChange = (table: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const currentFilters = prev[table];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(item => item !== value)
        : [...currentFilters, value];
      return { ...prev, [table]: newFilters };
    });
    handlePageChange(table as keyof typeof currentPage, 1);
  };

  const handleSearch = (table: keyof typeof search, value: string) => {
    setSearch(prev => ({ ...prev, [table]: value }));
    setCurrentPage(prev => ({ ...prev, [table]: 1 }));
  };

  const handlePageChange = (table: keyof typeof currentPage, page: number) => {
    setCurrentPage(prev => ({ ...prev, [table]: page }));
  };
  
  const handleAction = (type: 'add' | 'edit' | 'delete', itemType: string, data?: any) => {
    setAction({ type, itemType, data });
  };
  
  const closeDialogs = () => {
    setAction(null);
  };
  
  const handleRejectSubmit = () => {
    console.log(`Rejecting proposal ${proposalToReject.id} for reason: ${rejectionReason}`);
    setProposalToReject(null);
    setRejectionReason('');
  };

  const handleApprove = (proposalId: number) => {
    console.log(`Approving proposal ${proposalId}`);
  };
  
  const SortArrow = ({ columnKey, table }: { columnKey: string, table: keyof typeof sortConfig }) => {
    if (sortConfig[table].key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig[table].direction === 'ascending' ? '▲' : '▼';
  };

  const filteredRoadDisruptions = useMemo(() => {
    let items = roadDisruptions.filter(item =>
      item.title.toLowerCase().includes(search.roadDisruptions.toLowerCase())
    );

    const { key, direction } = sortConfig.roadDisruptions;
    items.sort((a, b) => {
      const aValue = a[key as keyof typeof a];
      const bValue = b[key as keyof typeof b];
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return items;
  }, [search.roadDisruptions, sortConfig.roadDisruptions]);
  const paginatedRoadDisruptions = useMemo(() => {
    const startIndex = (currentPage.roadDisruptions - 1) * ITEMS_PER_PAGE;
    return filteredRoadDisruptions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRoadDisruptions, currentPage.roadDisruptions]);
  const totalRoadDisruptionPages = Math.ceil(filteredRoadDisruptions.length / ITEMS_PER_PAGE);

  const filteredShopNotifications = useMemo(() => {
    let items = [...shopNotifications];
    
    if (filters.shopNotifications.length > 0) {
      items = items.filter(item => filters.shopNotifications.includes(item.status));
    }

    items = items.filter(item =>
      item.title.toLowerCase().includes(search.shopNotifications.toLowerCase()) ||
      item.location.toLowerCase().includes(search.shopNotifications.toLowerCase())
    );

    const { key, direction } = sortConfig.shopNotifications;
    items.sort((a, b) => {
      const aValue = a[key as keyof typeof a];
      const bValue = b[key as keyof typeof b];
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return items;
  }, [search.shopNotifications, sortConfig.shopNotifications, filters.shopNotifications]);
  const paginatedShopNotifications = useMemo(() => {
    const startIndex = (currentPage.shopNotifications - 1) * ITEMS_PER_PAGE;
    return filteredShopNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredShopNotifications, currentPage.shopNotifications]);
  const totalShopNotificationPages = Math.ceil(filteredShopNotifications.length / ITEMS_PER_PAGE);
  
  const filteredParkStatus = useMemo(() => {
     let items = [...parkStatus];
    
    if (filters.parkStatus.length > 0) {
      items = items.filter(item => filters.parkStatus.includes(item.status));
    }

    items = items.filter(item =>
      item.park.toLowerCase().includes(search.parkStatus.toLowerCase()) ||
      item.message.toLowerCase().includes(search.parkStatus.toLowerCase())
    );
    
    const { key, direction } = sortConfig.parkStatus;
    items.sort((a, b) => {
      const aValue = a[key as keyof typeof a] as string;
      const bValue = b[key as keyof typeof b] as string;
      return direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    return items;
  }, [search.parkStatus, sortConfig.parkStatus, filters.parkStatus]);
  const paginatedParkStatus = useMemo(() => {
    const startIndex = (currentPage.parkStatus - 1) * ITEMS_PER_PAGE;
    return filteredParkStatus.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredParkStatus, currentPage.parkStatus]);
  const totalParkStatusPages = Math.ceil(filteredParkStatus.length / ITEMS_PER_PAGE);

  const filteredLocalEvents = useMemo(() => {
    let items = localEvents.filter(item =>
      item.title.toLowerCase().includes(search.localEvents.toLowerCase()) ||
      item.date.toLowerCase().includes(search.localEvents.toLowerCase()) ||
      item.time.toLowerCase().includes(search.localEvents.toLowerCase())
    );

    const { key, direction } = sortConfig.localEvents;
    items.sort((a, b) => {
      const aValue = a[key as keyof typeof a] as string;
      const bValue = b[key as keyof typeof b] as string;
      return direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    return items;
  }, [search.localEvents, sortConfig.localEvents]);
  const paginatedLocalEvents = useMemo(() => {
    const startIndex = (currentPage.localEvents - 1) * ITEMS_PER_PAGE;
    return filteredLocalEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLocalEvents, currentPage.localEvents]);
  const totalLocalEventPages = Math.ceil(filteredLocalEvents.length / ITEMS_PER_PAGE);

  const filteredEventProposals = useMemo(() => {
    let items = eventProposals.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search.eventProposals.toLowerCase())
      )
    );

    const { key, direction } = sortConfig.eventProposals;
    items.sort((a, b) => {
      const aValue = a[key as keyof typeof a];
      const bValue = b[key as keyof typeof b];
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return items;
  }, [search.eventProposals, sortConfig.eventProposals]);
  const paginatedEventProposals = useMemo(() => {
    const startIndex = (currentPage.eventProposals - 1) * ITEMS_PER_PAGE;
    return filteredEventProposals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEventProposals, currentPage.eventProposals]);
  const totalEventProposalPages = Math.ceil(filteredEventProposals.length / ITEMS_PER_PAGE);

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
              <div className="flex items-center gap-2">
                 <Input
                  placeholder="Search disruptions..."
                  value={search.roadDisruptions}
                  onChange={(e) => handleSearch('roadDisruptions', e.target.value)}
                  className="w-full sm:w-auto"
                />
                <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Road Disruption')}>
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
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('roadDisruptions', 'title')} data-speakable="true">
                        Title
                        <SortArrow table="roadDisruptions" columnKey="title" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('roadDisruptions', 'date')} data-speakable="true">
                        Reported
                        <SortArrow table="roadDisruptions" columnKey="date" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRoadDisruptions.length > 0 ? paginatedRoadDisruptions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{formatDistanceToNow(item.date, { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleAction('edit', 'Road Disruption', item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('delete', 'Road Disruption', item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No results found.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Page {currentPage.roadDisruptions} of {totalRoadDisruptionPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('roadDisruptions', currentPage.roadDisruptions - 1)}
                  disabled={currentPage.roadDisruptions <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('roadDisruptions', currentPage.roadDisruptions + 1)}
                  disabled={currentPage.roadDisruptions >= totalRoadDisruptionPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle data-speakable="true">Shop Notifications</CardTitle>
                <CardDescription data-speakable="true">
                  Manage local business notifications.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search notifications..."
                  value={search.shopNotifications}
                  onChange={(e) => handleSearch('shopNotifications', e.target.value)}
                  className="w-full sm:w-auto"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {['new', 'closed', 'promo'].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        className="capitalize"
                        checked={filters.shopNotifications.includes(status)}
                        onCheckedChange={() => handleFilterChange('shopNotifications', status)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Shop Notification')}>
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
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('shopNotifications', 'title')} data-speakable="true">
                         Title
                         <SortArrow table="shopNotifications" columnKey="title" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('shopNotifications', 'location')} data-speakable="true">
                         Location
                         <SortArrow table="shopNotifications" columnKey="location" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('shopNotifications', 'status')} data-speakable="true">
                         Status
                         <SortArrow table="shopNotifications" columnKey="status" />
                       </Button>
                    </TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {paginatedShopNotifications.length > 0 ? paginatedShopNotifications.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{item.location}</TableCell>
                      <TableCell>
                        <Badge data-speakable="true" variant={item.status === 'new' ? 'default' : item.status === 'promo' ? 'secondary' : 'destructive'} className={item.status === 'new' ? 'bg-green-600' : item.status === 'promo' ? 'bg-blue-500 text-white' : ''}>
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
                  )) : (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No results found.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
               <span className="text-sm text-muted-foreground">
                Page {currentPage.shopNotifications} of {totalShopNotificationPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('shopNotifications', currentPage.shopNotifications - 1)}
                  disabled={currentPage.shopNotifications <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('shopNotifications', currentPage.shopNotifications + 1)}
                  disabled={currentPage.shopNotifications >= totalShopNotificationPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle data-speakable="true">Park Status</CardTitle>
                <CardDescription data-speakable="true">Manage local park statuses.</CardDescription>
              </div>
               <div className="flex items-center gap-2">
                <Input
                  placeholder="Search parks..."
                  value={search.parkStatus}
                  onChange={(e) => handleSearch('parkStatus', e.target.value)}
                  className="w-full sm:w-auto"
                />
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {['open', 'closed', 'partial'].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        className="capitalize"
                        checked={filters.parkStatus.includes(status)}
                        onCheckedChange={() => handleFilterChange('parkStatus', status)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" className="gap-1" onClick={() => handleAction('add', 'Park Status')}>
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
                     <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('parkStatus', 'park')} data-speakable="true">
                         Park
                         <SortArrow table="parkStatus" columnKey="park" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('parkStatus', 'message')} data-speakable="true">
                         Message
                         <SortArrow table="parkStatus" columnKey="message" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('parkStatus', 'status')} data-speakable="true">
                         Status
                         <SortArrow table="parkStatus" columnKey="status" />
                       </Button>
                    </TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedParkStatus.length > 0 ? paginatedParkStatus.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium" data-speakable="true">{item.park}</TableCell>
                      <TableCell data-speakable="true">{item.message}</TableCell>
                      <TableCell>
                        <Badge data-speakable="true" variant={item.status === 'open' ? 'default' : item.status === 'partial' ? 'secondary' : 'destructive'} className={item.status === 'open' ? 'bg-green-600' : item.status === 'partial' ? 'bg-yellow-500' : ''}>
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
                  )) : (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No results found.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter className="flex justify-between items-center">
               <span className="text-sm text-muted-foreground">
                Page {currentPage.parkStatus} of {totalParkStatusPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('parkStatus', currentPage.parkStatus - 1)}
                  disabled={currentPage.parkStatus <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('parkStatus', currentPage.parkStatus + 1)}
                  disabled={currentPage.parkStatus >= totalParkStatusPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle data-speakable="true">Local Events</CardTitle>
                <CardDescription data-speakable="true">Manage community events and review proposals.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                    placeholder="Search events..."
                    value={search.localEvents}
                    onChange={(e) => handleSearch('localEvents', e.target.value)}
                    className="w-full sm:w-auto"
                  />
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
                     <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('localEvents', 'title')} data-speakable="true">
                         Event
                         <SortArrow table="localEvents" columnKey="title" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('localEvents', 'date')} data-speakable="true">
                         Date
                         <SortArrow table="localEvents" columnKey="date" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('localEvents', 'time')} data-speakable="true">
                         Time
                         <SortArrow table="localEvents" columnKey="time" />
                       </Button>
                    </TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLocalEvents.length > 0 ? paginatedLocalEvents.map((item) => (
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
                  )) : (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No results found.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
               <span className="text-sm text-muted-foreground">
                Page {currentPage.localEvents} of {totalLocalEventPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('localEvents', currentPage.localEvents - 1)}
                  disabled={currentPage.localEvents <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('localEvents', currentPage.localEvents + 1)}
                  disabled={currentPage.localEvents >= totalLocalEventPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
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
          <div className="p-1">
             <Input
                placeholder="Search proposals..."
                value={search.eventProposals}
                onChange={(e) => handleSearch('eventProposals', e.target.value)}
                className="w-full mb-4"
              />
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
              {paginatedEventProposals.length > 0 ? paginatedEventProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <CardTitle data-speakable="true">{proposal.eventName}</CardTitle>
                    <CardDescription data-speakable="true">Proposed by: {proposal.organizerName} ({proposal.organizerEmail})</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p data-speakable="true"><span className="font-semibold">Proposed Date:</span> {proposal.eventDate.toLocaleDateString()}</p>
                    <p className="text-muted-foreground" data-speakable="true">{proposal.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleApprove(proposal.id)}>Approve</Button>
                    <Button variant="destructive" onClick={() => setProposalToReject(proposal)}>Reject</Button>
                  </CardFooter>
                </Card>
              )) : (
                <div className="text-center text-muted-foreground py-12">No proposals found.</div>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center pt-4 border-t mt-2">
               <span className="text-sm text-muted-foreground">
                Page {currentPage.eventProposals} of {totalEventProposalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('eventProposals', currentPage.eventProposals - 1)}
                  disabled={currentPage.eventProposals <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('eventProposals', currentPage.eventProposals + 1)}
                  disabled={currentPage.eventProposals >= totalEventProposalPages}
                >
                  Next
                </Button>
              </div>
            </DialogFooter>
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
