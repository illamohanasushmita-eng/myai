
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Privacy</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-6">
        <div className="p-4 rounded-lg bg-card-light dark:bg-card-dark">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">Personalize ads</h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Allow using your data to personalize ads.</p>
                </div>
                <Switch defaultChecked />
            </div>
        </div>
         <div className="p-4 rounded-lg bg-card-light dark:bg-card-dark">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">Data Analytics</h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">Help improve our services by sharing anonymous usage data.</p>
                </div>
                <Switch defaultChecked/>
            </div>
        </div>
        <Link href="#" className="block text-center text-primary">Privacy Policy</Link>
      </main>
    </div>
  );
}
