
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getUser, createUser } from "@/lib/services/userService";

interface UserProfile {
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  theme?: string;
  language?: string;
}

// Default placeholder avatar
const DEFAULT_AVATAR = 'https://via.placeholder.com/96?text=User';

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string>("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error('Auth error:', authError?.message || 'No user found');
          setError('Failed to get authenticated user');
          router.push('/signin');
          return;
        }

        console.log('Authenticated user ID:', user.id);

        // Fetch user profile from users table using userService
        try {
          let userProfile = await getUser(user.id);

          if (userProfile) {
            console.log('User profile found:', userProfile);
            setProfile(userProfile);
            setProfileImage(userProfile.avatar_url || '');
          } else {
            // User profile doesn't exist, create a default one
            console.log('Creating default profile for user:', user.id);
            try {
              const newProfile = await createUser({
                email: user.email || '',
                name: user.user_metadata?.name || 'User',
                phone: '',
                avatar_url: '',
                theme: 'light',
                language: 'en',
                password_hash: 'managed_by_supabase_auth',
              });

              if (newProfile) {
                console.log('Default profile created successfully:', newProfile);
                setProfile(newProfile);
                setProfileImage(newProfile.avatar_url || '');
              }
            } catch (createError: any) {
              const createErrorMsg = createError?.message || 'Unknown error';
              console.error('Error creating profile:', createErrorMsg);
              setError('Failed to create profile data');
            }
          }
        } catch (serviceError: any) {
          const errorMessage = serviceError?.message || JSON.stringify(serviceError);
          console.error('Error in userService:', errorMessage);
          setError('Failed to load profile data');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error in fetchUserProfile:', errorMsg);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  useEffect(() => {
    if (showCamera) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
          setShowCamera(false);
        }
      };

      getCameraPermission();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [showCamera, toast]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setProfileImage(dataUrl);
        setShowCamera(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    // In a real app, you'd also handle clearing session, tokens, etc.
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
        <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
          <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
            <Link href="/dashboard">
              <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Profile</h1>
          <div className="w-10"></div>
        </header>
        <main className="flex-grow p-6 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <header className="flex items-center justify-between p-4 border-b border-white/20 dark:border-black/20">
        <Button asChild variant="ghost" className="p-2 rounded-full hover:bg-primary/10">
          <Link href="/dashboard">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">arrow_back_ios_new</span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Profile</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-24 w-24">
            <Image
              src={profileImage || profile?.avatar_url || DEFAULT_AVATAR}
              alt="User profile picture"
              fill
              className="rounded-full object-cover"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 bg-card-light dark:bg-card-dark rounded-full h-8 w-8 border-2 border-background-light dark:border-background-dark">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <DialogClose asChild>
                        <Button onClick={() => fileInputRef.current?.click()}>Upload from device</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={() => setShowCamera(true)}>Take a photo</Button>
                    </DialogClose>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">{profile?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="name">Full Name</label>
            <Input id="name" defaultValue={profile?.name || ''} className="mt-1 bg-input-light dark:bg-input-dark" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">Email Address</label>
            <Input id="email" type="email" defaultValue={profile?.email || ''} disabled className="mt-1 bg-input-light dark:bg-input-dark opacity-60" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="phone">Phone Number</label>
            <Input id="phone" type="tel" defaultValue={profile?.phone || ''} placeholder="Add phone number" className="mt-1 bg-input-light dark:bg-input-dark" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="theme">Theme</label>
            <Input id="theme" defaultValue={profile?.theme || 'light'} className="mt-1 bg-input-light dark:bg-input-dark" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="language">Language</label>
            <Input id="language" defaultValue={profile?.language || 'en'} className="mt-1 bg-input-light dark:bg-input-dark" />
          </div>
        </div>
        
        {showCamera && (
          <Dialog open={showCamera} onOpenChange={setShowCamera}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Take a Photo</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
                {hasCameraPermission === false && (
                    <Alert variant="destructive">
                              <AlertTitle>Camera Access Required</AlertTitle>
                              <AlertDescription>
                                Please allow camera access to use this feature.
                              </AlertDescription>
                      </Alert>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
                <Button onClick={handleCapture} disabled={!hasCameraPermission}>Capture</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
      <footer className="p-6 space-y-4">
        <Button className="w-full h-14 rounded-lg bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors">
          Save Changes
        </Button>
        <Button onClick={handleLogout} variant="destructive" className="w-full h-14 rounded-lg text-white font-bold text-base transition-colors">
          Logout
        </Button>
      </footer>
    </div>
  );
}
