'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  main: string;
  description: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind: number;
  icon: string;
}

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export function WeatherScheduler() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastToastTimeRef = useRef<number>(0);
  const { toast } = useToast();

  // Request geolocation
  const requestGeolocation = async (): Promise<GeolocationCoordinates | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('❌ Geolocation is not supported in this browser');
        setError('Geolocation is not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`📍 Geolocation obtained: lat=${latitude}, lon=${longitude}`);
          resolve({ latitude, longitude });
        },
        (err) => {
          console.error('❌ Geolocation error:', err.message);
          setError(`Geolocation error: ${err.message}`);
          toast({
            title: '📍 Geolocation Error',
            description: err.message,
            variant: 'destructive',
          });
          resolve(null);
        }
      );
    });
  };

  // Generate weather message based on conditions
  const generateWeatherMessage = (data: WeatherData) => {
    const { main, temp, humidity, wind } = data;

    let emoji = '🌤️';
    let advice = '';

    switch (main.toLowerCase()) {
      case 'clear':
        emoji = '☀️';
        advice = 'Perfect day for a stroll. Sunglasses? Yes please.';
        break;
      case 'clouds':
        emoji = '☁️';
        advice = 'A light jacket might do the trick.';
        break;
      case 'rain':
      case 'drizzle':
        emoji = '🌧️';
        advice = 'Umbrella recommended.';
        break;
      case 'thunderstorm':
        emoji = '⚡';
        advice = 'Stay safe! Avoid open areas.';
        break;
      case 'snow':
        emoji = '❄️';
        advice = 'Keep warm and take it slow.';
        break;
      case 'mist':
      case 'fog':
        emoji = '🫧';
        advice = 'Low visibility — drive carefully.';
        break;
      default:
        emoji = '🌤️';
        advice = 'Have a great day!';
    }

    return {
      emoji,
      title: `${emoji} ${main} - ${temp}°C`,
      description: `Feels like ${data.feels_like}°C • Humidity: ${humidity}% • Wind: ${wind} m/s\n\n${advice}`,
    };
  };

  // Fetch weather data
  const fetchWeather = async (coords: GeolocationCoordinates) => {
    try {
      console.log('🌤️ Fetching weather data...');
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: coords.latitude,
          lon: coords.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);
      setError(null);

      console.log('✅ Weather data fetched:', data);

      // Show toast notification regardless of tab visibility
      const now = Date.now();
      // Prevent duplicate toasts within 1 minute
      if (now - lastToastTimeRef.current > 60000) {
        const message = generateWeatherMessage(data);
        toast({
          title: message.title,
          description: message.description,
        });
        lastToastTimeRef.current = now;
        console.log('📢 Toast notification shown');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching weather:', errorMessage);
      setError(errorMessage);
      toast({
        title: '❌ Weather Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Initialize weather scheduler on component mount
  useEffect(() => {
    const initializeWeatherScheduler = async () => {
      console.log('🚀 Initializing Weather Scheduler...');

      // Request geolocation permission
      const coords = await requestGeolocation();

      if (!coords) {
        setError('Unable to get location. Please enable geolocation.');
        toast({
          title: '📍 Location Error',
          description: 'Unable to get location. Please enable geolocation.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch weather immediately
      await fetchWeather(coords);

      // Set up interval to fetch weather every 4 hours
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

      intervalRef.current = setInterval(async () => {
        console.log('⏰ 4-hour interval triggered, fetching weather...');
        await fetchWeather(coords);
      }, FOUR_HOURS_MS);
    };

    initializeWeatherScheduler();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🛑 Weather Scheduler stopped');
      }
    };
  }, [toast]);

  return (
    <div className="weather-scheduler p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">🌤️ Weather Scheduler</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {/* Weather Data Display */}
      {weatherData && (
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Condition</p>
              <p className="text-xl font-bold text-blue-900">{weatherData.main}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Temperature</p>
              <p className="text-xl font-bold text-blue-900">{weatherData.temp}°C</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Feels Like</p>
              <p className="text-xl font-bold text-blue-900">{weatherData.feels_like}°C</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Humidity</p>
              <p className="text-xl font-bold text-blue-900">{weatherData.humidity}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Wind Speed</p>
              <p className="text-xl font-bold text-blue-900">{weatherData.wind} m/s</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Description</p>
              <p className="text-xl font-bold text-blue-900 capitalize">{weatherData.description}</p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

