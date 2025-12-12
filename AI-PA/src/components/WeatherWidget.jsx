"use client";

import { useEffect, useState, useRef } from "react";

export default function WeatherWidget() {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetchWeather = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(null);
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const resp = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: latitude, lon: longitude, userId }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json.error || "Failed to fetch weather");
      }
      setWeather(json);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const obtainAndFetch = () => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted) return;
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        async (err) => {
          console.warn("Geolocation error, falling back:", err);
          // If geolocation times out or is denied, attempt an IP-based fallback via server
          try {
            const r = await fetch("/api/geolocate");
            if (r.ok) {
              const j = await r.json();
              if (j.lat && j.lon) {
                if (!mounted) return;
                fetchWeather(j.lat, j.lon);
                return;
              }
            }
          } catch (e) {
            console.warn("IP geolocation fallback failed:", e);
          }
          // Last-resort fallback to New York coordinates
          fetchWeather(40.7128, -74.006);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60 * 1000 },
      );
    };

    obtainAndFetch();

    // refresh every 4 hours
    timerRef.current = window.setInterval(() => {
      obtainAndFetch();
    }, 4 * 60 * 60 * 1000);

    return () => {
      mounted = false;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-md border border-white/20 dark:border-white/10">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-lg">
          {loading ? (
            <div className="animate-pulse w-10 h-10 bg-gray-300 rounded-full" />
          ) : weather ? (
            <div className="text-2xl">🌤️</div>
          ) : (
            <div className="text-2xl">❓</div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Weather Mood</h3>
          {loading ? (
            <p className="text-sm text-subtle-light dark:text-subtle-dark">Fetching your weather mood…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">{weather.locationName || "Your location"} — {weather.main} {Math.round(weather.temp)}°C</p>
              <p className="mt-2 font-medium">{weather.message}</p>
              <p className="text-sm text-subtle-light dark:text-subtle-dark">{weather.suggestion}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
