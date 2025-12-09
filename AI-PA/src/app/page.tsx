import Features from "@/components/landing/features";
import Hero from "@/components/landing/hero";

export default function Home() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <Hero />
      <Features />
    </div>
  );
}
