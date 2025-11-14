import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const syncSchema = z.object({
  country: z.string().length(2).default('IN'),
  year: z.number().int().min(2020).max(2030).optional(),
});

// Calendarific API configuration
const CALENDARIFIC_API_KEY = '2VT5I4FRzaZfH3qxthwibn6rkxruEXZo';
const CALENDARIFIC_API_URL = 'https://calendarific.com/api/v2/holidays';

// Map Calendarific holiday types to our categories
function mapHolidayTypeToCategory(types: string[]): 'national' | 'religious' | 'observance' | 'cultural' {
  if (types.includes('National holiday')) return 'national';
  if (types.includes('Hindu') || types.includes('Muslim') || types.includes('Christian') || types.includes('Sikh')) return 'religious';
  if (types.includes('Observance')) return 'observance';
  return 'cultural';
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎉 [SYNC] Starting festival sync from Calendarific API...');

    const body = await request.json();
    const validationResult = syncSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { country, year } = validationResult.data;
    const targetYear = year || new Date().getFullYear();

    console.log(`📅 Fetching festivals for ${country} - ${targetYear}`);

    // Fetch holidays from Calendarific API
    const calendarificUrl = `${CALENDARIFIC_API_URL}?api_key=${CALENDARIFIC_API_KEY}&country=${country}&year=${targetYear}`;

    const response = await fetch(calendarificUrl);

    if (!response.ok) {
      throw new Error(`Calendarific API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.response || !data.response.holidays) {
      throw new Error('Invalid response from Calendarific API');
    }

    const holidays = data.response.holidays;
    console.log(`✅ Fetched ${holidays.length} holidays from Calendarific`);

    // Transform and insert festivals into database
    const festivalsToInsert = holidays.map((holiday: any) => ({
      name: holiday.name,
      description: holiday.description || `${holiday.name} - ${Array.isArray(holiday.type) ? holiday.type.join(', ') : holiday.type || 'Holiday'}`,
      event_date: holiday.date.iso,
      category: mapHolidayTypeToCategory(Array.isArray(holiday.type) ? holiday.type : [holiday.type].filter(Boolean)),
      country: country,
      is_active: true,
      reminder_enabled: true,
      api_event_id: `calendarific_${country}_${targetYear}_${holiday.name.replace(/\s+/g, '_')}`,
      event_type: Array.isArray(holiday.type) ? holiday.type.join(', ') : (holiday.type || 'Holiday'),
      locations: holiday.locations || null,
      states: Array.isArray(holiday.states) ? holiday.states.join(', ') : (typeof holiday.states === 'string' ? holiday.states : null),
    }));

    // Delete existing festivals for this country and year to avoid duplicates
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    console.log(`🗑️  Deleting existing festivals for ${country} ${targetYear}...`);

    const { error: deleteError } = await supabaseServer
      .from('festival_events')
      .delete()
      .eq('country', country)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .is('user_id', null); // Only delete global festivals, not user-created ones

    if (deleteError) {
      console.error('⚠️  Error deleting old festivals:', deleteError);
    }

    // Insert new festivals
    console.log(`📝 Inserting ${festivalsToInsert.length} festivals...`);

    const { data: insertedData, error: insertError } = await supabaseServer
      .from('festival_events')
      .insert(festivalsToInsert)
      .select();

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`);
    }

    // Log sync operation
    const { error: logError } = await supabaseServer
      .from('festival_sync_log')
      .insert({
        country: country,
        year: targetYear,
        status: 'success',
        festivals_synced: insertedData?.length || 0,
        api_response: { total_holidays: holidays.length },
      });

    if (logError) {
      console.error('⚠️  Error logging sync:', logError);
    }

    console.log(`✅ Successfully synced ${insertedData?.length || 0} festivals!`);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully synced ${insertedData?.length || 0} festivals for ${country} ${targetYear}`,
        data: {
          country,
          year: targetYear,
          festivals_synced: insertedData?.length || 0,
          total_api_holidays: holidays.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [SYNC] Error syncing festivals:', error);

    // Log failed sync
    try {
      await supabaseServer
        .from('festival_sync_log')
        .insert({
          country: 'IN',
          year: new Date().getFullYear(),
          status: 'failed',
          festivals_synced: 0,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
    } catch (logError) {
      console.error('⚠️  Error logging failed sync:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync festivals',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for easy testing/triggering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'IN';
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    console.log(`🎉 [SYNC] GET request - syncing ${country} ${year}`);

    // Call the POST handler with the same logic
    const mockRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ country, year }),
    });

    return POST(mockRequest as NextRequest);
  } catch (error) {
    console.error('❌ [SYNC] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync festivals',
      },
      { status: 500 }
    );
  }
}

