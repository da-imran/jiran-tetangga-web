
"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import { format } from "date-fns";
import { Calendar as CalendarIcon, CalendarDays, Eye, PenSquare, Store, Trees, TrafficCone } from "lucide-react";
import axios from 'axios';

import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard-card";
import { AppHeader } from "@/components/header";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EventRegistrationForm } from "@/components/event-registration-form";

// const roadDisruptions = [
//   { id: 1, title: "Jalan Cenderai Water Pipe Burst", time: "2 hours ago" },
//   { id: 2, title: "Accident near Taman Rinting exit", time: "5 hours ago" },
//   { id: 3, title: "Roadworks on Jalan Merbuk until 5 PM", time: "8 hours ago" },
//   { id: 4, title: "Fallen tree on Jalan Delima", time: "1 day ago" },
// ];

const localEvents = [
  { id: 1, title: "Community Gotong-Royong", date: "28 July 2024", time: "8:00 AM", description: "Join us for a community clean-up event. Let's make our neighborhood cleaner and greener together. Gloves and trash bags will be provided." },
  { id: 2, title: "Weekly Pasar Malam", date: "Every Friday", time: "5:00 PM - 10:00 PM", description: "The weekly night market is back! Enjoy a variety of local street food, fresh produce, and unique goods. A great place for the whole family." },
  { id: 3, title: "Sungai Tiram Fun Run", date: "15 August 2024", time: "7:00 AM", description: "Get your running shoes ready for a 5km fun run around Sungai Tiram. T-shirts and medals for all participants. Register now!" },
];

const shopNotifications = [
  { id: 1, title: "New Bakery 'Roti Sedap' now open!", location: "Lot 23, Jalan Nuri", status: "new", image: "https://placehold.co/600x400.png", hint: "bakery bread" },
  { id: 2, title: "Kedai Runcit Ah Meng has closed", location: "No. 12, Jalan Merpati", status: "closed", image: "https://placehold.co/600x400.png", hint: "convenience store" },
  { id: 3, title: "Grand Opening: Bubble Tea Shop", location: "Near 7-Eleven", status: "new", image: "https://placehold.co/600x400.png", hint: "bubble tea" },
];

