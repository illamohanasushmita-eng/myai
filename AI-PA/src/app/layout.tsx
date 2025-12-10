import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react';
import Loading from '@/components/ui/loading';
import HydrationErrorSuppressor from '@/components/HydrationErrorSuppressor';

export const metadata: Metadata = {
  title: "MyAI - Your Personal AI Assistant",
  description:
    "Organize your tasks, get smart reminders, and unlock your potential with MyAI.",
  metadataBase: new URL("http://localhost:3002"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <HydrationErrorSuppressor />
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
