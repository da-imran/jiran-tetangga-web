
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Bell, Pencil, PlusCircle, Trash2, ArrowUpDown, ChevronDown, CalendarIcon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow, parse } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Schemas for form validation
const roadDisruptionSchema = z.object({
  title: z.string().min(5, "Title is required."),
  description: z.string().min(10, "Description is required."),
  category: z.string().min(1, "Please select a category."),
});

const shopNotificationSchema = z.object({
  name: z.string().min(3, "Shop name is required."),
  description: z.string().min(10, "Description is required."),
  status: z.enum(["new", "closed", "promo"]),
  openingHours: z.object({
    opening: z.string().regex(/^\d{4}$/, "Opening time must be in HHmm format."),
    closing: z.string().regex(/^\d{4}$/, "Closing time must be in HHmm format."),
  }),
});

const parkStatusSchema = z.object({
  name: z.string().min(3, "Park name is required."),
  description: z.string().min(10, "Description is required."),
  status: z.enum(["open", "closed", "maintenance"]),
   openingHours: z.object({
    opening: z.string().regex(/^\d{4}$/, "Opening time must be in HHmm format."),
    closing: z.string().regex(/^\d{4}$/, "Closing time must be in HHmm format."),
  }),
});

const localEventSchema = z.object({
  title: z.string().min(5, "Event title is required."),
  description: z.string().min(10, "Description is required."),
  location: z.string().min(3, "Location is required."),
  eventDate: z.date({ required_error: "Event date is required." }),
});

const formSchemas = {
  'Road Disruption': roadDisruptionSchema,
  'Shop Notification': shopNotificationSchema,
  'Park Status': parkStatusSchema,
  'Local Event': localEventSchema,
};


