import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function ContactUsPage() {
  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button
          asChild
          variant="ghost"
          className="p-2 rounded-full hover:bg-primary/10"
        >
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">
              arrow_back_ios_new
            </span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Contact Us</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-4">
        <Input
          placeholder="Your Email"
          type="email"
          className="bg-input-light dark:bg-input-dark"
        />
        <Input
          placeholder="Subject"
          className="bg-input-light dark:bg-input-dark"
        />
        <Textarea
          placeholder="Your message..."
          className="bg-input-light dark:bg-input-dark"
        />
      </main>
      <footer className="p-6">
        <Button className="w-full h-14 rounded-lg bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors">
          Send Message
        </Button>
      </footer>
    </div>
  );
}
