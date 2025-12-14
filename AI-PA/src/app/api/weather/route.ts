import { NextRequest, NextResponse } from "next/server";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";

function generateMood(main: string, id?: number) {
  const m = (main || "").toLowerCase();
  if (m.includes("clear")) {
    return {
      message: "It’s brighter than your future out there! Don’t forget sunscreen 😎.",
      suggestion: "Wear sunglasses and a light dose of confidence.",
    };
  }
  if (m.includes("cloud")) {
    return {
      message: "Cloudy vibes ☁ — maybe take a nap or plot world domination.",
      suggestion: "A warm drink + a short walk can help.",
    };
  }
  if (m.includes("rain")) {
    return {
      message: "It’s raining… like your motivation! Grab that umbrella ☔.",
      suggestion: "Listen to an upbeat playlist while you walk.",
    };
  }
  if (m.includes("thunder") || m.includes("storm") || (id && id < 700 && id >= 200)) {
    return {
      message: "Thunderstruck! ⚡ Perfect time for indoor karaoke.",
      suggestion: "Make a cozy playlist and stay inside.",
    };
  }
  if (m.includes("snow")) {
    return {
      message: "Snow way! ❄ Time for a cozy drink and Netflix.",
      suggestion: "Warm socks recommended.",
    };
  }
  if (m.includes("mist") || m.includes("fog") || m.includes("haze")) {
    return {
      message: "Fog so thick, even Google Maps gave up. Drive safe 🚗.",
      suggestion: "Leave earlier and use low beams.",
    };
  }
  // extreme cases
  if (m.includes("extreme") || m.includes("ash") || m.includes("squall") || m.includes("tornado") || (id && id >= 900)) {
    return {
      message: "Mother Nature’s angry 😬 — stay indoors, hydrate, survive.",
      suggestion: "Follow local advisories and check emergency kits.",
    };
  }

  // default
  return {
    message: "Weather's being mysterious — but you've got this!",
    suggestion: "Dress in layers and keep a snack handy.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lon } = await request.json();

    // Basic validation: lat/lon present and are numbers
    if (lat == null || lon == null) {
      return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

    if (!OPENWEATHER_API_KEY) {
      console.error("OPENWEATHER_API_KEY is not set");
      return NextResponse.json({ error: "Server missing API key" }, { status: 500 });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
      latNum,
    )}&lon=${encodeURIComponent(lonNum)}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      const txt = await weatherResponse.text();
      console.error("OpenWeather API error:", weatherResponse.status, txt);
      return NextResponse.json({ error: "Failed to fetch weather" }, { status: 502 });
    }

    const data = await weatherResponse.json();

    const main = data.weather?.[0]?.main || "";
    const description = data.weather?.[0]?.description || "";
    const temp = data.main?.temp ?? null;
    const feels_like = data.main?.feels_like ?? null;
    const humidity = data.main?.humidity ?? null;
    const wind = data.wind || null;
    const locationName = data.name || null;

    const mood = generateMood(main, data.weather?.[0]?.id);

    return NextResponse.json({
      main,
      description,
      temp,
      feels_like,
      humidity,
      wind,
      locationName,
      message: mood.message,
      suggestion: mood.suggestion,
    });
  } catch (err) {
    console.error("/api/weather error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