const ITEMS_PER_PAGE = 3;
type SortDirection = "ascending" | "descending";
interface SortConfig {
  key: string;
  direction: SortDirection;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [action, setAction] = useState<{ type: 'add' | 'edit' | 'delete', itemType: string, data?: any } | null>(null);
  const [isReviewingProposals, setIsReviewingProposals] = useState(false);
  const [proposalToReject, setProposalToReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: action ? zodResolver(formSchemas[action.itemType as keyof typeof formSchemas]) : undefined,
  });

  useEffect(() => {
    if (action?.type === 'edit' && action.data) {
      const itemType = action.itemType;
      let defaultValues = { ...action.data };
      if (itemType === 'Local Event') {
        defaultValues.eventDate = new Date(action.data.eventDate);
      }
      form.reset(defaultValues);
    } else {
      form.reset();
    }
  }, [action, form]);


  const [roadDisruptions, setRoadDisruptions] = useState<any[]>([]);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [eventProposals, setEventProposals] = useState<any[]>([]);
  const [shopNotifications, setShopNotifications] = useState<any[]>([]);
  const [parkStatus, setParkStatus] = useState<any[]>([]);

  const [loading, setLoading] = useState({
    roadDisruptions: true,
    shopNotifications: true,
    parkStatus: true,
    localEvents: true,
    eventProposals: true,
  });

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
    shopNotifications: { key: 'name', direction: 'ascending' },
    parkStatus: { key: 'name', direction: 'ascending' },
    localEvents: { key: 'title', direction: 'ascending' },
    eventProposals: { key: 'eventName', direction: 'ascending' },
  });

  const [filters, setFilters] = useState<{ [key: string]: string[] }>({
    shopNotifications: [],
    parkStatus: [],
  });

  const fetchData = async (endpoint: string, setData: Function, setLoadingState: Function, dataKey: string) => {
    setLoadingState((prev: any) => ({ ...prev, [dataKey]: true }));
    try {
        const response = await fetch(`http://localhost:3500/jiran-tetangga/v1/${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': 'jxdMegN9KOAZMwMCfIbV' },
        });
        if (!response.ok) throw new Error(`Failed to fetch ${dataKey}`);
        const result = await response.json();
        
        let processedData = result.data;
        if (dataKey === 'roadDisruptions') {
            processedData = result.data.map((item: any) => ({ ...item, date: new Date(item.createdAt) }));
        } else if (dataKey === 'localEvents') {
            processedData = result.data.map((item: any) => ({ ...item, date: new Date(item.eventDate) }));
        } else if (dataKey === 'eventProposals') {
             processedData = result.data.map((item: any) => ({ ...item, eventDate: new Date(item.eventDate) }));
        }

        setData(processedData);
    } catch (error) {
        console.error(`Error fetching ${dataKey}:`, error);
        setData([]);
    } finally {
        setLoadingState((prev: any) => ({ ...prev, [dataKey]: false }));
    }
  };

  useEffect(() => {
    fetchData('disruptions', setRoadDisruptions, setLoading, 'roadDisruptions');
    fetchData('shops', setShopNotifications, setLoading, 'shopNotifications');
    fetchData('parks', setParkStatus, setLoading, 'parkStatus');
    fetchData('events', setLocalEvents, setLoading, 'localEvents');
  }, []);

  useEffect(() => {
    if (isReviewingProposals) {
      fetchData('events/proposals', setEventProposals, setLoading, 'eventProposals');
    }
  }, [isReviewingProposals]);
  
  const closeDialogs = () => {
    setAction(null);
    form.reset();
  };

  const handleFormSubmit = async (values: any) => {
    if (!action) return;

    setIsSubmitting(true);
    const { type, itemType, data } = action;
    const isEdit = type === 'edit';
    const method = isEdit ? 'PUT' : 'POST';
    
    const endpointMap: { [key: string]: string } = {
        'Road Disruption': 'disruptions',
        'Shop Notification': 'shops',
        'Park Status': 'parks',
        'Local Event': 'events',
    };
    const endpoint = endpointMap[itemType];
    const url = isEdit ? `http://localhost:3500/jiran-tetangga/v1/${endpoint}/${data._id}` : `http://localhost:3500/jiran-tetangga/v1/${endpoint}`;
    
    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'X-API-Key': 'jxdMegN9KOAZMwMCfIbV' },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${type} ${itemType}`);
        }

        toast({
            title: "Success!",
            description: `${itemType} has been successfully ${isEdit ? 'updated' : 'added'}.`,
        });

        // Refetch data
        if (itemType === 'Road Disruption') fetchData('disruptions', setRoadDisruptions, setLoading, 'roadDisruptions');
        if (itemType === 'Shop Notification') fetchData('shops', setShopNotifications, setLoading, 'shopNotifications');
        if (itemType === 'Park Status') fetchData('parks', setParkStatus, setLoading, 'parkStatus');
        if (itemType === 'Local Event') fetchData('events', setLocalEvents, setLoading, 'localEvents');

        closeDialogs();
    } catch (error: any) {
        console.error(`Error submitting form for ${itemType}:`, error);
        toast({
            variant: "destructive",
            title: "An error occurred.",
            description: error.message || `Could not ${type} the ${itemType}. Please try again.`,
        });
    } finally {
        setIsSubmitting(false);
    }
  };


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

  const renderSkeleton = (columns: number) =>
    Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <TableRow key={i}>
        <TableCell colSpan={columns}>
          <Skeleton className="h-8 w-full" />
        </TableCell>
      </TableRow>
  ));
    
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
  }, [search.roadDisruptions, sortConfig.roadDisruptions, roadDisruptions]);
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
      item.name.toLowerCase().includes(search.shopNotifications.toLowerCase()) ||
      item.description.toLowerCase().includes(search.shopNotifications.toLowerCase())
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
  }, [search.shopNotifications, sortConfig.shopNotifications, filters.shopNotifications, shopNotifications]);
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
      item.name.toLowerCase().includes(search.parkStatus.toLowerCase()) ||
      item.description.toLowerCase().includes(search.parkStatus.toLowerCase())
    );
    
    const { key, direction } = sortConfig.parkStatus;
    items.sort((a, b) => {
      const aValue = a[key as keyof typeof a] as string;
      const bValue = b[key as keyof typeof b] as string;
      return direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    return items;
  }, [search.parkStatus, sortConfig.parkStatus, filters.parkStatus, parkStatus]);
  const paginatedParkStatus = useMemo(() => {
    const startIndex = (currentPage.parkStatus - 1) * ITEMS_PER_PAGE;
    return filteredParkStatus.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredParkStatus, currentPage.parkStatus]);
  const totalParkStatusPages = Math.ceil(filteredParkStatus.length / ITEMS_PER_PAGE);

  const filteredLocalEvents = useMemo(() => {
    let items = localEvents.filter(item =>
      item.title.toLowerCase().includes(search.localEvents.toLowerCase())
    );

    const { key, direction } = sortConfig.localEvents;
    items.sort((a, b) => {
      const aValue = a[key as keyof typeof a] as any;
      const bValue = b[key as keyof typeof b] as any;
      if (key === 'date') {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      return direction === 'ascending' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
    });

    return items;
  }, [search.localEvents, sortConfig.localEvents, localEvents]);
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
  }, [search.eventProposals, sortConfig.eventProposals, eventProposals]);
  const paginatedEventProposals = useMemo(() => {
    const startIndex = (currentPage.eventProposals - 1) * ITEMS_PER_PAGE;
    return filteredEventProposals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEventProposals, currentPage.eventProposals]);
  const totalEventProposalPages = Math.ceil(filteredEventProposals.length / ITEMS_PER_PAGE);
  
  const renderForm = () => {
    if (!action || (action.type !== 'add' && action.type !== 'edit')) return null;

    const { itemType } = action;

    switch (itemType) {
      case 'Road Disruption':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title" data-speakable="true">Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" data-speakable="true">Description</Label>
              <Textarea id="description" {...form.register("description")} />
              {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message as string}</p>}
            </div>
             <div className="space-y-2">
                <Label data-speakable="true">Category</Label>
                <Controller
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="road-damage">Road Damage</SelectItem>
                            <SelectItem value="traffic-congestion">Traffic Congestion</SelectItem>
                            <SelectItem value="road-closure">Road Closure</SelectItem>
                        </SelectContent>
                    </Select>
                    )}
                />
                 {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message as string}</p>}
            </div>
          </>
        );
      case 'Shop Notification':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" data-speakable="true">Shop Name</Label>
              <Input id="name" {...form.register("name")} />
               {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" data-speakable="true">Description</Label>
              <Textarea id="description" {...form.register("description")} />
              {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label data-speakable="true">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="promo">Promo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
               {form.formState.errors.status && <p className="text-sm text-destructive">{form.formState.errors.status.message as string}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="opening" data-speakable="true">Opening Time (HHmm)</Label>
                    <Input id="opening" {...form.register("openingHours.opening")} />
                     {form.formState.errors.openingHours?.opening && <p className="text-sm text-destructive">{form.formState.errors.openingHours.opening.message as string}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="closing" data-speakable="true">Closing Time (HHmm)</Label>
                    <Input id="closing" {...form.register("openingHours.closing")} />
                    {form.formState.errors.openingHours?.closing && <p className="text-sm text-destructive">{form.formState.errors.openingHours.closing.message as string}</p>}
                </div>
            </div>
          </>
        );
        case 'Park Status':
            return (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" data-speakable="true">Park Name</Label>
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" data-speakable="true">Description</Label>
                  <Textarea id="description" {...form.register("description")} />
                   {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label data-speakable="true">Status</Label>
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.status && <p className="text-sm text-destructive">{form.formState.errors.status.message as string}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="opening" data-speakable="true">Opening Time (HHmm)</Label>
                        <Input id="opening" {...form.register("openingHours.opening")} />
                        {form.formState.errors.openingHours?.opening && <p className="text-sm text-destructive">{form.formState.errors.openingHours.opening.message as string}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="closing" data-speakable="true">Closing Time (HHmm)</Label>
                        <Input id="closing" {...form.register("openingHours.closing")} />
                         {form.formState.errors.openingHours?.closing && <p className="text-sm text-destructive">{form.formState.errors.openingHours.closing.message as string}</p>}
                    </div>
                </div>
              </>
            );
        case 'Local Event':
            return (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title" data-speakable="true">Event Title</Label>
                  <Input id="title" {...form.register("title")} />
                   {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" data-speakable="true">Description</Label>
                  <Textarea id="description" {...form.register("description")} />
                  {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message as string}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="location" data-speakable="true">Location</Label>
                  <Input id="location" {...form.register("location")} />
                   {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <Label data-speakable="true">Event Date</Label>
                    <Controller
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        )}
                    />
                     {form.formState.errors.eventDate && <p className="text-sm text-destructive">{form.formState.errors.eventDate.message as string}</p>}
                </div>
              </>
            );
      default:
        return <p>No form available for this item type.</p>;
    }
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
                  {loading.roadDisruptions ? renderSkeleton(3) :
                  paginatedRoadDisruptions.length > 0 ? paginatedRoadDisruptions.map((item) => (
                    <TableRow key={item._id}>
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
                       <Button variant="ghost" onClick={() => handleSort('shopNotifications', 'name')} data-speakable="true">
                         Name
                         <SortArrow table="shopNotifications" columnKey="name" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('shopNotifications', 'description')} data-speakable="true">
                         Description
                         <SortArrow table="shopNotifications" columnKey="description" />
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
                   {loading.shopNotifications ? renderSkeleton(4) : 
                   paginatedShopNotifications.length > 0 ? paginatedShopNotifications.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium" data-speakable="true">{item.name}</TableCell>
                      <TableCell data-speakable="true">{item.description}</TableCell>
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
                    {['open', 'closed', 'maintenance'].map((status) => (
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
                       <Button variant="ghost" onClick={() => handleSort('parkStatus', 'name')} data-speakable="true">
                         Park
                         <SortArrow table="parkStatus" columnKey="name" />
                       </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('parkStatus', 'description')} data-speakable="true">
                         Message
                         <SortArrow table="parkStatus" columnKey="description" />
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
                  {loading.parkStatus ? renderSkeleton(4) : 
                  paginatedParkStatus.length > 0 ? paginatedParkStatus.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium" data-speakable="true">{item.name}</TableCell>
                      <TableCell data-speakable="true">{item.description}</TableCell>
                      <TableCell>
                        <Badge data-speakable="true" variant={item.status === 'open' ? 'default' : item.status === 'maintenance' ? 'secondary' : 'destructive'} className={item.status === 'open' ? 'bg-green-600' : item.status === 'maintenance' ? 'bg-yellow-500' : ''}>
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
                       <Button variant="ghost" onClick={() => handleSort('localEvents', 'location')} data-speakable="true">
                         Location
                         <SortArrow table="localEvents" columnKey="location" />
                       </Button>
                    </TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.localEvents ? renderSkeleton(4) :
                  paginatedLocalEvents.length > 0 ? paginatedLocalEvents.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{format(item.date, 'PPP')}</TableCell>
                      <TableCell data-speakable="true">{item.location}</TableCell>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle data-speakable="true">
              {action?.type === 'add' ? 'Add New' : 'Edit'} {action?.itemType}
            </DialogTitle>
            <DialogDescription data-speakable="true">
              Make changes here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 py-4">
              {renderForm()}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={closeDialogs} type="button">Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
          </form>
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
              {loading.eventProposals ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                ))
               ) : paginatedEventProposals.length > 0 ? paginatedEventProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <CardTitle data-speakable="true">{proposal.eventName}</CardTitle>
                    <CardDescription data-speakable="true">Proposed by: {proposal.organizerName} ({proposal.organizerEmail})</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p data-speakable="true"><span className="font-semibold">Proposed Date:</span> {format(proposal.eventDate, "PPP")}</p>
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

    