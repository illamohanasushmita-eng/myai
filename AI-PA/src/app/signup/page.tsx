import SignUpForm from "@/components/SignUpForm";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative w-full h-64 rounded-xl mb-8 overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq8h1heaxXNf_ehKHvIL3Q2pwbA9Nn1IxMKLdoT1rzLIBL2SSgwbULwVCI30XUhAYxVyhkwBL-R_t2upAPUS7mFM2hbqlx7ZwnpFfSRrNB4_fnZAsPLztJzk-Uw9_1_u9Bhw9dDiFlQckIZSh4ZLfxqbkwlDvUMHdAxcz0maZ38QmPFRdj-tWq3vIVFio4aH5nER2lihDKsprFJEN1z4XTDD5sHkH47ldnv9MMuYV35QStfXqkYJFF0NFc7IAdL5p3NIR8LhVTxA"
            alt="AI Assistant illustration"
            fill
            className="object-cover"
            data-ai-hint="abstract illustration"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Get started with your AI assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create an account to start managing your daily life.
          </p>
        </div>

        <SignUpForm />
      </div>
    </main>
  );
}
