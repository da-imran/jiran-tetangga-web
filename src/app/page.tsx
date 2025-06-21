"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CalendarDays, Store, Trees, TrafficCone } from "lucide-react";
import { cn } from "@/lib/utils";

import { DashboardCard } from "@/components/dashboard-card";
import { AppHeader } from "@/components/header";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


const roadDisruptions = [
  { id: 1, title: "Jalan Cenderai Water Pipe Burst", time: "2 hours ago" },
  { id: 2, title: "Accident near Taman Rinting exit", time: "5 hours ago" },
  { id: 3, title: "Roadworks on Jalan Merbuk until 5 PM", time: "8 hours ago" },
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

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Road Disruptions"
            icon={<TrafficCone className="h-6 w-6 text-destructive" />}
            description="Latest updates on traffic and road closures."
          >
            <ul className="space-y-4">
              {roadDisruptions.map((item) => (
                <li key={item.id} className="flex items-start justify-between">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard
            title="Shop Notifications"
            icon={<Store className="h-6 w-6 text-primary" />}
            description="News about local businesses."
          >
             <ul className="space-y-4">
              {shopNotifications.map((item) => (
                <li key={item.id} className="flex flex-col">
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
          </DashboardCard>
          
          <DashboardCard
            title="Park Status"
            icon={<Trees className="h-6 w-6 text-green-600" />}
            description="Condition and availability of local parks."
          >
            <ul className="space-y-4">
              {parkStatus.map((item) => (
                <li key={item.id}>
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
          </DashboardCard>

          <DashboardCard
            title="Local Events"
            icon={<CalendarDays className="h-6 w-6 text-primary" />}
            description="Upcoming community events and ceremonies."
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
                {localEvents.map((event) => (
                  <li key={event.id}>
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date} @ {event.time}</p>
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
