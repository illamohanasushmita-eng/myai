import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-day.ts';
import '@/ai/flows/suggest-improvements.ts';
import '@/ai/flows/personalized-daily-plan.ts';