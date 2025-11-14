import { getFitbitAccessToken } from './auth';

async function fitbitJsonFetch(userId: string, url: string): Promise<any> {
  const token = await getFitbitAccessToken(userId);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-cache',
  } as any);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Fitbit API error ${res.status}: ${txt}`);
  }
  return res.json();
}

export interface DailySummary {
  connected: boolean;
  date: string;
  steps: number;
  calories: number;
  restingHeartRate: number | null;
  sleep: { totalMinutesAsleep: number; totalTimeInBed: number };
  // Additional metrics
  distanceTotal: number; // from activities.summary.distances (total)
  floors: number;
  activeMinutes: {
    very: number;
    moderate: number;
    light: number;
    sedentary: number;
  };
  // Optional: if token has nutrition scope; may be undefined
  waterFitbitMl?: number | null;
}

export async function getDailySummary(userId: string, date: string): Promise<DailySummary> {
  // Activities summary: steps, calories, distance, floors, active minutes
  const activitiesUrl = `https://api.fitbit.com/1/user/-/activities/date/${date}.json`;
  const heartUrl = `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`;
  const sleepUrl = `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`;

  const [activities, heart, sleep] = await Promise.all([
    fitbitJsonFetch(userId, activitiesUrl),
    fitbitJsonFetch(userId, heartUrl),
    fitbitJsonFetch(userId, sleepUrl),
  ]);

  const steps = activities?.summary?.steps ?? 0;
  const calories = activities?.summary?.caloriesOut ?? 0;
  const restingHeartRate = heart?.['activities-heart']?.[0]?.value?.restingHeartRate ?? null;
  const sleepSummary = {
    totalMinutesAsleep: sleep?.summary?.totalMinutesAsleep ?? 0,
    totalTimeInBed: sleep?.summary?.totalTimeInBed ?? 0,
  };

  // Additional derived metrics
  const distances = activities?.summary?.distances || [];
  const totalDistance = Array.isArray(distances)
    ? (distances.find((d: any) => d.activity === 'total')?.distance ?? 0)
    : 0;
  const floors = activities?.summary?.floors ?? 0;
  const very = activities?.summary?.veryActiveMinutes ?? 0;
  const moderate = activities?.summary?.moderatelyActiveMinutes ?? 0;
  const light = activities?.summary?.lightlyActiveMinutes ?? 0;
  const sedentary = activities?.summary?.sedentaryMinutes ?? 0;

  let waterFitbitMl: number | null | undefined = undefined;
  try {
    // This endpoint requires the 'nutrition' scope; if not granted, it may 403.
    const waterUrl = `https://api.fitbit.com/1/user/-/foods/log/water/date/${date}.json`;
    const water = await fitbitJsonFetch(userId, waterUrl);
    // Fitbit returns water in milliliters in water.summary.water
    waterFitbitMl = water?.summary?.water ?? null;
  } catch {
    // Ignore if scope not granted or endpoint unavailable
    waterFitbitMl = undefined;
  }

  return {
    connected: true,
    date,
    steps,
    calories,
    restingHeartRate,
    sleep: sleepSummary,
    distanceTotal: totalDistance,
    floors,
    activeMinutes: { very, moderate, light, sedentary },
    waterFitbitMl,
  };
}

