import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// AI prompt templates for different festival categories
const NOTIFICATION_TEMPLATES = {
  national: (festivalName: string, date: string) => 
    `Tomorrow is ${festivalName}! 🇮🇳 This national holiday celebrates an important moment in our nation's history. Would you like me to set a reminder or help you plan something special?`,
  
  religious: (festivalName: string, date: string) => 
    `Tomorrow is ${festivalName}! 🙏 This sacred festival is a time for celebration and reflection. Shall I remind you to prepare for the festivities or send wishes to your loved ones?`,
  
  observance: (festivalName: string, date: string) => 
    `Tomorrow is ${festivalName}. 📅 This observance is an opportunity for awareness and reflection. Would you like me to provide more information or set a reminder?`,
  
  cultural: (festivalName: string, date: string) => 
    `Tomorrow is ${festivalName}! 🎨 This cultural celebration is a wonderful time to connect with traditions. Shall I help you plan activities or send greetings to friends and family?`,
};

/**
 * Generate AI notifications for festivals happening tomorrow
 * This should be called daily (via cron job or manual trigger)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [NOTIFICATIONS] Generating festival notifications...');

    // Get all active users (you might want to add a users table query here)
    // For now, we'll generate notifications for festivals and let users see them when they log in
    
    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`📅 Looking for festivals on ${tomorrowStr}`);

    // Get all festivals happening tomorrow
    const { data: festivals, error: festivalsError } = await supabaseServer
      .from('festival_events')
      .select('*')
      .eq('event_date', tomorrowStr)
      .eq('is_active', true)
      .eq('reminder_enabled', true);

    if (festivalsError) {
      throw new Error(`Failed to fetch festivals: ${festivalsError.message}`);
    }

    if (!festivals || festivals.length === 0) {
      console.log('ℹ️  No festivals tomorrow');
      return NextResponse.json({
        success: true,
        message: 'No festivals tomorrow',
        data: { festivals_count: 0, notifications_created: 0 },
      });
    }

    console.log(`🎉 Found ${festivals.length} festivals tomorrow`);

    // Get all users who should receive notifications
    // For now, we'll get all users from the users table
    const { data: users, error: usersError } = await supabaseServer
      .from('users')
      .select('user_id, email, name');

    if (usersError) {
      console.error('⚠️  Error fetching users:', usersError);
      // Continue anyway - we'll create global notifications
    }

    const notificationsToCreate = [];

    // Create notifications for each user and each festival
    for (const festival of festivals) {
      const category = festival.category as keyof typeof NOTIFICATION_TEMPLATES;
      const template = NOTIFICATION_TEMPLATES[category] || NOTIFICATION_TEMPLATES.observance;
      const message = template(festival.name, festival.event_date);

      if (users && users.length > 0) {
        // Create personalized notifications for each user
        for (const user of users) {
          // Check if notification already exists
          const { data: existing } = await supabaseServer
            .from('ai_notifications')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('festival_event_id', festival.id)
            .eq('scheduled_for', tomorrowStr)
            .single();

          if (!existing) {
            notificationsToCreate.push({
              user_id: user.user_id,
              festival_event_id: festival.id,
              notification_type: 'festival_reminder',
              message: message,
              scheduled_for: tomorrowStr,
              status: 'pending',
              priority: category === 'national' || category === 'religious' ? 'high' : 'medium',
              ai_prompt: `Generate a personalized festival greeting for ${festival.name} for user ${user.name || user.email}`,
            });
          }
        }
      }
    }

    if (notificationsToCreate.length === 0) {
      console.log('ℹ️  All notifications already exist');
      return NextResponse.json({
        success: true,
        message: 'All notifications already exist',
        data: { festivals_count: festivals.length, notifications_created: 0 },
      });
    }

    // Insert notifications
    console.log(`📝 Creating ${notificationsToCreate.length} notifications...`);
    
    const { data: insertedNotifications, error: insertError } = await supabaseServer
      .from('ai_notifications')
      .insert(notificationsToCreate)
      .select();

    if (insertError) {
      throw new Error(`Failed to create notifications: ${insertError.message}`);
    }

    console.log(`✅ Created ${insertedNotifications?.length || 0} notifications`);

    return NextResponse.json({
      success: true,
      message: `Created ${insertedNotifications?.length || 0} notifications for ${festivals.length} festivals`,
      data: {
        festivals_count: festivals.length,
        notifications_created: insertedNotifications?.length || 0,
        festivals: festivals.map(f => ({ name: f.name, date: f.event_date })),
      },
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Error generating notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate notifications',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for easy testing
export async function GET(request: NextRequest) {
  console.log('🔔 [NOTIFICATIONS] GET request - triggering notification generation');
  
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
  });

  return POST(mockRequest as NextRequest);
}

