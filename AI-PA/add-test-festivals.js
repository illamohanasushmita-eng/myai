// Script to add test festivals to the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testFestivals = [
  {
    name: 'Diwali',
    description: 'Festival of Lights - One of the most important Hindu festivals celebrating the victory of light over darkness',
    event_date: '2025-11-01',
    category: 'religious',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
  {
    name: 'Republic Day',
    description: 'National holiday celebrating the adoption of the Constitution of India on January 26, 1950',
    event_date: '2026-01-26',
    category: 'national',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
  {
    name: 'Holi',
    description: 'Festival of Colors - Hindu spring festival celebrating the arrival of spring and the victory of good over evil',
    event_date: '2026-03-14',
    category: 'religious',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
  {
    name: 'Independence Day',
    description: 'National holiday celebrating India\'s independence from British rule on August 15, 1947',
    event_date: '2025-08-15',
    category: 'national',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
  {
    name: 'Gandhi Jayanti',
    description: 'National holiday celebrating the birthday of Mahatma Gandhi, the Father of the Nation',
    event_date: '2025-10-02',
    category: 'national',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
  {
    name: 'Christmas',
    description: 'Christian festival celebrating the birth of Jesus Christ',
    event_date: '2025-12-25',
    category: 'religious',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
  {
    name: 'Eid al-Fitr',
    description: 'Islamic festival marking the end of Ramadan, the month of fasting',
    event_date: '2025-04-01',
    category: 'religious',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
  {
    name: 'Guru Nanak Jayanti',
    description: 'Sikh festival celebrating the birth of Guru Nanak, the founder of Sikhism',
    event_date: '2025-11-15',
    category: 'religious',
    country: 'IN',
    is_active: true,
    reminder_enabled: true,
    event_type: 'National Holiday',
  },
];

async function addTestFestivals() {
  console.log('\n🎉 Adding test festivals to database...\n');

  // First, check if festivals already exist
  const { data: existingFestivals, error: checkError } = await supabase
    .from('festival_events')
    .select('name');

  if (checkError) {
    console.error('❌ Error checking existing festivals:', checkError.message);
    return;
  }

  if (existingFestivals && existingFestivals.length > 0) {
    console.log(`ℹ️  Found ${existingFestivals.length} existing festivals in database`);
    console.log('   Existing festivals:', existingFestivals.map(f => f.name).join(', '));
    console.log('\n⚠️  Skipping insert to avoid duplicates.');
    console.log('   If you want to re-add festivals, delete them first in Supabase.\n');
    return;
  }

  // Insert test festivals
  const { data, error } = await supabase
    .from('festival_events')
    .insert(testFestivals)
    .select();

  if (error) {
    console.error('❌ Error adding festivals:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
    return;
  }

  console.log(`✅ Successfully added ${data.length} test festivals!\n`);
  
  data.forEach((festival, index) => {
    console.log(`${index + 1}. ${festival.name} - ${festival.event_date} (${festival.category})`);
  });

  console.log('\n🎊 Test festivals added! Refresh your Tasks page to see them!\n');
}

addTestFestivals().catch(console.error);

