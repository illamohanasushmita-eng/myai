import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="sticky bottom-0 bg-background dark:bg-background-dark p-6">
      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20">
          <Link href="/signin">Get Started</Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="h-12 w-full text-base font-bold bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </footer>
  );
}
