// ============================================================================
// Supabase Edge Function: festival-reminder
// ============================================================================
// Checks for upcoming festivals and generates AI notifications
// Runs daily at 9:00 AM via Supabase Cron
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface FestivalEvent {
  id: string;
  name: string;
  description: string;
  event_date: string;
  category: string;
  country: string;
}

interface UserPreferences {
  user_id: string;
  countries: string[];
  enabled_categories: string[];
  voice_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  notification_time: string;
  days_before_notification: number;
  muted_festivals: string[];
}

serve(async (req) => {
  try {
    console.log('🔔 [FESTIVAL-REMINDER] Starting daily festival reminder check...');

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all users with festival preferences
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('user_id');

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log(`👥 Found ${allUsers?.length || 0} users to check`);

    let notificationsCreated = 0;

    // Process each user
    for (const user of allUsers || []) {
      try {
        // Get user preferences (or use defaults)
        const { data: prefs } = await supabase
          .from('user_festival_preferences')
          .select('*')
          .eq('user_id', user.user_id)
          .single();

        const userPrefs: UserPreferences = prefs || {
          user_id: user.user_id,
          countries: ['IN'],
          enabled_categories: ['national', 'religious', 'observance', 'cultural'],
          voice_notifications_enabled: true,
          push_notifications_enabled: true,
          notification_time: '09:00:00',
          days_before_notification: 1,
          muted_festivals: [],
        };

        // Get upcoming festivals for this user
        const daysAhead = userPrefs.days_before_notification || 1;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        const { data: upcomingFestivals, error: festivalsError } = await supabase
          .from('festival_events')
          .select('*')
          .in('country', userPrefs.countries)
          .in('category', userPrefs.enabled_categories)
          .eq('event_date', targetDateStr)
          .eq('is_active', true)
          .is('user_id', null); // Only global events

        if (festivalsError) {
          console.error(`❌ Error fetching festivals for user ${user.user_id}:`, festivalsError);
          continue;
        }

        if (!upcomingFestivals || upcomingFestivals.length === 0) {
          continue;
        }

        console.log(`🎉 Found ${upcomingFestivals.length} upcoming festivals for user ${user.user_id}`);

        // Process each festival
        for (const festival of upcomingFestivals) {
          // Skip if festival is muted by user
          if (userPrefs.muted_festivals.includes(festival.name)) {
            console.log(`🔇 Skipping muted festival: ${festival.name}`);
            continue;
          }

          // Check if notification already exists for this festival and user
          const { data: existingNotif } = await supabase
            .from('ai_notifications')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('festival_event_id', festival.id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
            .single();

          if (existingNotif) {
            console.log(`⏭️ Notification already exists for ${festival.name}`);
            continue;
          }

          // Generate AI prompt and message
          const aiContent = await generateFestivalNotification(festival, daysAhead);

          // Create notification
          const { error: notifError } = await supabase
            .from('ai_notifications')
            .insert({
              user_id: user.user_id,
              notification_type: 'festival',
              title: aiContent.title,
              message: aiContent.message,
              ai_prompt: aiContent.prompt,
              voice_text: aiContent.voiceText,
              festival_event_id: festival.id,
              status: 'pending',
              scheduled_for: new Date().toISOString(),
              priority: festival.category === 'national' ? 'high' : 'normal',
            });

          if (notifError) {
            console.error(`❌ Error creating notification:`, notifError);
          } else {
            notificationsCreated++;
            console.log(`✅ Created notification for ${festival.name}`);
          }
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${user.user_id}:`, userError);
        continue;
      }
    }

    console.log(`✅ [FESTIVAL-REMINDER] Created ${notificationsCreated} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${notificationsCreated} festival notifications`,
        data: {
          users_processed: allUsers?.length || 0,
          notifications_created: notificationsCreated,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ [FESTIVAL-REMINDER] Error:', error);

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

// Generate contextual AI notification for a festival
async function generateFestivalNotification(
  festival: FestivalEvent,
  daysAhead: number
): Promise<{
  title: string;
  message: string;
  prompt: string;
  voiceText: string;
}> {
  const timePhrase = daysAhead === 0 ? 'today' : daysAhead === 1 ? 'tomorrow' : `in ${daysAhead} days`;
  
  // Generate contextual messages based on festival category
  const templates = {
    national: {
      title: `${festival.name} is ${timePhrase}! 🇮🇳`,
      message: `${festival.name} is ${timePhrase}. Would you like me to set reminders or help you plan your day off?`,
      voiceText: `${festival.name} is ${timePhrase}. Shall I help you plan your day or set any reminders?`,
    },
    religious: {
      title: `${festival.name} is ${timePhrase}! 🙏`,
      message: `${festival.name} is ${timePhrase}. Would you like me to remind you to send greetings to family and friends?`,
      voiceText: `${festival.name} is ${timePhrase}. Shall I remind you to send festival wishes to your loved ones?`,
    },
    observance: {
      title: `${festival.name} is ${timePhrase}`,
      message: `${festival.name} is ${timePhrase}. ${festival.description || 'Would you like to learn more about this observance?'}`,
      voiceText: `${festival.name} is ${timePhrase}. Would you like to know more about it?`,
    },
    cultural: {
      title: `${festival.name} is ${timePhrase}! 🎉`,
      message: `${festival.name} is ${timePhrase}. Would you like me to help you plan celebrations or set reminders?`,
      voiceText: `${festival.name} is ${timePhrase}. Shall I help you plan your celebrations?`,
    },
    custom: {
      title: `${festival.name} is ${timePhrase}`,
      message: `${festival.name} is ${timePhrase}. Would you like me to set a reminder?`,
      voiceText: `${festival.name} is ${timePhrase}. Shall I set a reminder for you?`,
    },
  };

  const template = templates[festival.category as keyof typeof templates] || templates.custom;

  return {
    title: template.title,
    message: template.message,
    prompt: `Festival: ${festival.name}, Category: ${festival.category}, Days ahead: ${daysAhead}`,
    voiceText: template.voiceText,
  };
}

