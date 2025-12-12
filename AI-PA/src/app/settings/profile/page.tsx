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
import { getUser, createUser, updateUser } from "@/lib/services/userService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  theme?: string;
  language?: string;
}

// Default avatar component - shows initials or icon
const DefaultAvatar = ({ name }: { name?: string }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-full">
      <span className="text-2xl font-bold text-primary">{initials}</span>
    </div>
  );
};

// Validation helper functions
const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  // Must be exactly 10 digits, first digit must be 1-9
  const phoneRegex = /^[1-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  // Limit to 10 digits
  const limited = cleaned.slice(0, 10);
  // Format as XXX-XXX-XXXX
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
};

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string>("");
  const [originalProfileImage, setOriginalProfileImage] = useState<string>("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    theme: "light",
    language: "english",
  });
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
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("Auth error:", authError?.message || "No user found");
          setError("Failed to get authenticated user");
          router.push("/signin");
          return;
        }

        // Fetch user profile from users table using userService
        try {
          let userProfile = await getUser(user.id);

          if (userProfile) {
            console.log("User profile found:", userProfile);
            console.log(
              "[PROFILE] avatar_url from database:",
              userProfile.avatar_url
                ? `${userProfile.avatar_url.substring(0, 50)}...`
                : "empty",
            );
            setProfile(userProfile);
            const avatarUrl = userProfile.avatar_url || "";
            setProfileImage(avatarUrl);
            setOriginalProfileImage(avatarUrl);
            console.log(
              "[PROFILE] Set profileImage and originalProfileImage to:",
              avatarUrl ? `${avatarUrl.substring(0, 50)}...` : "empty",
            );
            setFormData({
              name: userProfile.name || "",
              phone: userProfile.phone || "",
              theme: userProfile.theme || "light",
              language: userProfile.language || "english",
            });
          } else {
            // User profile doesn't exist, create a default one
            console.log("Creating default profile for user:", user.id);
            try {
              const newProfile = await createUser({
                user_id: user.id,
                email: user.email || "",
                name: user.user_metadata?.name || "User",
                phone: "",
                avatar_url: "",
                theme: "light",
                language: "en",
                password_hash: "managed_by_supabase_auth",
              });

              if (newProfile) {
                console.log("Default profile created successfully:", newProfile);
                setProfile(newProfile);
                const avatarUrl = newProfile.avatar_url || "";
                setProfileImage(avatarUrl);
                setOriginalProfileImage(avatarUrl);
                console.log(
                  "[PROFILE] Set profileImage and originalProfileImage to:",
                  avatarUrl ? `${avatarUrl.substring(0, 50)}...` : "empty",
                );
                setFormData({
                  name: newProfile.name || "",
                  phone: newProfile.phone || "",
                  theme: newProfile.theme || "light",
                  language: newProfile.language || "english",
                });
              }
            } catch (createError: any) {
              const createErrorMsg = createError?.message || "Unknown error";
              console.error("Error creating profile:", createErrorMsg);
              setError("Failed to create profile data");
            }
          }
        } catch (serviceError: any) {
          const errorMessage =
            serviceError?.message || JSON.stringify(serviceError);
          console.error("Error in userService:", errorMessage);
          setError("Failed to load profile data");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("Error in fetchUserProfile:", errorMsg);
        setError("An unexpected error occurred");
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
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          setHasCameraPermission(false);
          toast({
            variant: "destructive",
            title: "Camera Access Denied",
            description:
              "Please enable camera permissions in your browser settings to use this app.",
          });
          setShowCamera(false);
        }
      };

      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
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
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL("image/png");
        setProfileImage(dataUrl);
        setShowCamera(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log(
        "[PROFILE] File selected:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type,
      );

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          console.log(
            "[PROFILE] File read as data URL, length:",
            dataUrl.length,
          );
          console.log("[PROFILE] Data URL preview:", dataUrl.substring(0, 100));
          // Store the data URL temporarily for preview
          setProfileImage(dataUrl);
          console.log("[PROFILE] profileImage state updated");
        }
      };
      reader.onerror = (error) => {
        console.error("[PROFILE] FileReader error:", error);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("[PROFILE] No file selected");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      // Remove all non-numeric characters
      const cleaned = value.replace(/\D/g, "");
      // Limit to 10 digits
      const limited = cleaned.slice(0, 10);

      // Validate and set error
      if (limited && !validatePhoneNumber(limited)) {
        setPhoneError(
          "Phone number must be exactly 10 digits and start with 1-9",
        );
      } else {
        setPhoneError(null);
      }

      setFormData((prev) => ({
        ...prev,
        [field]: limited,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (!profile) {
      console.error("[PROFILE] No profile found, cannot save");
      return;
    }

    // Validate phone number before saving
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setPhoneError(
        "Phone number must be exactly 10 digits and start with 1-9",
      );
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid phone number",
      });
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      console.log("[PROFILE] Starting save process for user:", profile.user_id);
      console.log(
        "[PROFILE] Current profileImage:",
        profileImage ? `${profileImage.substring(0, 50)}...` : "empty",
      );
      console.log(
        "[PROFILE] Original profileImage:",
        originalProfileImage
          ? `${originalProfileImage.substring(0, 50)}...`
          : "empty",
      );
      console.log(
        "[PROFILE] Image changed:",
        profileImage !== originalProfileImage,
      );
      console.log("[PROFILE] Form data:", formData);

      // Prepare update data
      const updateData: Partial<UserProfile> = {
        name: formData.name,
        phone: formData.phone,
        theme: formData.theme,
        language: formData.language,
      };

      console.log("[PROFILE] Initial updateData:", updateData);

      // Check if image has changed
      const imageChanged = profileImage !== originalProfileImage;
      console.log("[PROFILE] Image changed:", imageChanged);

      // If profile image was changed, update it
      if (imageChanged) {
        if (profileImage && profileImage.startsWith("data:")) {
          console.log(
            "[PROFILE] Profile image is data URL, uploading via server API",
          );
          try {
            // Generate a file name and post base64 payload to server-side upload endpoint
            const mimeMatch = profileImage.match(/^data:(.+);base64,/);
            const mime = mimeMatch ? mimeMatch[1] : "image/png";
            const fileExt = mime.split("/")[1] || "png";
            const fileName = `${profile.user_id}_${Date.now()}.${fileExt}`;

            const resp = await fetch("/api/upload-avatar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: profile.user_id,
                fileName,
                base64: profileImage,
              }),
            });

            const json = await resp.json();
            if (!resp.ok || !json.publicUrl) {
              console.error("[PROFILE] Server upload failed:", json);
              throw new Error(json.error || "Server upload failed");
            }

            updateData.avatar_url = json.publicUrl;
            console.log("[PROFILE] Uploaded avatar via server API, publicUrl:", json.publicUrl);
          } catch (e) {
            console.error("[PROFILE] Failed to upload profile image via server API:", e);
            // Fallback: keep the data URL so user sees preview but warn
            updateData.avatar_url = profileImage;
          }
        } else if (profileImage && !profileImage.startsWith("data:")) {
          console.log("[PROFILE] Profile image is external URL, updating");
          updateData.avatar_url = profileImage;
          console.log(
            "[PROFILE] Updated avatar_url in updateData with external URL",
          );
        } else if (!profileImage) {
          console.log("[PROFILE] Profile image cleared, setting to empty");
          updateData.avatar_url = "";
        }
      } else {
        console.log("[PROFILE] Image not changed, not updating avatar_url");
      }

      console.log("[PROFILE] Final updateData before API call:", {
        ...updateData,
        avatar_url: updateData.avatar_url
          ? `${updateData.avatar_url.substring(0, 50)}...`
          : "not set",
      });

      // Update user profile
      console.log(
        "[PROFILE] Calling updateUser with:",
        profile.user_id,
        updateData,
      );
      const updatedProfile = await updateUser(profile.user_id, updateData);

      console.log("[PROFILE] Update successful, received:", updatedProfile);
      console.log(
        "[PROFILE] Updated avatar_url from server:",
        updatedProfile.avatar_url
          ? `${updatedProfile.avatar_url.substring(0, 50)}...`
          : "empty",
      );

      setProfile(updatedProfile);
      setProfileImage(updatedProfile.avatar_url || "");
      setOriginalProfileImage(updatedProfile.avatar_url || "");

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      console.log("[PROFILE] Save completed successfully");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to save changes";
      console.error("[PROFILE] Error saving profile:", errorMsg);
      console.error("[PROFILE] Full error:", err);
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setIsSaving(false);
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
          <Button
            asChild
            variant="ghost"
            className="p-2 rounded-full hover:bg-primary/10"
          >
            <Link href="/dashboard">
              <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">
                arrow_back_ios_new
              </span>
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
        <Button
          asChild
          variant="ghost"
          className="p-2 rounded-full hover:bg-primary/10"
        >
          <Link href="/dashboard">
            <span className="material-symbols-outlined text-foreground-light dark:text-foreground-dark">
              arrow_back_ios_new
            </span>
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Profile</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-24 w-24">
            {(() => {
              console.log("[PROFILE-DISPLAY] Rendering profile image");
              console.log(
                "[PROFILE-DISPLAY] profileImage:",
                profileImage ? `${profileImage.substring(0, 50)}...` : "empty",
              );
              console.log(
                "[PROFILE-DISPLAY] profile?.avatar_url:",
                profile?.avatar_url
                  ? `${profile.avatar_url.substring(0, 50)}...`
                  : "empty",
              );
              console.log("[PROFILE-DISPLAY] profile?.name:", profile?.name);

              if (profileImage && profileImage.startsWith("data:")) {
                console.log("[PROFILE-DISPLAY] Rendering data URL image");
                return (
                  <img
                    src={profileImage}
                    alt="User profile picture"
                    className="w-full h-full rounded-full object-cover"
                  />
                );
              } else if (profileImage && !profileImage.startsWith("data:")) {
                console.log("[PROFILE-DISPLAY] Rendering external URL image");
                // Use plain <img> for external/public URLs to avoid Next.js image domain restrictions
                return (
                  <img
                    src={profileImage}
                    alt="User profile picture"
                    className="w-full h-full rounded-full object-cover"
                  />
                );
              } else {
                console.log("[PROFILE-DISPLAY] Rendering default avatar");
                return <DefaultAvatar name={profile?.name} />;
              }
            })()}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 bg-card-light dark:bg-card-dark rounded-full h-8 w-8 border-2 border-background-light dark:border-background-dark"
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Upload from device
                    </Button>
                    <DialogClose asChild>
                      <Button onClick={() => setShowCamera(true)}>
                        Take a photo
                      </Button>
                    </DialogClose>
                  </div>
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
            <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              {profile?.email}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="mt-1 bg-input-light dark:bg-input-dark"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="mt-1 bg-input-light dark:bg-input-dark opacity-60"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="phone">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone ? formatPhoneNumber(formData.phone) : ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="1234567890"
              maxLength={12}
              className="mt-1 bg-input-light dark:bg-input-dark"
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
            {formData.phone && !phoneError && (
              <p className="text-sm text-green-500 mt-1">
                ✓ Valid phone number
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="theme">
              Theme
            </label>
            <Select
              value={formData.theme}
              onValueChange={(value) => handleInputChange("theme", value)}
            >
              <SelectTrigger
                id="theme"
                className="mt-1 bg-input-light dark:bg-input-dark"
              >
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="language">
              Language
            </label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange("language", value)}
            >
              <SelectTrigger
                id="language"
                className="mt-1 bg-input-light dark:bg-input-dark"
              >
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="telugu">Telugu</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showCamera && (
          <Dialog open={showCamera} onOpenChange={setShowCamera}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Take a Photo</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <video
                  ref={videoRef}
                  className="w-full aspect-video rounded-md"
                  autoPlay
                  muted
                />
                {hasCameraPermission === false && (
                  <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
                  </Alert>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
                <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                  Capture
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
      <footer className="p-6 space-y-4">
        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="w-full h-14 rounded-lg bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-14 rounded-lg text-white font-bold text-base transition-colors"
        >
          Logout
        </Button>
      </footer>
    </div>
  );
}
