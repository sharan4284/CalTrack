// App State — Central reactive state management
// Simple observable store pattern

const state = {
  // Auth
  user: null,
  profile: null,
  isAuthReady: false,

  // Theme
  theme: localStorage.getItem('caltrack_theme') || 'dark',

  // Current screen: 'landing', 'auth', 'onboarding', 'app', 'admin'
  screen: 'landing',

  // Active tab within app
  activeTab: 'dashboard',

  // Real-time data
  todayMeals: [],
  todayWater: { glasses: 0 },
  todaySteps: { steps: 0 },
  todayWorkouts: [],
  weightHistory: [],
  stepsHistory: [],
  pastMeals: [],
  measurementsHistory: [],
  goals: null,
  badges: [],
  personalRecords: [],
  activeAchievementCategory: 'all',
  streaks: [],
  activeWorkoutPlan: null,
  allUserWorkouts: [],

  // Computed daily totals (recalculated on meal changes)
  dailyTotals: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  },

  // Targets
  targets: {
    calories: 2200,
    protein: 140,
    carbs: 250,
    fat: 60,
    water: 8,
    steps: 10000
  },

  // Connection status
  syncStatus: 'connected', // 'connected', 'syncing', 'offline', 'error'

  // Notifications
  notifications: [],
  toasts: [],

  // Admin
  allUsers: [],

  // Active listeners cleanup
  _listeners: new Map(),
  _subscribers: new Set()
};

// Subscribe to state changes
export function subscribe(callback) {
  state._subscribers.add(callback);
  return () => state._subscribers.delete(callback);
}

// Notify all subscribers
function notify() {
  state._subscribers.forEach(cb => {
    try { cb(state); } catch (e) { console.error('State subscriber error:', e); }
  });
}

// Update state
export function setState(updates) {
  Object.assign(state, updates);

  // Recalculate daily totals when meals change
  if ('todayMeals' in updates) {
    const meals = state.todayMeals;
    state.dailyTotals = {
      calories: meals.reduce((s, m) => s + (m.totalCalories || 0), 0),
      protein: meals.reduce((s, m) => s + (m.totalProtein || 0), 0),
      carbs: meals.reduce((s, m) => s + (m.totalCarbs || 0), 0),
      fat: meals.reduce((s, m) => s + (m.totalFat || 0), 0),
      fiber: meals.reduce((s, m) => s + (m.totalFiber || 0), 0)
    };
  }

  notify();
}

// Get current state
export function getState() {
  return state;
}

// Toast notifications
let toastId = 0;
export function showToast(message, type = 'info', duration = 3000) {
  const id = ++toastId;
  const toast = { id, message, type, timestamp: Date.now() };
  state.toasts = [...state.toasts, toast];
  notify();

  setTimeout(() => {
    state.toasts = state.toasts.filter(t => t.id !== id);
    notify();
  }, duration);
}

// Store active listener cleanup function
export function registerListener(key, unsub) {
  // Clean up previous listener for this key
  if (state._listeners.has(key)) {
    state._listeners.get(key)();
  }
  state._listeners.set(key, unsub);
}

// Clean up all listeners
export function cleanupListeners() {
  state._listeners.forEach(unsub => unsub());
  state._listeners.clear();
}

// Apply theme
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('caltrack_theme', theme);
  setState({ theme });
}

// Toggle theme
export function toggleTheme() {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// Initialize theme from preference
export function initTheme() {
  const saved = localStorage.getItem('caltrack_theme');
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}
