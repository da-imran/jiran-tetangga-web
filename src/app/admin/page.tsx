

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Bell, Pencil, PlusCircle, Trash2, ArrowUpDown, ChevronDown, CalendarIcon, Check, X, ShieldQuestion, AlertTriangle } from "lucide-react";
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
import { formatDistanceToNow, parse } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { DateValue, parseDate, getLocalTimeZone, today } from "@internationalized/date";

// Schemas for form validation
const roadDisruptionSchema = z.object({
  title: z.string().min(5, "Title is required."),
  description: z.string().min(2, "Description is required."),
  status: z.enum(["active",'inactive']),
});

const shopNotificationSchema = z.object({
  name: z.string().min(3, "Shop name is required."),
  description: z.string().min(2, "Description is required."),
  status: z.enum(["open", "closed", "maintenance"]),
  openingHours: z.object({
    opening: z.string().regex(/^\d{4}$/, "Opening time must be in HHmm format."),
    closing: z.string().regex(/^\d{4}$/, "Closing time must be in HHmm format."),
  }),
});

const parkStatusSchema = z.object({
  name: z.string().min(3, "Park name is required."),
  description: z.string().min(2, "Description is required."),
  status: z.enum(["open", "closed", "maintenance"]),
   openingHours: z.object({
    opening: z.string().regex(/^\d{4}$/, "Opening time must be in HHmm format."),
    closing: z.string().regex(/^\d{4}$/, "Closing time must be in HHmm format."),
  }),
});

const localEventSchema = z.object({
  title: z.string().min(5, "Event title is required."),
  description: z.string().min(2, "Description is required."),
  location: z.string().min(3, "Location is required."),
  eventDate: z.any().refine(val => val, { message: "Event date is required."}),
  status: z.enum(['pending', 'approved', 'rejected']),
});

const reportSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

const formSchemas = {
  'Road Disruption': roadDisruptionSchema,
  'Shop Notification': shopNotificationSchema,
  'Park Status': parkStatusSchema,
  'Local Event': localEventSchema,
  'Report': reportSchema,
};


