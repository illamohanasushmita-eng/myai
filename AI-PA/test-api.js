// Test in browser console
fetch('/api/ai/voice-command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'play romantic Telugu songs',
    userId: 'test-user-123'
  })
})
.then(res => res.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));