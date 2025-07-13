
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
import { format, parse, subDays, isSameDay, formatDistanceToNow } from "date-fns";
import { Calendar as CalendarIcon, CalendarDays, Eye, PenSquare, Store, Trees, TrafficCone, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard-card";
import { AppHeader } from "@/components/header";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export default function Home() {
  const [selectedImageData, setSelectedImageData] = useState<{ src: string; alt: string; hint: string } | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsContent, setDetailsContent] = useState<{ title: string; description: string; content: React.ReactNode } | null>(null);
  const [roadDisruptionDate, setRoadDisruptionDate] = useState<Date | undefined>(new Date());
  const [eventsDate, setEventDate] = useState<Date | undefined>(new Date());
  
  type RoadDisruption = { 
    id: string; 
    title: string;
    description: string; 
    date: Date;
    category: string;
    status: boolean;
  };

  type Events = { 
    id: string; 
    title: string;
    description: string; 
    date: Date;
    location: string;
    status: boolean;
  };

  type ShopNotification = { 
    id: string; 
    name: string; 
    description: string; 
    opening: Date;
    closing: Date;
    status: string; 
    image: string; 
    hint: string
  };

  type ParkStatus = { 
    id: string; 
    name: string; 
    description: string
    opening: string;
    closing: string;
    status: string; 
    image: string; 
    hint: string
  };
  
  const [roadDisruptions, setRoadDisruptions] = useState<RoadDisruption[]>([]);
  const [loadingDisruptions, setLoadingDisruptions] = useState(true);

  const [localEvents, setEvents] = useState<Events[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [parkStatus, setParkStatus] = useState<ParkStatus[]>([]);
  const [loadingParkStatus, setLoadingParkStatus] = useState(true);

  const [shopNotifications, setShopNotifications] = useState<ShopNotification[]>([]);
  const [loadingShopNotifications, setLoadingShopNotifications] = useState(true);

  // Fetch Disruptions API
  useEffect(() => {
    const fetchDisruptions = async () => {
      setLoadingDisruptions(true);
      try {
        const disruptionsData = await api.get('/disruptions');
        console.log('Disruptions API data:', disruptionsData.data);

        const formattedDisruptions = disruptionsData.data
        .filter((post: any) => post.status === true)
        .map((post: any) => ({
          id: post._id,
          title: post.title,
          description: post.description,
          date: new Date(post.createdAt),
          category: post.category,
          status: post.status,
        }));
        setRoadDisruptions(formattedDisruptions);

      } catch (error) {
        console.error("Error fetching road disruptions:", error);
      } finally {
        setLoadingDisruptions(false);
      }
    };

    fetchDisruptions();
  }, []);

  // Fetch Shops API
  useEffect(() => {
    const fetchShopNotifications = async () => {
      setLoadingShopNotifications(true);
      try {
        const shopsData = await api.get('/shops');
        console.log('Shops API data:', shopsData.data);

        const formattedShops = shopsData.data
        .map((post: any) => ({
          id: post._id,
          name: post.name,
          description: post.description,
          opening: format(parse(post.openingHours.opening, 'HHmm', new Date()), 'hh:mm a'),
          closing: format(parse(post.openingHours.closing, 'HHmm', new Date()), 'hh:mm a'),
          status: post.status,
          image: `https://placehold.co/600x400.png?text=${post.name.replace(/\s+/g, '+')}`,
          hint: 'shop',
        }));
        setShopNotifications(formattedShops);
      } catch (error) {
        console.error("Error fetching shop notifications:", error);
      } finally {
        setLoadingShopNotifications(false);
      }
    };
    fetchShopNotifications();
  }, []);

  // Fetch Parks API
  useEffect(() => {
    const fetchParkStatus = async () => {
      setLoadingParkStatus(true);
      try {
        const parksData = await api.get('/parks');
        const formattedData = parksData.data
        .map((park: any) => ({
          id: park._id,
          name: park.name,
          description: park.description,
          opening: format(parse(park.openingHours.opening, 'HHmm', new Date()), 'hh:mm a'),
          closing: format(parse(park.openingHours.closing, 'HHmm', new Date()), 'hh:mm a'),
          status: park.status,
          image: `https://placehold.co/600x400.png?text=${park.name.replace(/\s+/g, '+')}`,
          hint: 'park',
        }));
        setParkStatus(formattedData);
      } catch (error) {
        console.error("Error fetching park status:", error);
      } finally {
        setLoadingParkStatus(false);
      }
    };
    fetchParkStatus();
  }, []);

  // Fetch Events API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingDisruptions(true);
      setLoadingEvents(true);
      try {
        const eventsData = await api.get('/events');
        console.log('Events API data:', eventsData.data);

        const formattedEvents = eventsData.data.map((event: any) => ({
          id: event._id,
          title: event.title,
          date: new Date(event.eventDate),
          location: event.location,
          description: event.description,
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Road Disruption date filer
  const filteredRoadDisruptions = useMemo(() => {
    if (!roadDisruptionDate) return [];
    return roadDisruptions.filter((disruption) =>
      isSameDay(disruption.date, roadDisruptionDate)
    );
  }, [roadDisruptions, roadDisruptionDate]);

  // Events date filter
  const filteredEvents = useMemo(() => {
    if (!eventsDate) return [];
    return localEvents.filter((event) =>
      isSameDay(event.date, eventsDate)
    );
  }, [localEvents, eventsDate]);

  const handleViewImage = (src: string, alt: string, hint: string) => {
    setSelectedImageData({ src, alt, hint });
    setImageDialogOpen(true);
  };

  const handleSeeMore = (title: string, description: string, content: React.ReactNode) => {
    setDetailsContent({ title, description, content });
    setDetailsOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedImageData?.alt || 'Image Preview'}</DialogTitle>
            </DialogHeader>
            {selectedImageData && (
              <Image
                src={selectedImageData.src}
                alt="Sample Image"
                width={800}
                height={600}
                className="rounded-md object-cover"
                data-ai-hint={selectedImageData.hint}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle data-speakable="true">{detailsContent?.title}</DialogTitle>
              <DialogDescription data-speakable="true">{detailsContent?.description}</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {detailsContent?.content}
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Road Disruptions Dashboard */}
          <DashboardCard
            title="Road Disruptions"
            icon={<TrafficCone className="h-6 w-6 text-destructive" />}
            description="Latest updates on traffic and road closures."
            onSeeMore={() => handleSeeMore(
              "All Road Disruptions",
              "Here are all the recent road disruptions from the past 7 days.",
              <ul className="space-y-4">
                {loadingDisruptions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : roadDisruptions.length > 0 ? (
                  roadDisruptions.map((disruption: RoadDisruption) => (
                    <li key={disruption.id} className="flex items-start justify-between rounded-md border p-4" data-speakable="true">
                        <span className="text-sm font-medium">{disruption.description}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{format(disruption.date, "PPP")}</span>
                    </li>
                  ))
                ) : (
                  <p data-speakable="true">No available data.</p>
                )}
              </ul>
            )}
          >
            <div className="flex flex-col gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !roadDisruptionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {roadDisruptionDate ? format(roadDisruptionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={roadDisruptionDate}
                    onSelect={setRoadDisruptionDate}
                    initialFocus
                    disabled={(date) =>
                      date > new Date() || date < subDays(new Date(), 7)
                    }
                  />
                </PopoverContent>
              </Popover>
              <ul className="space-y-4 rounded-md bg-destructive/10 p-4 min-h-[100px]">
                {loadingDisruptions ? (
                   <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : filteredRoadDisruptions.length > 0 ? (
                  filteredRoadDisruptions.map((disruption: RoadDisruption) => (
                    <li key={disruption.id} className="flex items-start justify-between" data-speakable="true">
                        <span className="text-sm font-medium">{disruption.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(disruption.date, { addSuffix: true })}
                        </span>
                    </li>
                  ))
                ) : (
                  <p data-speakable="true">No disruptions reported for this day.</p>
                )}
              </ul>
            </div>
          </DashboardCard>

          {/* Shops Dashboard */}
          <DashboardCard
            title="Shop Notifications"
            icon={<Store className="h-6 w-6 text-primary" />}
            description="News about local businesses."
            onSeeMore={() => handleSeeMore(
              "All Shop Notifications",
              "Here are all the recent notifications about local shops.",
              <ul className="space-y-4">
                {loadingShopNotifications ? (
                   <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : shopNotifications.length > 0 ? (shopNotifications.map((item) => (
                  <li key={item.id} className="flex flex-col rounded-md border p-4" data-speakable="true">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm">{item.opening.toString()} - {item.closing.toString()}</span>
                        <Badge variant={item.status === 'new' ? 'default' : 'destructive'} className={item.status === 'new' ? 'bg-green-600' : ''}>
                          {item.status}
                        </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </li>
                ))) : (
                   <p data-speakable="true">No available data.</p>
                )}
              </ul>
            )}
          >
            {loadingShopNotifications ? (
              <div className="space-y-2">
               <Skeleton className="h-4 w-full" />
             </div>) : shopNotifications.length > 0 ? (
             <ul className="space-y-4">
              {shopNotifications.slice(0, 3).map((item) => (
                <li key={item.id} className="flex flex-col" data-speakable="true">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm">{item.opening.toString()} to {item.closing.toString()}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'new' ? 'default' : 'destructive'} className={item.status === 'new' ? 'bg-green-600' : ''}>
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewImage(item.image, item.name, item.hint)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </li>
              ))}
            </ul>
            ) : (
              <p data-speakable="true">No recent shop notifications.</p>
            )}          
          </DashboardCard>
          
          {/* Park Status Dashboard */}
          <DashboardCard
            title="Park Status"
            icon={<Trees className="h-6 w-6 text-green-600" />}
            description="Condition and availability of local parks."
            onSeeMore={() => handleSeeMore(
              "All Park Statuses",
              "Here are the latest statuses for all local parks.",
              <ul className="space-y-4">
                {loadingParkStatus ? (
                   <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : parkStatus.length > 0 ? (parkStatus.map((park) => (
                  <li key={park.id} className="rounded-md border p-4" data-speakable="true">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{park.name}</span>
                       <Badge
                          variant={
                            park.status === 'open'
                              ? 'default'
                              : park.status === 'maintenance'
                              ? 'secondary'
                              : 'outline' // For 'closed' or others
                          }
                          className={
                            park.status === 'open'
                              ? 'bg-green-600'
                              : park.status === 'maintenance'
                              ? 'bg-yellow-500'
                              : 'bg-red-600'
                          }
                        >
                          {park.status}
                        </Badge>
                    </div>
                    <div>
                      <p className="text-sm">{park.description}</p>
                      <span className="mt-2 flex items-center gap-2 text-sm">
                        <Clock className="w-4 text-muted-foreground" />
                        {park.opening === '12:00 AM' && park.closing === '12:00 AM'
                        ? '24 Hours'
                        : `${park.opening} to ${park.closing}`}
                      </span>
                    </div>
                  </li>
                ))) : (
                   <p data-speakable="true">No available data.</p>
                )}
              </ul>
            )}
          >
            {loadingParkStatus ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
              </div>) : parkStatus.length > 0 ? (
            <ul className="space-y-4">
              {parkStatus.slice(0, 3).map((park) => (
                <li key={park.id} data-speakable="true">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">{park.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            park.status === 'open'
                              ? 'default'
                              : park.status === 'maintenance'
                              ? 'secondary'
                              : 'outline'
                          }
                          className={
                            park.status === 'open'
                              ? 'bg-green-600'
                              : park.status === 'maintenance'
                              ? 'bg-yellow-500'
                              : 'bg-red-600'
                          }
                        >
                          {park.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewImage(park.image, park.name, park.hint)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                   </div>
                    <div>
                      <span className="mt-1 flex items-center gap-2 text-sm">
                        <Clock className="w-4 text-muted-foreground" />
                        {park.opening === '12:00 AM' && park.closing === '12:00 AM'
                        ? '24 Hours'
                        : `${park.opening} to ${park.closing}`}
                      </span>
                    </div>
                </li>
              ))}
            </ul>) : (
               <p data-speakable="true">No recent park status updates.</p>
            )}
          </DashboardCard>
          
          {/* Local Events Dashboard */}
          <DashboardCard
            title="Local Events"
            icon={<CalendarDays className="h-6 w-6 text-primary" />}
            description="Upcoming community events and ceremonies."
            onSeeMore={() => handleSeeMore(
              "All Local Events",
              "Here are all upcoming community events. Click the view icon for more details.",
              <ul className="space-y-4">
                {loadingEvents ? (
                   <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : localEvents.length > 0 ? 
                (localEvents.map((event: Events) => (
                   <li key={event.id} className="flex items-center justify-between rounded-md border p-4" data-speakable="true">
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{format(event.date, "PPP")}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSeeMore(
                      event.title,
                      `Event Details`,
                      <div className="space-y-2" data-speakable="true">
                        <p className="text-sm">{event.description}</p>
                        <p className="text-sm"><span className="font-semibold">Location:</span> {event.location}</p>
                        <p className="text-sm"><span className="font-semibold">Date:</span> {format(event.date, "PPP")}</p>
                      </div>
                    )}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </li>
                ))
                ) : (<p data-speakable="true">No available data.</p>
                )}
              </ul>

            )}
          >
            <div className="flex flex-col gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventsDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventsDate ? format(eventsDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventsDate}
                    onSelect={setEventDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {loadingEvents ? (
                 <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                </div>
                ) : filteredEvents.length > 0 ? (
               <ul className="space-y-4">
                {filteredEvents.slice(0, 2).map((event) => (
                  <li key={event.id} className="flex items-center justify-between" data-speakable="true">
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{format(event.date, "PPP")}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSeeMore(
                      event.title,
                      `Event Details`,
                      <div className="space-y-2" data-speakable="true">
                        <p className="text-sm">{event.description}</p>
                        <p className="text-sm"><span className="font-semibold">Location:</span> {event.location}</p>
                        <p className="text-sm"><span className="font-semibold">Date:</span> {format(event.date, "PPP")}</p>
                      </div>
                    )}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>) : (
                 <p data-speakable="true">No upcoming events on this date.</p>
              )}
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}
