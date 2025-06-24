import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import "./globals.css";

export const metadata: Metadata = {
  title: "JiranTetangga",
  description: "Your friendly neighborhood watch and community app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <AccessibilityMenu />
        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} JiranTetangga. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
