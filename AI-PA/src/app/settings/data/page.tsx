"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function DataManagementPage() {
  const { toast } = useToast();

  const handleExport = () => {
    const data = {
      user: {
        name: "Alex Thompson",
        email: "alex.thompson@example.com",
      },
      tasks: [
        { id: 1, title: "Finalize Project Phoenix report", status: "completed" },
        { id: 2, title: "Prepare slides for Q4 presentation", status: "pending" },
      ],
      settings: {
        theme: "dark",
        notifications: true,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "myai_data_export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been successfully exported as a JSON file.",
    });
  };

  const handleDeleteAccount = () => {
    // In a real application, you would make an API call to delete the user's account data.
    console.log("User account deleted.");

    toast({
      title: "Account Deleted",
      description: "Your account and all associated data have been permanently deleted.",
      variant: "destructive",
    });

    // Optionally, redirect the user to the homepage or signup page after a delay.
    setTimeout(() => {
        // window.location.href = '/signup';
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Data Management</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-6">
        <Button variant="outline" className="w-full" onClick={handleExport}>
          Export Your Data
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Delete Your Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 text-sm text-foreground-light/80 dark:text-foreground-dark/80">
            <p><span className="font-bold text-primary">Export Your Data:</span> Download a JSON file containing all your profile information, tasks, and settings.</p>
            <p className="mt-2"><span className="font-bold text-destructive">Delete Your Account:</span> Be careful, this action is irreversible and will permanently erase all your data.</p>
        </div>
      </main>
    </div>
  );
}
