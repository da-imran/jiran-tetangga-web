"use client";

import { CalendarDays, Store, Trees, TrafficCone } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import { AppHeader } from "@/components/header";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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
  { id: 3, title: "Laman Komuniti", status: "open", message: "All facilities are operational." },
];

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border self-start"
                disabled={(date) => date < new Date("1900-01-01")}
                initialFocus
              />
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
