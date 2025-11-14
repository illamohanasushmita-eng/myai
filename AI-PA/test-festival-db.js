// Quick test script to verify festival database tables exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFestivalTables() {
  console.log('\n🧪 Testing Festival Database Tables...\n');

  // Test 1: Check if festival_events table exists
  console.log('1️⃣ Checking festival_events table...');
  const { data: festivals, error: festivalsError } = await supabase
    .from('festival_events')
    .select('*')
    .limit(5);

  if (festivalsError) {
    console.error('❌ Error querying festival_events:', festivalsError.message);
    console.error('   Code:', festivalsError.code);
    console.error('   Details:', festivalsError.details);
    console.error('   Hint:', festivalsError.hint);
  } else {
    console.log(`✅ festival_events table exists! Found ${festivals.length} records`);
    if (festivals.length > 0) {
      console.log('   Sample:', festivals[0].name);
    }
  }

  // Test 2: Check if ai_notifications table exists
  console.log('\n2️⃣ Checking ai_notifications table...');
  const { data: notifications, error: notificationsError } = await supabase
    .from('ai_notifications')
    .select('*')
    .limit(1);

  if (notificationsError) {
    console.error('❌ Error querying ai_notifications:', notificationsError.message);
  } else {
    console.log(`✅ ai_notifications table exists! Found ${notifications.length} records`);
  }

  // Test 3: Check if user_festival_preferences table exists
  console.log('\n3️⃣ Checking user_festival_preferences table...');
  const { data: preferences, error: preferencesError } = await supabase
    .from('user_festival_preferences')
    .select('*')
    .limit(1);

  if (preferencesError) {
    console.error('❌ Error querying user_festival_preferences:', preferencesError.message);
  } else {
    console.log(`✅ user_festival_preferences table exists! Found ${preferences.length} records`);
  }

  // Test 4: Check if festival_sync_log table exists
  console.log('\n4️⃣ Checking festival_sync_log table...');
  const { data: syncLog, error: syncLogError } = await supabase
    .from('festival_sync_log')
    .select('*')
    .limit(1);

  if (syncLogError) {
    console.error('❌ Error querying festival_sync_log:', syncLogError.message);
  } else {
    console.log(`✅ festival_sync_log table exists! Found ${syncLog.length} records`);
  }

  // Test 5: Check RPC function
  console.log('\n5️⃣ Checking get_upcoming_festivals RPC function...');
  const { data: upcomingFestivals, error: rpcError } = await supabase
    .rpc('get_upcoming_festivals', {
      p_user_id: 'test-user-id',
      p_days_ahead: 30,
      p_country: 'IN'
    });

  if (rpcError) {
    console.error('❌ Error calling get_upcoming_festivals:', rpcError.message);
  } else {
    console.log(`✅ get_upcoming_festivals RPC function works! Found ${upcomingFestivals?.length || 0} festivals`);
  }

  console.log('\n✅ Database test complete!\n');
}

testFestivalTables().catch(console.error);

