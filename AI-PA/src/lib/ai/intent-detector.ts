export interface UserIntent {
  mood: 'relaxing' | 'energetic' | 'sad' | 'happy' | 'focus' | null;
  hero: string | null;
  timeContext: 'night' | 'morning' | 'travel' | null;
  language: 'english' | 'telugu' | 'hindi' | 'tamil' | null;
  playlistQuery: string;
  confidence: number;
}

const MOOD_KEYWORDS = {
  relaxing: [
    'relaxing',
    'chill',
    'calm',
    'peaceful',
    'sleep',
    'meditation',
    'soothing',
    'ambient',
  ],
  energetic: [
    'energetic',
    'energy',
    'pump',
    'workout',
    'gym',
    'running',
    'upbeat',
    'dance',
    'party',
  ],
  sad: ['sad', 'melancholy', 'emotional', 'heartbreak', 'breakup', 'cry', 'blues'],
  happy: ['happy', 'cheerful', 'uplifting', 'positive', 'joy', 'celebrate'],
  focus: ['focus', 'study', 'work', 'concentrate', 'productivity', 'deep work'],
};

const TIME_KEYWORDS = {
  night: ['night', 'sleep', 'bedtime', 'late', 'evening', 'dark'],
  morning: ['morning', 'wake', 'breakfast', 'sunrise', 'dawn'],
  travel: ['travel', 'drive', 'car', 'road', 'journey', 'commute', 'flight'],
};

const HERO_KEYWORDS = {
  telugu: [
    'prabhas',
    'mahesh',
    'ram',
    'allu',
    'ntr',
    'chiranjeevi',
    'balakrishna',
    'ravi',
    'teja',
  ],
  hindi: [
    'shah rukh',
    'salman',
    'aamir',
    'akshay',
    'hrithik',
    'ranveer',
    'ranbir',
    'varun',
  ],
  tamil: ['rajinikanth', 'kamal', 'vijay', 'ajith', 'suriya', 'dhanush'],
  english: ['drake', 'weeknd', 'travis', 'post malone', 'ed sheeran'],
};

const LANGUAGE_KEYWORDS = {
  telugu: ['telugu', 'tollywood', 'telugu songs', 'telugu music'],
  hindi: ['hindi', 'bollywood', 'hindi songs', 'hindi music'],
  tamil: ['tamil', 'kollywood', 'tamil songs', 'tamil music'],
};

export function detectUserIntent(text: string): UserIntent {
  const lowerText = text.toLowerCase();
  let mood: UserIntent['mood'] = null;
  let hero: string | null = null;
  let timeContext: UserIntent['timeContext'] = null;
  let language: UserIntent['language'] = null;
  let confidence = 0;

  // Detect mood
  for (const [moodType, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      mood = moodType as UserIntent['mood'];
      confidence += 0.3;
      break;
    }
  }

  // Detect time context
  for (const [timeType, keywords] of Object.entries(TIME_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      timeContext = timeType as UserIntent['timeContext'];
      confidence += 0.2;
      break;
    }
  }

  // Detect language
  for (const [lang, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      language = lang as UserIntent['language'];
      confidence += 0.15;
      break;
    }
  }

  // Detect hero
  for (const [heroLang, heroes] of Object.entries(HERO_KEYWORDS)) {
    for (const heroName of heroes) {
      if (lowerText.includes(heroName)) {
        hero = heroName;
        language = heroLang as UserIntent['language'];
        confidence += 0.35;
        break;
      }
    }
    if (hero) break;
  }

  // Generate playlist query
  const playlistQuery = generatePlaylistQuery({
    mood,
    hero,
    timeContext,
    language,
  });

  return {
    mood,
    hero,
    timeContext,
    language,
    playlistQuery,
    confidence: Math.min(1, confidence),
  };
}

function generatePlaylistQuery(intent: {
  mood: UserIntent['mood'];
  hero: string | null;
  timeContext: UserIntent['timeContext'];
  language: UserIntent['language'];
}): string {
  const parts: string[] = [];

  if (intent.hero) {
    parts.push(intent.hero);
  }

  if (intent.language === 'telugu') {
    parts.push('telugu');
  } else if (intent.language === 'hindi') {
    parts.push('hindi');
  } else if (intent.language === 'tamil') {
    parts.push('tamil');
  }

  if (intent.mood === 'relaxing') {
    parts.push('relaxing', 'chill');
  } else if (intent.mood === 'energetic') {
    parts.push('energetic', 'upbeat');
  } else if (intent.mood === 'sad') {
    parts.push('sad', 'emotional');
  } else if (intent.mood === 'happy') {
    parts.push('happy', 'uplifting');
  } else if (intent.mood === 'focus') {
    parts.push('focus', 'study');
  }

  if (intent.timeContext === 'night') {
    parts.push('night', 'sleep');
  } else if (intent.timeContext === 'morning') {
    parts.push('morning', 'energy');
  } else if (intent.timeContext === 'travel') {
    parts.push('travel', 'drive');
  }

  if (parts.length === 0) {
    return 'trending songs';
  }

  return parts.join(' ');
}

export function getCurrentTimeContext(): UserIntent['timeContext'] {
  const hour = new Date().getHours();

  if (hour >= 22 || hour < 6) {
    return 'night';
  } else if (hour >= 6 && hour < 12) {
    return 'morning';
  }

  return null;
}

