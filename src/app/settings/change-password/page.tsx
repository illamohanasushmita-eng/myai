"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { changePassword } from "@/lib/services/authService";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one symbol");
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from old password");
      return;
    }

    // Validate new password
    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(userId, oldPassword, newPassword);

      setSuccess("Password changed successfully!");

      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to settings after 2 seconds
      setTimeout(() => {
        router.push("/settings");
      }, 2000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      if (err.message === "Invalid password") {
        setError("Current password is incorrect");
      } else if (err.message === "User not found") {
        setError("User not found. Please log in again.");
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-lg font-bold">Change Password</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="old-password">
              Old Password
            </label>
            <div className="relative">
              <Input
                className="w-full h-14 pl-4 pr-12 rounded-lg bg-input-light dark:bg-input-dark border-transparent focus:ring-2 focus:ring-primary focus:border-transparent placeholder-placeholder-light dark:placeholder-placeholder-dark text-foreground-light dark:text-foreground-dark"
                id="old-password"
                placeholder="Old Password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark"
              >
                <span className="material-symbols-outlined">
                  {showOldPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="sr-only" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <Input
                className="w-full h-14 pl-4 pr-12 rounded-lg bg-input-light dark:bg-input-dark border-transparent focus:ring-2 focus:ring-primary focus:border-transparent placeholder-placeholder-light dark:placeholder-placeholder-dark text-foreground-light dark:text-foreground-dark"
                id="new-password"
                placeholder="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark"
              >
                <span className="material-symbols-outlined">
                  {showNewPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="sr-only" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                className="w-full h-14 pl-4 pr-12 rounded-lg bg-input-light dark:bg-input-dark border-transparent focus:ring-2 focus:ring-primary focus:border-transparent placeholder-placeholder-light dark:placeholder-placeholder-dark text-foreground-light dark:text-foreground-dark"
                id="confirm-password"
                placeholder="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark"
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>
        </form>

        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
          <p className="text-sm font-medium text-primary">
            Password Requirements:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-foreground-light/80 dark:text-foreground-dark/80 list-disc list-inside">
            <li>At least 8 characters long</li>
            <li>A mix of uppercase and lowercase letters</li>
            <li>At least one number</li>
            <li>At least one symbol (e.g., !@#$%)</li>
          </ul>
        </div>
      </main>
      <footer className="p-6">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-14 rounded-lg bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </footer>
    </div>
  );
}
