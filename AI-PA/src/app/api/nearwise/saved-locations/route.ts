import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// GET - Fetch user's saved locations
export async function GET(request: NextRequest) {
  try {
    console.log('[NEARWISE-SAVED] Fetching saved locations...');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('nearwise_saved_locations')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('[NEARWISE-SAVED] Error fetching saved locations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved locations', details: error },
        { status: 500 }
      );
    }

    console.log('[NEARWISE-SAVED] Fetched', data?.length || 0, 'saved locations');

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      locations: data || [],
    });

  } catch (error) {
    console.error('[NEARWISE-SAVED] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch saved locations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST - Save a new location
export async function POST(request: NextRequest) {
  try {
    console.log('[NEARWISE-SAVED] Saving new location...');
    
    const body = await request.json();
    const {
      userId,
      placeId,
      placeName,
      placeCategory,
      latitude,
      longitude,
      address,
      phone,
      rating,
      notes,
    } = body;

    if (!userId || !placeId || !placeName) {
      return NextResponse.json(
        { error: 'userId, placeId, and placeName are required' },
        { status: 400 }
      );
    }

    // Check if location already saved
    const { data: existing } = await supabaseAdmin
      .from('nearwise_saved_locations')
      .select('location_id')
      .eq('user_id', userId)
      .eq('place_id', placeId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Location already saved', locationId: existing.location_id },
        { status: 409 }
      );
    }

    // Insert new saved location
    const { data, error } = await supabaseAdmin
      .from('nearwise_saved_locations')
      .insert([
        {
          user_id: userId,
          place_id: placeId,
          place_name: placeName,
          place_category: placeCategory,
          latitude,
          longitude,
          address,
          phone,
          rating,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[NEARWISE-SAVED] Error saving location:', error);
      return NextResponse.json(
        { error: 'Failed to save location', details: error },
        { status: 500 }
      );
    }

    console.log('[NEARWISE-SAVED] Location saved successfully:', data.location_id);

    return NextResponse.json({
      success: true,
      message: 'Location saved successfully',
      location: data,
    });

  } catch (error) {
    console.error('[NEARWISE-SAVED] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save location', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a saved location
export async function DELETE(request: NextRequest) {
  try {
    console.log('[NEARWISE-SAVED] Deleting saved location...');
    
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const userId = searchParams.get('userId');

    if (!locationId || !userId) {
      return NextResponse.json(
        { error: 'locationId and userId parameters are required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('nearwise_saved_locations')
      .delete()
      .eq('location_id', locationId)
      .eq('user_id', userId);

    if (error) {
      console.error('[NEARWISE-SAVED] Error deleting location:', error);
      return NextResponse.json(
        { error: 'Failed to delete location', details: error },
        { status: 500 }
      );
    }

    console.log('[NEARWISE-SAVED] Location deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully',
    });

  } catch (error) {
    console.error('[NEARWISE-SAVED] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete location', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

