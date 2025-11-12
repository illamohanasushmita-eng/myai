import { NextRequest, NextResponse } from 'next/server';

interface WeatherData {
  main: string;
  description: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind: number;
  icon: string;
}

interface OpenWeatherResponse {
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lon } = await request.json();

    // Validate coordinates
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat and lon must be numbers.' },
        { status: 400 }
      );
    }

    // Validate latitude and longitude ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.error('❌ OPENWEATHER_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Weather API key is not configured' },
        { status: 500 }
      );
    }

    // Call OpenWeatherMap API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    console.log(`🌤️ Fetching weather for coordinates: lat=${lat}, lon=${lon}`);

    const weatherResponse = await fetch(weatherUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!weatherResponse.ok) {
      console.error(`❌ OpenWeatherMap API error: ${weatherResponse.status} ${weatherResponse.statusText}`);
      return NextResponse.json(
        { error: `Weather API error: ${weatherResponse.statusText}` },
        { status: weatherResponse.status }
      );
    }

    const data: OpenWeatherResponse = await weatherResponse.json();

    // Extract and format weather data
    const weatherData: WeatherData = {
      main: data.weather[0].main,
      description: data.weather[0].description,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 10) / 10, // Round to 1 decimal place
      icon: data.weather[0].icon,
    };

    console.log(`✅ Weather data fetched successfully:`, weatherData);

    return NextResponse.json(weatherData, { status: 200 });
  } catch (error) {
    console.error('❌ Error in weather API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

