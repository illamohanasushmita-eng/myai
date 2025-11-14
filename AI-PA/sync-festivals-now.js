// Quick script to sync festivals from Calendarific API
// Node 18+ has built-in fetch, no need to import

const API_URL = 'http://localhost:3002/api/festivals/sync';

async function syncFestivals() {
  console.log('\n🎉 Starting Festival Sync from Calendarific API...\n');
  console.log('📍 API Endpoint:', API_URL);
  console.log('🌍 Country: India (IN)');
  console.log('📅 Years: 2025, 2026\n');
  console.log('⏳ This may take a minute...\n');

  try {
    // Sync 2025
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 Syncing festivals for 2025...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const response2025 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'IN', year: 2025 }),
    });

    const data2025 = await response2025.json();
    
    if (data2025.success) {
      console.log('✅ 2025 Sync Successful!');
      console.log(`   Festivals synced: ${data2025.data.festivals_synced}`);
      console.log(`   Total API holidays: ${data2025.data.total_api_holidays}\n`);
    } else {
      console.error('❌ 2025 Sync Failed:', data2025.error);
    }

    // Sync 2026
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 Syncing festivals for 2026...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const response2026 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'IN', year: 2026 }),
    });

    const data2026 = await response2026.json();
    
    if (data2026.success) {
      console.log('✅ 2026 Sync Successful!');
      console.log(`   Festivals synced: ${data2026.data.festivals_synced}`);
      console.log(`   Total API holidays: ${data2026.data.total_api_holidays}\n`);
    } else {
      console.error('❌ 2026 Sync Failed:', data2026.error);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎊 Festival Sync Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const totalSynced = (data2025.data?.festivals_synced || 0) + (data2026.data?.festivals_synced || 0);
    console.log(`📊 Total festivals synced: ${totalSynced}`);
    console.log('\n✅ You can now view festivals in your Tasks calendar!');
    console.log('🌐 Go to: http://localhost:3002/tasks\n');

  } catch (error) {
    console.error('\n❌ Error syncing festivals:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. The dev server is running (npm run dev)');
    console.error('   2. The festival schema is deployed in Supabase');
    console.error('   3. Your internet connection is working\n');
  }
}

syncFestivals();

