const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const demoLogs = [
  {
    id: 1,
    userId: "demo-user",
    date: formatDate(today),
    createdAt: today.toISOString(),
    energy: 7,
    stress: 4,
    mood: 8,
    focus: 7,
    sleepQuality: 8,
    connection: 6,
    spiritualAlignment: 7,
    viceVaping: false,
    viceAlcohol: false,
    viceJunkFood: true,
    viceDoomScrolling: false,
    viceLateScreens: true,
    viceSkippedMeals: false,
    viceExcessCaffeine: true,
    dayType: "work",
    primaryEmotion: "focused",
    winCategory: "productivity",
    timeDrain: "meetings",
    topWin: "Completed the feature overhaul for BruceOps",
    topFriction: "Too many context switches between tasks",
    tomorrowFocus: "Deploy to production and test everything",
    familyConnection: "Had dinner together as a family",
    faithAlignment: "Morning prayer and gratitude practice",
    driftCheck: "Staying aligned with priorities",
  }
];

export const demoIdeas = [
  {
    id: 1,
    userId: "demo-user",
    title: "AI-Powered Daily Journaling",
    pitch: "Build a journaling app that uses AI to identify patterns and provide insights on emotional trends over time.",
    category: "tech",
    captureMode: "deep",
    status: "promoted",
    audience: "Busy professionals who want self-improvement",
    painPoint: "Hard to maintain consistent journaling habits",
    excitement: 9,
    feasibility: 7,
    tinyTest: "Create a simple prompt-based journal for one week",
    realityCheck: { decision: "Strong potential. Personal development market is growing. Start with MVP." },
    milestones: ["Design UI", "Build backend", "Add AI analysis"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    userId: "demo-user",
    title: "Family Adventure Tracker",
    pitch: "An app to plan, track, and remember family adventures and outdoor activities.",
    category: "family",
    captureMode: "quick",
    status: "draft",
    tinyTest: "Track next 3 family outings manually",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    userId: "demo-user",
    title: "Scripture Memory System",
    pitch: "Spaced repetition system specifically designed for memorizing Bible verses with context.",
    category: "faith",
    captureMode: "quick",
    status: "reality-checked",
    realityCheck: { decision: "Good personal project. Could help others in faith community." },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const demoContent = [
  {
    id: 1,
    userId: "demo-user",
    contentType: "social",
    tone: "inspirational",
    template: "adventure-call",
    topic: "Weekend hiking adventures",
    generatedContent: "The trail calls to those who listen. This weekend, we ventured into the wild and found more than just beautiful views - we found ourselves. Nature has a way of stripping away the noise and revealing what truly matters. #HarrisWildlands #FamilyAdventure #NatureHeals",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
