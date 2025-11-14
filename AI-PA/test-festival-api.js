// Test the festival API endpoint
// Node 18+ has built-in fetch

const userId = 'c1614725-afa4-4d33-b95a-745936523978'; // Your user ID from the error logs
const apiUrl = 'http://localhost:3002/api/festivals/list';

const params = new URLSearchParams({
  userId: userId,
  country: 'IN',
  startDate: '2025-10-31',
  endDate: '2025-11-29',
  isActive: 'true'
});

const fullUrl = `${apiUrl}?${params.toString()}`;

console.log('\n🧪 Testing Festival API Endpoint...\n');
console.log('📍 URL:', fullUrl);
console.log('\n⏳ Fetching...\n');

fetch(fullUrl)
  .then(async (response) => {
    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('\n📄 Response Body:');
    console.log(text);
    
    try {
      const json = JSON.parse(text);
      console.log('\n✅ Parsed JSON:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\n⚠️  Response is not valid JSON');
    }
  })
  .catch((error) => {
    console.error('\n❌ Fetch Error:', error.message);
    console.error('   Make sure the dev server is running on http://localhost:3002');
  });

