import { useEffect, useState } from "react";

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  error: string | null;
}

export function useServiceWorker(): ServiceWorkerState {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    error: null,
  });

  useEffect(() => {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.warn("⚠️ Service Workers are not supported in this browser");
      setState({
        isSupported: false,
        isRegistered: false,
        error: "Service Workers not supported",
      });
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        console.log("🔧 Registering Service Worker...");
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          {
            scope: "/",
          },
        );

        console.log("✅ Service Worker registered successfully:", registration);
        setState({
          isSupported: true,
          isRegistered: true,
          error: null,
        });

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("📦 New Service Worker version available");
              }
            });
          }
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Service Worker registration failed:", errorMessage);
        setState({
          isSupported: true,
          isRegistered: false,
          error: errorMessage,
        });
      }
    };

    registerServiceWorker();
  }, []);

  return state;
}
