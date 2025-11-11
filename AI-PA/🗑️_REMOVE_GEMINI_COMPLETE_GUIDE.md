# 🗑️ Complete Guide to Remove Gemini API Key

## ✅ Current Status

**Good News:** Your project is already secure!
- ✅ No Gemini API key in `.env.local`
- ✅ No hardcoded credentials
- ✅ Genkit configured to use environment variables only

---

## 🎯 What You Can Do

### Option 1: Keep Genkit (Recommended if you use it)
**Status:** Already secure - no action needed
- Genkit will look for `GOOGLE_API_KEY` environment variable
- If not found, uses Application Default Credentials
- No API key exposed

### Option 2: Remove Genkit Completely
**If you don't use Gemini API at all:**
- Remove `@genkit-ai/google-genai` dependency
- Remove `src/ai/genkit.ts` file
- Update any imports

### Option 3: Disable Gemini Plugin
**If you use Genkit but not Gemini:**
- Remove `googleAI()` plugin from genkit.ts
- Keep Genkit for other purposes

---

## 🗑️ Option 2: Complete Removal Steps

### Step 1: Remove Genkit Dependency
```bash
npm uninstall @genkit-ai/google-genai genkit
```

### Step 2: Remove Genkit File
```bash
rm src/ai/genkit.ts
```

### Step 3: Find and Update Imports
Search for files importing genkit:
```bash
grep -r "from '@/ai/genkit'" src/
grep -r "from 'genkit'" src/
```

### Step 4: Remove or Update Imports
**Files that might import genkit:**
- `src/lib/ai/intent-classifier.ts` - Uses `ai.definePrompt()`
- Any other files using Genkit

### Step 5: Replace Genkit Usage
If you use Genkit for intent classification, replace with:
```typescript
// Instead of Genkit, use direct API call
export async function classifyIntent(text: string): Promise<Intent> {
  const response = await fetch('/api/ai/voice-automation/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  
  const data = await response.json();
  return data.intent;
}
```

---

## 🔍 Files Using Genkit

### Files to Check/Update:
1. **src/lib/ai/intent-classifier.ts**
   - Uses `ai.definePrompt()` from Genkit
   - Needs replacement if removing Genkit

2. **src/ai/flows/personalized-daily-plan.ts**
   - May use Genkit for AI generation
   - Check for `ai.` calls

3. **Any other files importing from `src/ai/genkit.ts`**
   - Search for imports

---

## 🔐 Verify No API Keys Exposed

### Check .env.local
```bash
cat .env.local
```
Should show:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
✅ No `GOOGLE_API_KEY` - Good!

### Check Git History
```bash
git log -S "GOOGLE_API_KEY" --oneline
git log -S "AIzaSy" --oneline
```
✅ No results - Good!

### Check Source Code
```bash
grep -r "GOOGLE_API_KEY" src/
grep -r "AIzaSy" src/
```
✅ No results - Good!

---

## 📋 Removal Checklist

### If Keeping Genkit:
- [x] No API key in `.env.local`
- [x] No hardcoded credentials
- [x] Genkit uses environment variables
- [x] Project is secure

### If Removing Genkit:
- [ ] Run `npm uninstall @genkit-ai/google-genai genkit`
- [ ] Delete `src/ai/genkit.ts`
- [ ] Find all imports of genkit
- [ ] Replace Genkit usage with alternatives
- [ ] Update `src/lib/ai/intent-classifier.ts`
- [ ] Test application
- [ ] Verify no broken imports
- [ ] Commit changes

---

## 🚀 Recommended Action

### For Your Project:
**Keep Genkit as-is** because:
1. ✅ No API key is exposed
2. ✅ Already configured securely
3. ✅ Uses environment variables only
4. ✅ No security risk

**If you want to remove it:**
1. Identify all Genkit usage
2. Replace with API calls
3. Remove dependencies
4. Test thoroughly

---

## 🔧 Alternative: Disable Gemini Plugin

If you want to keep Genkit but remove Gemini:

**File:** `src/ai/genkit.ts`
```typescript
import {genkit} from 'genkit';
// Remove this line:
// import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  // Remove this line:
  // plugins: [googleAI()],
  // Add other plugins if needed
});
```

---

## 📊 Summary

| Action | Status | Security |
|--------|--------|----------|
| **Keep Genkit** | ✅ Recommended | ✅ Secure |
| **Remove Genkit** | ⚠️ Complex | ✅ Secure |
| **Disable Gemini** | ✅ Simple | ✅ Secure |

---

## 🎯 Next Steps

1. **Decide:** Keep, remove, or disable Genkit?
2. **If keeping:** No action needed - already secure
3. **If removing:** Follow removal steps above
4. **If disabling:** Update `src/ai/genkit.ts`
5. **Test:** Verify application works
6. **Commit:** Push changes to git

---

## ✅ Conclusion

Your project is **SECURE**. No Gemini API keys are exposed.

**Recommendation:** Keep Genkit as-is since it's already configured securely and uses environment variables only.

---

**Last Updated:** 2025-11-08
**Status:** ✅ SECURE - NO ACTION REQUIRED