const parkStatus = [
  { id: 1, park: "Taman Permainan Utama", status: "open", message: "Playground swings repaired.", image: "https://placehold.co/600x400.png", hint: "playground park" },
  { id: 2, park: "Taman Rekreasi Sungai Tiram", status: "partial", message: "Jogging track closed for maintenance.", image: "https://placehold.co/600x400.png", hint: "jogging track" },
  { id: 3, park: "Laman Komuniti", status: "open", message: "All facilities are operational.", image: "https://placehold.co/600x400.png", hint: "community garden" },
];

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedImageData, setSelectedImageData] = useState<{ src: string; alt: string; hint: string } | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsContent, setDetailsContent] = useState<{ title: string; description: string; content: React.ReactNode } | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [roadDisruptions, setRoadDisruptions] = useState([]);

  useEffect(() => {
    const fetchRoadDisruptions = async () => {
      try {
        const response = await axios.get('http/jirantetangga/v1/news');
        if (response) {
          setRoadDisruptions(response.data);
        } else {
          console.log('No data found!');
          setRoadDisruptions([]);
        }
      } catch (error) {
        console.error("Error fetching road disruptions:", error);
      }
    };

    fetchRoadDisruptions();
  }, []);

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
                alt={selectedImageData.alt}
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
              <DialogTitle>{detailsContent?.title}</DialogTitle>
              <DialogDescription>{detailsContent?.description}</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {detailsContent?.content}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Propose a New Event</DialogTitle>
              <DialogDescription>
                Fill out the form below to propose a new community event. Your proposal will be reviewed by an administrator.
              </DialogDescription>
            </DialogHeader>
            <EventRegistrationForm onFormSubmit={() => setIsRegistrationOpen(false)} />
          </DialogContent>
        </Dialog>

        <div className="grid gap-6 md:grid-cols-2">
          <DashboardCard
            title="Road Disruptions"
            icon={<TrafficCone className="h-6 w-6 text-destructive" />}
            description="Latest updates on traffic and road closures."
            onSeeMore={() => handleSeeMore(
              "All Road Disruptions",
              "Here are all the recent road disruptions.",
              <ul className="space-y-4">
                {roadDisruptions.length > 0 ? (
                  roadDisruptions.map((disruption: any) => (
                    <li key={disruption.id} className="flex items-start justify-between rounded-md border p-4">
                      <span className="text-sm font-medium">{disruption.title}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{disruption.time}</span>
                    </li>
                  ))
                ) : (
                  <p>No available data.</p>
                )}
              </ul>
            )}
          >
            <ul className="space-y-4 rounded-md bg-destructive/10 p-4">
              {roadDisruptions.length > 0 ? (
                roadDisruptions.slice(0, 3).map((disruption: any) => (
                  <li key={disruption.id} className="flex items-start justify-between">
                    <span className="text-sm font-medium">{disruption.title}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{disruption.time}</span>
                  </li>
                ))
              ) : (
                <p>No available data.</p>
              )}
            </ul>
          </DashboardCard>

          <DashboardCard
            title="Shop Notifications"
            icon={<Store className="h-6 w-6 text-primary" />}
            description="News about local businesses."
            onSeeMore={() => handleSeeMore(
              "All Shop Notifications",
              "Here are all the recent notifications about local shops.",
              <ul className="space-y-4">
                {shopNotifications.map((item) => (
                  <li key={item.id} className="flex flex-col rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.title}</span>
                        <Badge variant={item.status === 'new' ? 'default' : 'destructive'} className={item.status === 'new' ? 'bg-green-600' : ''}>
                          {item.status}
                        </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.location}</span>
                  </li>
                ))}
              </ul>
            )}
          >
             <ul className="space-y-4">
              {shopNotifications.slice(0, 3).map((item) => (
                <li key={item.id} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'new' ? 'default' : 'destructive'} className={item.status === 'new' ? 'bg-green-600' : ''}>
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewImage(item.image, item.title, item.hint)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.location}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>
          
          <DashboardCard
            title="Park Status"
            icon={<Trees className="h-6 w-6 text-green-600" />}
            description="Condition and availability of local parks."
            onSeeMore={() => handleSeeMore(
              "All Park Statuses",
              "Here are the latest statuses for all local parks.",
              <ul className="space-y-4">
                {parkStatus.map((item) => (
                  <li key={item.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.park}</span>
                      <Badge variant={item.status === 'open' ? 'default' : 'secondary'} className={item.status === 'open' ? 'bg-green-600' : ''}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.message}</p>
                  </li>
                ))}
              </ul>
            )}
          >
            <ul className="space-y-4">
              {parkStatus.slice(0, 3).map((item) => (
                <li key={item.id}>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">{item.park}</span>
                     <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'open' ? 'default' : 'secondary'} className={item.status === 'open' ? 'bg-green-600' : ''}>
                          {item.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewImage(item.image, item.park, item.hint)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground">{item.message}</p>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard
            title="Local Events"
            icon={<CalendarDays className="h-6 w-6 text-primary" />}
            description="Upcoming community events and ceremonies."
            onSeeMore={() => handleSeeMore(
              "All Local Events",
              "Here are all upcoming community events. Click the view icon for more details.",
              <ul className="space-y-4">
                {localEvents.map((event) => (
                   <li key={event.id} className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date} @ {event.time}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSeeMore(
                      event.title,
                      `Event Details`,
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Date:</span> {event.date}</p>
                        <p className="text-sm"><span className="font-semibold">Time:</span> {event.time}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    )}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            headerActions={
              <Button onClick={() => setIsRegistrationOpen(true)}>
                <PenSquare className="mr-2 h-4 w-4" />
                Apply
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <ul className="space-y-4">
                {localEvents.slice(0, 2).map((event) => (
                  <li key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date} @ {event.time}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSeeMore(
                      event.title,
                      `Event Details`,
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold">Date:</span> {event.date}</p>
                        <p className="text-sm"><span className="font-semibold">Time:</span> {event.time}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    )}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </DashboardCard>

        </div>
      </main>
    </div>
  );
}
