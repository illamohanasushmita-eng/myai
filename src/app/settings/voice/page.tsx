
"use client"
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function VoiceCommandsPage() {
  const [voice, setVoice] = useState("assistant-1");
  const [speed, setSpeed] = useState([50]);
  const [activationPhrase, setActivationPhrase] = useState("Hey MyAI");
  const [tempPhrase, setTempPhrase] = useState(activationPhrase);
  const [isEditingPhrase, setIsEditingPhrase] = useState(false);

  const handleSavePhrase = () => {
    setActivationPhrase(tempPhrase);
    setIsEditingPhrase(false);
  };

  const handleCancelEdit = () => {
    setTempPhrase(activationPhrase);
    setIsEditingPhrase(false);
  };


  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
          <Link href="/settings">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Voice Commands</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-8">
        <div>
          <h2 className="font-semibold mb-2">Voice Assistant</h2>
          <RadioGroup value={voice} onValueChange={setVoice} className="p-4 rounded-lg bg-card-light dark:bg-card-dark space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="assistant-1" id="r1" />
              <Label htmlFor="r1">Default Assistant (Female)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="assistant-2" id="r2" />
              <Label htmlFor="r2">Assistant 2 (Male)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="assistant-3" id="r3" />
              <Label htmlFor="r3">Assistant 3 (Female, British Accent)</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Speech Speed</h2>
           <div className="p-4 rounded-lg bg-card-light dark:bg-card-dark">
            <Slider value={speed} onValueChange={setSpeed} max={100} step={1} />
           </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Activation Phrase</h2>
          <div className="p-4 rounded-lg bg-card-light dark:bg-card-dark flex justify-between items-center">
          {isEditingPhrase ? (
              <div className="flex w-full items-center gap-2">
                <Input
                  type="text"
                  value={tempPhrase}
                  onChange={(e) => setTempPhrase(e.target.value)}
                  className="bg-input-light dark:bg-input-dark"
                />
                <Button onClick={handleSavePhrase} size="sm">Save</Button>
                <Button onClick={handleCancelEdit} variant="ghost" size="sm">Cancel</Button>
              </div>
            ) : (
              <>
                <p>"{activationPhrase}"</p>
                <Button variant="ghost" onClick={() => { setIsEditingPhrase(true); setTempPhrase(activationPhrase); }}>Change</Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
