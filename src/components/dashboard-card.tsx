import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DashboardCard({ title, description, icon, children, className, contentClassName }: DashboardCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("flex-1", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
