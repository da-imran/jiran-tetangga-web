
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  category: z.string().min(1, { message: "Please select a category." }),
  location: z.string().min(5, "Location details are required.").max(100),
  description: z.string().min(10, "Description is required.").max(250),
  photo: z.any().optional(),
});

export function IssueReportForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      location: "",
      description: "",
      category: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Report Submitted!",
      description: "Thank you for your submission. Our administrators will review it shortly.",
    });
    // Here you would typically handle the form submission, e.g., send data to a server.
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
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
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem data-speakable="true">
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an issue category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="road-damage">Road Damage</SelectItem>
                  <SelectItem value="park-issue">Park Issue</SelectItem>
                  <SelectItem value="public-nuisance">Public Nuisance</SelectItem>
                  <SelectItem value="waste-management">Waste Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem data-speakable="true">
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jalan Merbuk, near the playground" {...field} />
              </FormControl>
              <FormDescription>
                Please provide a specific location or landmark.
              </FormDescription>
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
                  placeholder="Describe the issue in detail."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem data-speakable="true">
              <FormLabel>Upload Photo (Optional)</FormLabel>
              <FormControl>
                <Input type="file" {...form.register("photo")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Submit Report</Button>
      </form>
    </Form>
  );
}
