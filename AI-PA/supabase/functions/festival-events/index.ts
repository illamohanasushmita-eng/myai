// ============================================================================
// Supabase Edge Function: festival-events
// ============================================================================
// Fetches festival and holiday data from Calendarific API
// Stores data in festival_events table
// Runs weekly via Supabase Cron
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CALENDARIFIC_API_KEY = Deno.env.get('CALENDARIFIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface CalendarificHoliday {
  name: string;
  description: string;
  date: {
    iso: string;
    datetime: {
      year: number;
      month: number;
      day: number;
    };
  };
  type: string[];
  locations: string;
  states: string;
}

interface CalendarificResponse {
  meta: {
    code: number;
  };
  response: {
    holidays: CalendarificHoliday[];
  };
}

serve(async (req) => {
  try {
    console.log('🎉 [FESTIVAL-EVENTS] Starting festival data fetch...');

    // Validate environment variables
    if (!CALENDARIFIC_API_KEY) {
      throw new Error('CALENDARIFIC_API_KEY not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // Parse request
    const { country = 'IN', year = new Date().getFullYear() } = await req.json().catch(() => ({}));

    console.log(`📅 Fetching festivals for country: ${country}, year: ${year}`);

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Log sync start
    const { data: syncLog, error: syncLogError } = await supabase
      .from('festival_sync_log')
      .insert({
        sync_type: 'full',
        country,
        year,
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('❌ Failed to create sync log:', syncLogError);
    }

    const syncLogId = syncLog?.id;
    const startTime = Date.now();

    // Fetch data from Calendarific API
    const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_API_KEY}&country=${country}&year=${year}`;
    
    console.log('🌐 Calling Calendarific API...');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Calendarific API error: ${response.status} ${response.statusText}`);
    }

    const data: CalendarificResponse = await response.json();
    const apiResponseTime = Date.now() - startTime;

    console.log(`✅ Fetched ${data.response.holidays.length} holidays from API`);

    // Transform and store data
    const festivalsToInsert = data.response.holidays.map((holiday) => ({
      name: holiday.name,
      description: holiday.description || null,
      event_date: holiday.date.iso,
      category: mapHolidayType(holiday.type),
      country,
      is_active: true,
      reminder_enabled: false,
      user_id: null, // Global event
      api_event_id: `${country}-${year}-${holiday.name.toLowerCase().replace(/\s+/g, '-')}`,
      event_type: holiday.type.join(', '),
      locations: holiday.locations || null,
      states: holiday.states || null,
    }));

    // Delete existing events for this country and year to avoid duplicates
    const { error: deleteError } = await supabase
      .from('festival_events')
      .delete()
      .eq('country', country)
      .gte('event_date', `${year}-01-01`)
      .lte('event_date', `${year}-12-31`)
      .is('user_id', null); // Only delete global events

    if (deleteError) {
      console.error('⚠️ Error deleting old events:', deleteError);
    }

    // Insert new events
    const { data: insertedEvents, error: insertError } = await supabase
      .from('festival_events')
      .insert(festivalsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting events:', insertError);
      
      // Update sync log with failure
      if (syncLogId) {
        await supabase
          .from('festival_sync_log')
          .update({
            status: 'failed',
            error_message: insertError.message,
            events_fetched: data.response.holidays.length,
            events_stored: 0,
            api_response_time_ms: apiResponseTime,
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncLogId);
      }

      throw insertError;
    }

    const eventsStored = insertedEvents?.length || 0;
    console.log(`✅ Stored ${eventsStored} events in database`);

    // Update sync log with success
    if (syncLogId) {
      await supabase
        .from('festival_sync_log')
        .update({
          status: 'success',
          events_fetched: data.response.holidays.length,
          events_stored: eventsStored,
          api_response_time_ms: apiResponseTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLogId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${eventsStored} festivals for ${country} ${year}`,
        data: {
          country,
          year,
          events_fetched: data.response.holidays.length,
          events_stored: eventsStored,
          api_response_time_ms: apiResponseTime,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ [FESTIVAL-EVENTS] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to map Calendarific holiday types to our categories
function mapHolidayType(types: string[]): string {
  if (types.includes('National holiday')) return 'national';
  if (types.includes('Religious holiday')) return 'religious';
  if (types.includes('Observance')) return 'observance';
  if (types.includes('Local holiday')) return 'cultural';
  return 'custom';
}

