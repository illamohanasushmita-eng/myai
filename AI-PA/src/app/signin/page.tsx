import SignInForm from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <main className="flex-grow flex flex-col justify-center px-6 pt-8 pb-4 text-foreground-light dark:text-foreground-dark">
      <div className="text-center mb-8">
        <div className="relative w-64 h-64 mx-auto">
          {/* Placeholder for dev to speed up page load */}
          <div className="w-full h-full bg-gray-200 dark:bg-blue-900/50 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6">
          Welcome Back!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Log in to continue your journey with us.
        </p>
      </div>
      <div className="py-6">
        <SignInForm />
      </div>
    </main>
  );
}
