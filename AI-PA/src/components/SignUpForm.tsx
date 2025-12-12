"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validation
    if (!email || !password || !confirmPassword || !name) {
      setMessageType("error");
      setMessage("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (!termsAccepted) {
      setMessageType("error");
      setMessage("Please accept the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, name, phone);

      // If signup returned a user/session the user is authenticated immediately.
      // Otherwise, the signup was initiated and the user must confirm via email.
      if (result?.user) {
        try {
          localStorage.setItem("userId", result.user.id);
          localStorage.setItem("userEmail", result.user.email || "");
        } catch (e) {
          console.warn("Failed to store user info locally:", e);
        }

        setMessageType("success");
        setMessage("✅ Signup successful! You are signed in.");
      } else {
        setMessageType("success");
        setMessage(
          "✅ Signup initiated! Check your email for a confirmation link to verify your account.",
        );
      }

      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setPhone("");
      setTermsAccepted(false);

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (error: any) {
      setMessageType("error");
      const errorMessage = error?.message || "Signup failed. Please try again.";
      setMessage(`❌ ${errorMessage}`);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          person
        </span>
        <Input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-light dark:bg-input-dark border-none rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Email Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          mail
        </span>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-light dark:bg-input-dark border-none rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Phone Field (Optional) */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          phone
        </span>
        <Input
          type="tel"
          placeholder="Phone (Optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-light dark:bg-input-dark border-none rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Password Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          lock
        </span>
        <Input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-light dark:bg-input-dark border-none rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Confirm Password Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          lock_reset
        </span>
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-light dark:bg-input-dark border-none rounded-lg focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start mt-4">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          className="mt-1"
        />
        <Label
          htmlFor="terms"
          className="ml-2 text-sm text-gray-600 dark:text-gray-400"
        >
          I agree to the{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </Label>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            messageType === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full font-bold py-3 px-5 rounded-lg !mt-6"
        size="lg"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </Button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-primary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