const ITEMS_PER_PAGE = 5;
type SortDirection = "ascending" | "descending";
interface SortConfig {
  key: string;
  direction: SortDirection;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [action, setAction] = useState<{ type: 'add' | 'edit' | 'delete', itemType: string, data?: any } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: action ? zodResolver(formSchemas[action.itemType as keyof typeof formSchemas]) : undefined,
    defaultValues: {}
  });

  useEffect(() => {
    if (action?.type === 'edit' && action.data) {
      const itemType = action.itemType;
      let defaultValues = { ...action.data };
       if (itemType === 'Local Event' && action.data.eventDate) {
        try {
          defaultValues.eventDate = parseDate(action.data.eventDate.split('T')[0]);
        } catch(e) {
          console.error("Error parsing date for edit:", e);
          defaultValues.eventDate = null;
        }
      }
      form.reset(defaultValues);
    } else if (action?.type === 'add') {
      form.reset({});
    } else if (action?.type === 'delete' && action.data) {

    }
  }, [action, form]);


  const [roadDisruptions, setRoadDisruptions] = useState<any[]>([]);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [shopNotifications, setShopNotifications] = useState<any[]>([]);
  const [parkStatus, setParkStatus] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const [totalItems, setTotalItems] = useState({
    roadDisruptions: 0,
    shopNotifications: 0,
    parkStatus: 0,
    localEvents: 0,
    reports: 0,
  });

  const [loading, setLoading] = useState({
    roadDisruptions: true,
    shopNotifications: true,
    parkStatus: true,
    localEvents: true,
    reports: true,
  });

  const [search, setSearch] = useState({
    roadDisruptions: "",
    shopNotifications: "",
    parkStatus: "",
    localEvents: "",
    reports: "",
  });

  const [currentPage, setCurrentPage] = useState({
    roadDisruptions: 1,
    shopNotifications: 1,
    parkStatus: 1,
    localEvents: 1,
    reports: 1,
  });

  const [sortConfig, setSortConfig] = useState<{ [key: string]: SortConfig }>({
    roadDisruptions: { key: 'date', direction: 'descending' },
    shopNotifications: { key: 'name', direction: 'ascending' },
    parkStatus: { key: 'name', direction: 'ascending' },
    localEvents: { key: 'title', direction: 'ascending' },
    reports: { key: 'createdAt', direction: 'descending' },
  });

  const [filters, setFilters] = useState<{ [key: string]: string[] }>({
    shopNotifications: [],
    parkStatus: [],
    localEvents: [],
    reports: [],
  });

  const fetchData = useCallback(async (
    endpoint: string, 
    setData: Function, 
    setLoadingState: Function, 
    setTotal: Function,
    dataKey: keyof typeof currentPage
  ) => {
    setLoadingState((prev: any) => ({ ...prev, [dataKey]: true }));
    try {
       const params = {
          pageNumber: currentPage[dataKey],
          dataPerPage: ITEMS_PER_PAGE,
          search: search[dataKey],
          sort: sortConfig[dataKey].key,
          order: sortConfig[dataKey].direction === 'ascending' ? 'asc' : 'desc',
          filters: filters[dataKey as keyof typeof filters]?.join(','),
        };
        const result = await api.get(`/${endpoint}`, { params });
        let processedData = result.data;

        if (dataKey === 'roadDisruptions') {
            processedData = result.data.map((item: any) => ({ ...item, date: new Date(item.createdAt) }));
        } else if (dataKey === 'reports') {
            processedData = result.data.map((item: any) => ({ ...item, createdAt: new Date(item.createdAt) }));
        } else if (dataKey === 'localEvents') {
            processedData = result.data.map((item: any) => ({ ...item, date: new Date(item.eventDate) }));
        }

        setData(processedData);
        setTotal((prev: any) => ({ ...prev, [dataKey]: result.data.total }));
    } catch (error) {
        console.error(`Error fetching ${dataKey}:`, error);
        toast({
          variant: "destructive",
          title: `Failed to fetch ${dataKey}`,
          description: "Please check the API connection and try again.",
        })
        setData([]);
    } finally {
        setLoadingState((prev: any) => ({ ...prev, [dataKey]: false }));
    }
  }, [currentPage, search, sortConfig, filters, toast]);

  useEffect(() => {
    fetchData('disruptions', setRoadDisruptions, setLoading, setTotalItems, 'roadDisruptions');
  }, [currentPage.roadDisruptions, search.roadDisruptions, sortConfig.roadDisruptions, fetchData]);

  useEffect(() => {
    fetchData('shops', setShopNotifications, setLoading, setTotalItems, 'shopNotifications');
  }, [currentPage.shopNotifications, search.shopNotifications, sortConfig.shopNotifications, filters.shopNotifications, fetchData]);
  
  useEffect(() => {
    fetchData('parks', setParkStatus, setLoading, setTotalItems, 'parkStatus');
  }, [currentPage.parkStatus, search.parkStatus, sortConfig.parkStatus, filters.parkStatus, fetchData]);
  
  useEffect(() => {
    fetchData('events', setLocalEvents, setLoading, setTotalItems, 'localEvents');
  }, [currentPage.localEvents, search.localEvents, sortConfig.localEvents, filters.localEvents, fetchData]);

  useEffect(() => {
    fetchData('reports', setReports, setLoading, setTotalItems, 'reports');
  }, [currentPage.reports, search.reports, sortConfig.reports, filters.reports, fetchData]);
  
  const closeDialogs = () => {
    setAction(null);
    form.reset({});
  };

  const handleFormSubmit = async (values: any) => {
    if (!action) return;

    setIsSubmitting(true);
    const { type, itemType, data } = action;
    const isEdit = type === 'edit';
    const adminUser = localStorage.getItem('adminUser');

    let payload = { ...values, adminId: adminUser };
    if (itemType === 'Local Event' && payload.eventDate && typeof payload.eventDate.toDate === 'function') {
      payload.eventDate = payload.eventDate.toDate(getLocalTimeZone()).toISOString();
    }
    
    const endpointMap: { [key: string]: string } = {
        'Road Disruption': 'disruptions',
        'Shop Notification': 'shops',
        'Park Status': 'parks',
        'Local Event': 'events',
        'Report': 'reports',
    };

    type ApiOptions = Omit<RequestInit, 'body'> & {
      params?: Record<string, any>;
      pathParams?: Record<string, string | number>;
      body?: any;
    };
    
    const endpoint = endpointMap[itemType];

    let url = `/${endpoint}`;
    const method = isEdit ? 'patch' : 'post';
    
    if (isEdit && data?._id) {
      url = `${url}/${data._id}`;
    }
    try {
        const response = await api[method](url, payload); // Pass params here
        toast({
            title: "Success!",
            description: `${itemType} has been successfully ${isEdit ? 'updated' : 'added'}.`,
        });

        // Refetch data
        if (itemType === 'Road Disruption') fetchData('disruptions', setRoadDisruptions, setLoading, setTotalItems, 'roadDisruptions');
        if (itemType === 'Shop Notification') fetchData('shops', setShopNotifications, setLoading, setTotalItems, 'shopNotifications');
        if (itemType === 'Park Status') fetchData('parks', setParkStatus, setLoading, setTotalItems, 'parkStatus');
        if (itemType === 'Local Event') fetchData('events', setLocalEvents, setLoading, setTotalItems, 'localEvents');
        if (itemType === 'Report') fetchData('reports', setReports, setLoading, setTotalItems, 'reports');

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

  const handleDelete = async () => {
    if (!action || !action.data) return;

    setIsSubmitting(true);
    const { itemType, data } = action;

    const endpointMap: { [key: string]: string } = {
        'Road Disruption': 'disruptions',
        'Shop Notification': 'shops',
        'Park Status': 'parks',
        'Local Event': 'events',
        'Report': 'reports',
    };

    const endpoint = endpointMap[itemType];

    // Determine the URL and params based on item type
    const url = `/${endpoint}/${data._id}`;

    try {
       await api.delete(url);

        toast({
            title: "Success!",
            description: `${itemType} has been successfully deleted.`,
        });

        // Refetch data after successful deletion
        if (itemType === 'Road Disruption') fetchData('disruptions', setRoadDisruptions, setLoading, setTotalItems, 'roadDisruptions');
        if (itemType === 'Shop Notification') fetchData('shops', setShopNotifications, setLoading, setTotalItems, 'shopNotifications');
        if (itemType === 'Park Status') fetchData('parks', setParkStatus, setLoading, setTotalItems, 'parkStatus');
        if (itemType === 'Local Event') fetchData('events', setLocalEvents, setLoading, setTotalItems, 'localEvents');
        if (itemType === 'Report') fetchData('reports', setReports, setLoading, setTotalItems, 'reports');

        closeDialogs(); // Close the dialog after deletion
    } catch (error: any) {
        console.error(`Error deleting ${itemType}:`, error);
        toast({
            variant: "destructive",
            title: "An error occurred.",
            description: error.message || `Could not delete the ${itemType}. Please try again.`,
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

  const totalRoadDisruptionPages = Math.ceil(totalItems.roadDisruptions / ITEMS_PER_PAGE);
  const totalShopNotificationPages = Math.ceil(totalItems.shopNotifications / ITEMS_PER_PAGE);
  const totalParkStatusPages = Math.ceil(totalItems.parkStatus / ITEMS_PER_PAGE);
  const totalLocalEventPages = Math.ceil(totalItems.localEvents / ITEMS_PER_PAGE);
  const totalReportPages = Math.ceil(totalItems.reports / ITEMS_PER_PAGE);

  const renderForm = () => {
    if (!action || (action.type !== 'add' && action.type !== 'edit')) return null;

    const { itemType, data } = action;
    const isReadOnly = (itemType === 'Local Event' && data?.status === 'rejected') || (itemType === 'Report' && data?.status === 'rejected');

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
              <Label data-speakable="true">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && <p className="text-sm text-destructive">{form.formState.errors.status.message as string}</p>}
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
                <Input id="title" {...form.register("title")} readOnly={isReadOnly}/>
                  {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" data-speakable="true">Description</Label>
                <Textarea id="description" {...form.register("description")} readOnly={isReadOnly}/>
                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message as string}</p>}
              </div>
                <div className="space-y-2">
                <Label htmlFor="location" data-speakable="true">Location</Label>
                <Input id="location" {...form.register("location")} readOnly={isReadOnly}/>
                  {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message as string}</p>}
              </div>
              <div className="space-y-2">
                  <Label data-speakable="true">Event Date</Label>
                    <Controller
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild disabled={isReadOnly}>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? field.value.toString() : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              aria-label="Event date"
                              value={field.value as DateValue | undefined}
                              onChange={field.onChange}
                              minValue={today(getLocalTimeZone())}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {form.formState.errors.eventDate && <p className="text-sm text-destructive">{form.formState.errors.eventDate.message as string}</p>}
              </div>
               <div className="space-y-2">
                  <Label data-speakable="true">Status</Label>
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                        <SelectTrigger className="capitalize">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
            </>
          );
      case 'Report':
        return (
          <>
            <div className="space-y-2">
              <Label data-speakable="true">Category</Label>
              <Input readOnly defaultValue={data.category} disabled={true}/>
            </div>
            <div className="space-y-2">
              <Label data-speakable="true">Location</Label>
              <Input readOnly defaultValue={data.location} disabled={true}/>
            </div>
            <div className="space-y-2">
              <Label data-speakable="true">Description</Label>
              <Textarea readOnly defaultValue={data.description} disabled={true}/>
            </div>
            <div className="space-y-2">
              <Label data-speakable="true">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && <p className="text-sm text-destructive">{form.formState.errors.status.message as string}</p>}
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
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('roadDisruptions', 'status')} data-speakable="true">
                         Status
                         <SortArrow table="roadDisruptions" columnKey="status" />
                       </Button>
                    </TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.roadDisruptions ? renderSkeleton(4) :
                  roadDisruptions.length > 0 ? roadDisruptions.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{formatDistanceToNow(item.date, { addSuffix: true })}</TableCell>
                      <TableCell>
                        <Badge data-speakable="true" variant={item.status === 'active' ? 'default' : 'destructive' } className={item.status === 'active' ? 'bg-green-600' :''}>
                          {item.status}
                        </Badge>
                      </TableCell>
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
                        <TableCell colSpan={4} className="text-center h-24">No results found.</TableCell>
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
                    {['open', 'closed', 'maintenance'].map((status) => (
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
                   shopNotifications.length > 0 ? shopNotifications.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium" data-speakable="true">{item.name}</TableCell>
                      <TableCell data-speakable="true">{item.description}</TableCell>
                      <TableCell>
                        <Badge data-speakable="true" variant={item.status === 'open' ? 'default' : item.status === 'maintenance' ? 'secondary' : 'destructive'} className={item.status === 'open' ? 'bg-green-600' : item.status === 'maintenance' ? 'bg-yellow-500' : ''}>
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
                  parkStatus.length > 0 ? parkStatus.map((item) => (
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        Status <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {['approved', 'pending', 'rejected'].map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          className="capitalize"
                          checked={filters.localEvents.includes(status)}
                          onCheckedChange={() => handleFilterChange('localEvents', status)}
                        >
                          {status}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                     <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('localEvents', 'status')} data-speakable="true">
                         Status
                         <SortArrow table="localEvents" columnKey="status" />
                       </Button>
                    </TableHead>
                    <TableHead className="text-right" data-speakable="true">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.localEvents ? renderSkeleton(5) :
                  localEvents.length > 0 ? localEvents.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium" data-speakable="true">{item.title}</TableCell>
                      <TableCell data-speakable="true">{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell data-speakable="true">{item.location}</TableCell>
                       <TableCell>
                        <Badge
                          variant={
                            item.status === 'approved' ? 'default' :
                            item.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                          className={cn(
                            'capitalize',
                            item.status === 'approved' && 'bg-green-600',
                            item.status === 'pending' && 'bg-yellow-500',
                          )}
                          data-speakable="true"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
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
                        <TableCell colSpan={5} className="text-center h-24">No results found.</TableCell>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle data-speakable="true">Issue Reports</CardTitle>
                <CardDescription data-speakable="true">
                  Manage all user-submitted issue reports.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search reports..."
                  value={search.reports}
                  onChange={(e) => handleSearch('reports', e.target.value)}
                  className="w-full sm:w-auto"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {['pending', 'approved', 'rejected'].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        className="capitalize"
                        checked={filters.reports.includes(status)}
                        onCheckedChange={() => handleFilterChange('reports', status)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('reports', 'category')}>
                        Category
                        <SortArrow table="reports" columnKey="category" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('reports', 'description')}>
                        Description
                        <SortArrow table="reports" columnKey="description" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('reports', 'location')}>
                        Location
                        <SortArrow table="reports" columnKey="location" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('reports', 'createdAt')}>
                        Date
                        <SortArrow table="reports" columnKey="createdAt" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('reports', 'status')}>
                        Status
                        <SortArrow table="reports" columnKey="status" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.reports ? renderSkeleton(5) :
                  reports.length > 0 ? reports.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium capitalize">{item.category.replace(/-/g, ' ')}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                         <Badge
                          variant={
                            item.status === 'approved' ? 'default' :
                            item.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                          className={cn(
                            'capitalize',
                            item.status === 'approved' && 'bg-green-600',
                            item.status === 'pending' && 'bg-yellow-500',
                          )}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleAction('edit', 'Report', item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAction('delete', 'Report', item)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No reports found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
               <span className="text-sm text-muted-foreground">
                Page {currentPage.reports} of {totalReportPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('reports', currentPage.reports - 1)}
                  disabled={currentPage.reports <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('reports', currentPage.reports + 1)}
                  disabled={currentPage.reports >= totalReportPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      {/* Dialog for Add/Edit */}
      <Dialog open={action?.type === 'add' || action?.type === 'edit'} onOpenChange={(open) => !open && closeDialogs()}>
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
                {(action?.itemType === 'Local Event' && action.data?.status === 'rejected') || (action?.itemType === 'Report' && action.data?.status === 'rejected') ? (
                    <Button variant="outline" onClick={closeDialogs} type="button">Close</Button>
                ) : (
                    <>
                    <Button variant="outline" onClick={closeDialogs} type="button">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    </>
                )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* AlertDialog for Delete */}
      <AlertDialog open={action?.type === 'delete'} onOpenChange={(open) => !open && closeDialogs()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-speakable="true">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription data-speakable="true">
              This action cannot be undone. This will permanently delete this {action?.itemType?.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialogs}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}