/**
 * Holiday Detection Utility
 * Detects active holidays based on current date and returns themed content
 */

// Get the Nth weekday of a month (e.g., 2nd Sunday)
function getNthWeekday(year, month, weekday, n) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  let day = 1 + (weekday - firstWeekday + 7) % 7;
  day += (n - 1) * 7;
  const date = new Date(year, month, day);
  // Verify it's still in the same month
  if (date.getMonth() !== month) return null;
  return date;
}

// Get Mother's Day (2nd Sunday of May)
function getMothersDay(year) {
  return getNthWeekday(year, 4, 0, 2); // May = month 4 (0-indexed), Sunday = 0
}

// Get Father's Day (3rd Sunday of June)
function getFathersDay(year) {
  return getNthWeekday(year, 5, 0, 3); // June = month 5, Sunday = 0
}

// Holiday definitions with date ranges (month, day)
const holidays = [
  {
    id: 'mothers-day',
    name: "Mother's Day",
    emoji: '🌸',
    badge: "Mother's Day Special",
    title: 'A Song for Mom',
    subtitle: "She gave you everything. Now give her a song that says what words can't.",
    cta: "Create Mom's Song",
    emotion: 'heartfelt',
    // Date range: 14 days before to 3 days after
    getDateRange: (year) => {
      const mothersDay = getMothersDay(year);
      if (!mothersDay) return null;
      const start = new Date(mothersDay);
      start.setDate(start.getDate() - 14);
      const end = new Date(mothersDay);
      end.setDate(end.getDate() + 3);
      return { start, end, target: mothersDay };
    },
    colors: {
      accent: 'from-pink-400 to-rose-500',
      bgGradient: 'from-purple-900 via-pink-800 to-rose-600',
      glowColor: 'bg-pink-500/30',
      badgeBg: 'bg-pink-500/20',
      badgeText: 'text-pink-200'
    }
  },
  {
    id: 'fathers-day',
    name: "Father's Day",
    emoji: '👔',
    badge: "Father's Day Special",
    title: 'A Song for Dad',
    subtitle: 'The man who taught you everything. Now tell him what it means.',
    cta: "Create Dad's Song",
    emotion: 'heartfelt',
    getDateRange: (year) => {
      const fathersDay = getFathersDay(year);
      if (!fathersDay) return null;
      const start = new Date(fathersDay);
      start.setDate(start.getDate() - 14);
      const end = new Date(fathersDay);
      end.setDate(end.getDate() + 3);
      return { start, end, target: fathersDay };
    },
    colors: {
      accent: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-purple-900 via-blue-800 to-indigo-600',
      glowColor: 'bg-blue-500/30',
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-200'
    }
  },
  {
    id: 'graduation',
    name: 'Graduation Season',
    emoji: '🎓',
    badge: 'Graduation Season',
    title: 'Your Graduation Anthem',
    subtitle: 'From late nights to bright futures — this one\'s for you.',
    cta: 'Create Your Anthem',
    emotion: 'celebration',
    getDateRange: (year) => {
      // May 15 - June 30
      const start = new Date(year, 4, 15);
      const end = new Date(year, 5, 30);
      return { start, end, target: null };
    },
    colors: {
      accent: 'from-amber-400 to-purple-500',
      bgGradient: 'from-purple-900 via-amber-800 to-purple-600',
      glowColor: 'bg-amber-500/30',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-200'
    }
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    emoji: '💝',
    badge: "Valentine's Day",
    title: 'Love in Every Note',
    subtitle: "Not just a card. Not just flowers. A song only they understand.",
    cta: "Create Their Song",
    emotion: 'heartfelt',
    getDateRange: (year) => {
      const start = new Date(year, 1, 1); // Feb 1
      const end = new Date(year, 1, 16);  // Feb 16
      return { start, end, target: new Date(year, 1, 14) };
    },
    colors: {
      accent: 'from-rose-400 to-pink-500',
      bgGradient: 'from-purple-900 via-rose-800 to-pink-600',
      glowColor: 'bg-rose-500/30',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-200'
    }
  },
  {
    id: 'christmas',
    name: 'Christmas',
    emoji: '🎄',
    badge: 'Holiday Season',
    title: 'The Gift That Lasts',
    subtitle: "This Christmas, give them a song they'll play all year.",
    cta: 'Create Their Gift',
    emotion: 'celebration',
    getDateRange: (year) => {
      const start = new Date(year, 11, 10); // Dec 10
      const end = new Date(year, 11, 31);   // Dec 31
      return { start, end, target: new Date(year, 11, 25) };
    },
    colors: {
      accent: 'from-red-400 to-green-500',
      bgGradient: 'from-purple-900 via-red-800 to-green-600',
      glowColor: 'bg-red-500/30',
      badgeBg: 'bg-red-500/20',
      badgeText: 'text-red-200'
    }
  },
  {
    id: 'birthday',
    name: 'Birthday',
    emoji: '🎂',
    badge: 'Make It Special',
    title: 'Their Birthday, Their Song',
    subtitle: 'Make their birthday unforgettable with a song written just for them.',
    cta: 'Create Birthday Song',
    emotion: 'celebration',
    getDateRange: (year) => {
      // Year-round but lower priority than specific holidays
      return null; // No specific date range, fallback
    },
    colors: {
      accent: 'from-violet-400 to-pink-500',
      bgGradient: 'from-purple-900 via-pink-800 to-orange-600', // Default gradient
      glowColor: 'bg-purple-500/30',
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-200'
    }
  }
];

// Default/fallback theme
const defaultTheme = {
  id: 'default',
  emoji: '🎵',
  badge: null,
  title: 'A Song Only They Understand',
  subtitle: 'Turn your shared memories into a song they\'ll never forget',
  cta: 'Create Your Song',
  emotion: null,
  colors: {
    accent: 'from-pink-400 to-orange-500',
    bgGradient: 'from-purple-900 via-pink-800 to-orange-600',
    glowColor: 'bg-pink-500/30',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-200'
  }
};

/**
 * Get the currently active holiday based on today's date
 * Checks current year and next year for holidays that span years (like Christmas to New Year)
 */
export function getActiveHoliday() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Check current year and next year for active holidays
  for (const year of [currentYear, currentYear + 1]) {
    for (const holiday of holidays) {
      const range = holiday.getDateRange(year);
      if (!range) continue; // Skip holidays without date ranges (like birthday)
      
      if (now >= range.start && now <= range.end) {
        const daysUntil = range.target 
          ? Math.ceil((range.target - now) / (1000 * 60 * 60 * 24))
          : null;
        
        return {
          ...holiday,
          daysUntil: daysUntil > 0 ? daysUntil : (daysUntil === 0 ? 'Today!' : null),
          isPast: daysUntil !== null && daysUntil < 0,
          isToday: daysUntil === 0
        };
      }
    }
  }
  
  // Return birthday as default (year-round)
  return {
    ...holidays.find(h => h.id === 'birthday'),
    daysUntil: null,
    isPast: false,
    isToday: false
  };
}

/**
 * Get countdown message for the holiday
 */
export function getHolidayCountdown(holiday) {
  if (!holiday || !holiday.daysUntil) return null;
  
  if (holiday.isToday) {
    return "It's today!";
  }
  
  if (holiday.isPast) {
    return null; // Don't show countdown after holiday
  }
  
  if (holiday.daysUntil === 1) {
    return 'Tomorrow!';
  }
  
  return `${holiday.daysUntil} days away`;
}

export default {
  getActiveHoliday,
  getHolidayCountdown
};
