
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  eventName: z.string().min(5, { message: "Event name must be at least 5 characters." }),
  eventDate: z.date({
    required_error: "A date for the event is required.",
  }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
  organizerName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  organizerEmail: z.string().email({ message: "Please enter a valid email address." }),
});

type EventRegistrationFormProps = {
  onFormSubmit?: () => void;
};

export function EventRegistrationForm({ onFormSubmit }: EventRegistrationFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      description: "",
      organizerName: "",
      organizerEmail: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Event Proposed!",
      description: `Your event, "${values.eventName}", has been submitted for review.`,
    });
    form.reset();
    if (onFormSubmit) {
      onFormSubmit();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem data-speakable="true">
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Community Cleanup Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem className="flex flex-col" data-speakable="true">
              <FormLabel>Event Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem data-speakable="true">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us more about the event"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
               <FormDescription>
                Briefly describe the event, its purpose, and any other relevant details.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organizerName"
          render={({ field }) => (
            <FormItem data-speakable="true">
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organizerEmail"
          render={({ field }) => (
            <FormItem data-speakable="true">
              <FormLabel>Your Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., johndoe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Propose Event</Button>
      </form>
    </Form>
  );
}
