# 🚀 Quick Start - Lara on Dashboard

**Status**: ✅ Ready to Use  
**Location**: `/dashboard` page  
**Button**: Bottom-right microphone icon

---

## ⚡ Quick Start (30 seconds)

### 1. Open Dashboard

```
http://localhost:3002/dashboard
```

### 2. Look for Microphone Button

- Bottom-right corner
- Red when listening
- Gray when stopped

### 3. Click Microphone Button

- Button turns red
- Shows "Listening for Hey Lara..."

### 4. Say "Hey Lara"

- Speak clearly
- Wait for response

### 5. Say Your Command

```
"Play a song"
"Show my tasks"
"Add a reminder"
"Go to home page"
```

### 6. Lara Executes

- Command is processed
- Action is performed
- Voice confirmation

---

## 🎤 Voice Commands

### Music

```
"Play a song"
"Play [artist name]"
"Play [song name]"
"Play Telugu songs"
```

### Tasks

```
"Show my tasks"
"Add a task"
"Open tasks page"
```

### Reminders

```
"Show my reminders"
"Add a reminder"
"Open reminders page"
```

### Navigation

```
"Go to home page"
"Open professional page"
"Open personal growth page"
"Go to dashboard"
```

### General

```
"What's the weather?"
"Tell me a joke"
"What time is it?"
```

---

## 🎯 Features

✅ **Authenticated User ID** - Uses your real user ID  
✅ **Continuous Listening** - Listens for wake word  
✅ **Voice Feedback** - Speaks confirmations  
✅ **Visual Feedback** - Shows listening state  
✅ **Error Handling** - Graceful error recovery

---

## 🔧 Troubleshooting

### Microphone Button Not Visible

- Scroll to bottom-right of dashboard
- Check if browser window is large enough
- Refresh page

### "Hey Lara" Not Detected

- Speak clearly and naturally
- Check microphone is enabled
- Check browser permissions
- Try again

### Command Not Executed

- Check internet connection
- Check OpenAI API key is valid
- Check browser console for errors
- Try a simpler command

### No Voice Feedback

- Check speaker/headphones are connected
- Check volume is not muted
- Check browser permissions for audio

---

## 📊 What Changed

### Before

- No voice assistant on dashboard
- Had to go to `/test-lara` page

### After

- Voice assistant on dashboard
- Microphone button always visible
- Uses authenticated user ID
- Seamless integration

---

## 🔐 Security

✅ Uses authenticated user ID from Supabase  
✅ Stores user ID in localStorage  
✅ Validates user exists  
✅ Graceful error handling

---

## 📝 Technical Details

### Files Modified

- `src/app/dashboard/page.tsx`

### Changes Made

1. Import Supabase client
2. Add userId state
3. Get authenticated user ID
4. Pass userId to VoiceCommandButton

### No UI Changes

- Maintains existing dashboard design
- Microphone button already existed
- Only added functionality

---

## ✅ Verification

- [x] User ID retrieved from Supabase
- [x] Microphone button visible
- [x] Wake word detection works
- [x] Voice commands processed
- [x] Actions executed
- [x] No UI changes
- [x] No errors

---

## 🎉 You're All Set!

**Open the dashboard and click the microphone button to get started! 🎤✨**

---

## 📞 Need Help?

1. **Check Console**: F12 → Console tab
2. **Check Microphone**: Ensure microphone is enabled
3. **Check Internet**: Ensure stable connection
4. **Check API Key**: Ensure OpenAI API key is valid
5. **Check Auth**: Ensure you're logged in

---

**Happy voice commanding! 🚀**
