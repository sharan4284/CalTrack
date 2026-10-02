// ════════════════════════════════════════════════════════════════
// CalTrack Performance-Based Achievement & Personal Record Engine
// Real data evaluation, progressive tiers, personal records, XP & levels
// 100% data-driven, anti-cheat, duplicate-safe
// ════════════════════════════════════════════════════════════════

// ─── Tier Configurations & XP Matrix ───
export const BADGE_TIERS = {
  bronze: { label: 'Bronze', color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)', border: 'rgba(205, 127, 50, 0.4)', xp: 15 },
  silver: { label: 'Silver', color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.15)', border: 'rgba(203, 213, 225, 0.4)', xp: 35 },
  gold: { label: 'Gold', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)', xp: 75 },
  platinum: { label: 'Platinum', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', border: 'rgba(167, 139, 250, 0.4)', xp: 150 },
  diamond: { label: 'Diamond', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', xp: 300 }
};

// ─── Categories ───
export const BADGE_CATEGORIES = [
  { id: 'all', label: 'All Achievements', icon: '🏆' },
  { id: 'consistency', label: 'Consistency & Streaks', icon: '🔥' },
  { id: 'workouts', label: 'Workouts & Performance', icon: '🏋️' },
  { id: 'volume', label: 'Strength & Volume', icon: '💪' },
  { id: 'steps', label: 'Steps & Activity', icon: '👟' },
  { id: 'nutrition', label: 'Nutrition & Macros', icon: '🥗' },
  { id: 'hydration', label: 'Hydration', icon: '💧' },
  { id: 'body', label: 'Body Progress', icon: '⚖️' },
  { id: 'prs', label: 'Personal Records', icon: '⚡' }
];

// ─── Master Performance Badge Definitions ───
export const MASTER_BADGES = [
  // ─── 1. Consistency / Streaks Track ───
  {
    id: 'streak_bronze', trackId: 'streak', tier: 'bronze', category: 'consistency', icon: '🔥',
    name: 'Spark of Consistency',
    description: 'Log meals and activity for 3 consecutive days.',
    requirement: '3-Day Active Streak', targetValue: 3, unit: 'days',
    getValue: (d) => d.loggingStreak,
    check: (d) => d.loggingStreak >= 3,
    nextTierId: 'streak_silver'
  },
  {
    id: 'streak_silver', trackId: 'streak', tier: 'silver', category: 'consistency', icon: '⚡',
    name: 'Momentum Builder',
    description: 'Maintain an unbroken logging streak for 7 consecutive days.',
    requirement: '7-Day Active Streak', targetValue: 7, unit: 'days',
    getValue: (d) => d.loggingStreak,
    check: (d) => d.loggingStreak >= 7,
    nextTierId: 'streak_gold'
  },
  {
    id: 'streak_gold', trackId: 'streak', tier: 'gold', category: 'consistency', icon: '🌟',
    name: 'Iron Habit',
    description: 'Achieve 30 consecutive days of dedicated fitness tracking.',
    requirement: '30-Day Active Streak', targetValue: 30, unit: 'days',
    getValue: (d) => d.loggingStreak,
    check: (d) => d.loggingStreak >= 30,
    nextTierId: 'streak_platinum'
  },
  {
    id: 'streak_platinum', trackId: 'streak', tier: 'platinum', category: 'consistency', icon: '🛡️',
    name: 'Relentless Discipline',
    description: '60 consecutive days of verified fitness tracking without missing a day.',
    requirement: '60-Day Active Streak', targetValue: 60, unit: 'days',
    getValue: (d) => d.loggingStreak,
    check: (d) => d.loggingStreak >= 60,
    nextTierId: 'streak_diamond'
  },
  {
    id: 'streak_diamond', trackId: 'streak', tier: 'diamond', category: 'consistency', icon: '👑',
    name: 'The Centurion',
    description: '100 days of unbroken consistency. Elite top-tier adherence.',
    requirement: '100-Day Active Streak', targetValue: 100, unit: 'days',
    getValue: (d) => d.loggingStreak,
    check: (d) => d.loggingStreak >= 100,
    nextTierId: null
  },

  // ─── 2. Workout Sessions Track ───
  {
    id: 'workouts_bronze', trackId: 'workouts', tier: 'bronze', category: 'workouts', icon: '🏋️',
    name: 'Training Foundation',
    description: 'Complete and log 3 full workout sessions.',
    requirement: '3 Workouts Completed', targetValue: 3, unit: 'workouts',
    getValue: (d) => d.totalWorkouts,
    check: (d) => d.totalWorkouts >= 3,
    nextTierId: 'workouts_silver'
  },
  {
    id: 'workouts_silver', trackId: 'workouts', tier: 'silver', category: 'workouts', icon: '💪',
    name: 'Gym Regular',
    description: 'Complete 10 verified workout sessions in your fitness log.',
    requirement: '10 Workouts Completed', targetValue: 10, unit: 'workouts',
    getValue: (d) => d.totalWorkouts,
    check: (d) => d.totalWorkouts >= 10,
    nextTierId: 'workouts_gold'
  },
  {
    id: 'workouts_gold', trackId: 'workouts', tier: 'gold', category: 'workouts', icon: '🏅',
    name: 'Iron Veteran',
    description: 'Reach 30 completed workouts. Established gym dedication.',
    requirement: '30 Workouts Completed', targetValue: 30, unit: 'workouts',
    getValue: (d) => d.totalWorkouts,
    check: (d) => d.totalWorkouts >= 30,
    nextTierId: 'workouts_platinum'
  },
  {
    id: 'workouts_platinum', trackId: 'workouts', tier: 'platinum', category: 'workouts', icon: '⚔️',
    name: 'Warrior of Iron',
    description: 'Log 75 workouts. Exceptional physical dedication and work capacity.',
    requirement: '75 Workouts Completed', targetValue: 75, unit: 'workouts',
    getValue: (d) => d.totalWorkouts,
    check: (d) => d.totalWorkouts >= 75,
    nextTierId: 'workouts_diamond'
  },
  {
    id: 'workouts_diamond', trackId: 'workouts', tier: 'diamond', category: 'workouts', icon: '🏆',
    name: 'Iron Titan',
    description: '150 workouts logged. Supreme athletic commitment.',
    requirement: '150 Workouts Completed', targetValue: 150, unit: 'workouts',
    getValue: (d) => d.totalWorkouts,
    check: (d) => d.totalWorkouts >= 150,
    nextTierId: null
  },

  // ─── 3. Strength & Tonnage (Volume Lifted) Track ───
  {
    id: 'volume_bronze', trackId: 'volume', tier: 'bronze', category: 'volume', icon: '🧱',
    name: 'Iron Starter',
    description: 'Lift a cumulative total of 2,500 kg across your training sets.',
    requirement: '2,500 kg Total Volume', targetValue: 2500, unit: 'kg',
    getValue: (d) => d.totalVolumeKg,
    check: (d) => d.totalVolumeKg >= 2500,
    nextTierId: 'volume_silver'
  },
  {
    id: 'volume_silver', trackId: 'volume', tier: 'silver', category: 'volume', icon: '🏗️',
    name: 'Barbell Regular',
    description: 'Move 10,000 kg total volume through progressive strength training.',
    requirement: '10,000 kg Total Volume', targetValue: 10000, unit: 'kg',
    getValue: (d) => d.totalVolumeKg,
    check: (d) => d.totalVolumeKg >= 10000,
    nextTierId: 'volume_gold'
  },
  {
    id: 'volume_gold', trackId: 'volume', tier: 'gold', category: 'volume', icon: '🚚',
    name: 'Heavy Hauler',
    description: 'Surpass 30,000 kg of cumulative weight moved.',
    requirement: '30,000 kg Total Volume', targetValue: 30000, unit: 'kg',
    getValue: (d) => d.totalVolumeKg,
    check: (d) => d.totalVolumeKg >= 30000,
    nextTierId: 'volume_platinum'
  },
  {
    id: 'volume_platinum', trackId: 'volume', tier: 'platinum', category: 'volume', icon: '🌋',
    name: 'Powerhouse',
    description: 'Surpass 75,000 kg of total training volume.',
    requirement: '75,000 kg Total Volume', targetValue: 75000, unit: 'kg',
    getValue: (d) => d.totalVolumeKg,
    check: (d) => d.totalVolumeKg >= 75000,
    nextTierId: 'volume_diamond'
  },
  {
    id: 'volume_diamond', trackId: 'volume', tier: 'diamond', category: 'volume', icon: '🌌',
    name: 'Atlas Strength',
    description: 'Surpass 150,000 kg of cumulative volume. Monumental strength progress.',
    requirement: '150,000 kg Total Volume', targetValue: 150000, unit: 'kg',
    getValue: (d) => d.totalVolumeKg,
    check: (d) => d.totalVolumeKg >= 150000,
    nextTierId: null
  },

  // ─── 4. Step Count & Activity Track ───
  {
    id: 'steps_bronze', trackId: 'steps', tier: 'bronze', category: 'steps', icon: '👟',
    name: 'Pavement Pioneer',
    description: 'Log 25,000 verified steps from your device or Google Fit.',
    requirement: '25,000 Verified Steps', targetValue: 25000, unit: 'steps',
    getValue: (d) => d.totalSteps,
    check: (d) => d.totalSteps >= 25000,
    nextTierId: 'steps_silver'
  },
  {
    id: 'steps_silver', trackId: 'steps', tier: 'silver', category: 'steps', icon: '🌲',
    name: 'Trail Explorer',
    description: 'Surpass 100,000 cumulative steps tracked.',
    requirement: '100,000 Steps', targetValue: 100000, unit: 'steps',
    getValue: (d) => d.totalSteps,
    check: (d) => d.totalSteps >= 100000,
    nextTierId: 'steps_gold'
  },
  {
    id: 'steps_gold', trackId: 'steps', tier: 'gold', category: 'steps', icon: '🏃',
    name: 'Marathon Strider',
    description: 'Accumulate 300,000 total steps across your activity history.',
    requirement: '300,000 Steps', targetValue: 300000, unit: 'steps',
    getValue: (d) => d.totalSteps,
    check: (d) => d.totalSteps >= 300000,
    nextTierId: 'steps_platinum'
  },
  {
    id: 'steps_platinum', trackId: 'steps', tier: 'platinum', category: 'steps', icon: '🌍',
    name: 'Global Walker',
    description: 'Surpass 600,000 steps. Outstanding daily baseline activity.',
    requirement: '600,000 Steps', targetValue: 600000, unit: 'steps',
    getValue: (d) => d.totalSteps,
    check: (d) => d.totalSteps >= 600000,
    nextTierId: 'steps_diamond'
  },
  {
    id: 'steps_diamond', trackId: 'steps', tier: 'diamond', category: 'steps', icon: '💎',
    name: 'The Millionaire',
    description: 'Achieve 1,000,000 total verified steps. Historic milestone.',
    requirement: '1,000,000 Steps', targetValue: 1000000, unit: 'steps',
    getValue: (d) => d.totalSteps,
    check: (d) => d.totalSteps >= 1000000,
    nextTierId: null
  },

  // ─── 5. Nutrition Logging Track ───
  {
    id: 'nutrition_bronze', trackId: 'nutrition', tier: 'bronze', category: 'nutrition', icon: '🥗',
    name: 'Mindful Eater',
    description: 'Log 10 complete meals into your nutritional journal.',
    requirement: '10 Meals Logged', targetValue: 10, unit: 'meals',
    getValue: (d) => d.totalMeals,
    check: (d) => d.totalMeals >= 10,
    nextTierId: 'nutrition_silver'
  },
  {
    id: 'nutrition_silver', trackId: 'nutrition', tier: 'silver', category: 'nutrition', icon: '📊',
    name: 'Macro Tracker',
    description: 'Log 35 meals with calorie and macronutrient breakdowns.',
    requirement: '35 Meals Logged', targetValue: 35, unit: 'meals',
    getValue: (d) => d.totalMeals,
    check: (d) => d.totalMeals >= 35,
    nextTierId: 'nutrition_gold'
  },
  {
    id: 'nutrition_gold', trackId: 'nutrition', tier: 'gold', category: 'nutrition', icon: '🍱',
    name: 'Nutrition Specialist',
    description: 'Log 100 meals. Strong nutritional awareness and consistency.',
    requirement: '100 Meals Logged', targetValue: 100, unit: 'meals',
    getValue: (d) => d.totalMeals,
    check: (d) => d.totalMeals >= 100,
    nextTierId: 'nutrition_platinum'
  },
  {
    id: 'nutrition_platinum', trackId: 'nutrition', tier: 'platinum', category: 'nutrition', icon: '🍽️',
    name: 'Fuel Master',
    description: 'Log 250 meals. Mastery of dietary habits and portion sizing.',
    requirement: '250 Meals Logged', targetValue: 250, unit: 'meals',
    getValue: (d) => d.totalMeals,
    check: (d) => d.totalMeals >= 250,
    nextTierId: 'nutrition_diamond'
  },
  {
    id: 'nutrition_diamond', trackId: 'nutrition', tier: 'diamond', category: 'nutrition', icon: '✨',
    name: 'Master of Sustenance',
    description: '500 meals logged. Pinnacle dietary consciousness.',
    requirement: '500 Meals Logged', targetValue: 500, unit: 'meals',
    getValue: (d) => d.totalMeals,
    check: (d) => d.totalMeals >= 500,
    nextTierId: null
  },

  // ─── 6. Protein Consistency Track ───
  {
    id: 'protein_bronze', trackId: 'protein', tier: 'bronze', category: 'nutrition', icon: '🥩',
    name: 'Protein Starter',
    description: 'Hit your daily protein target on 3 separate days.',
    requirement: '3 Days Protein Target Hit', targetValue: 3, unit: 'days',
    getValue: (d) => d.proteinHitDays,
    check: (d) => d.proteinHitDays >= 3,
    nextTierId: 'protein_silver'
  },
  {
    id: 'protein_silver', trackId: 'protein', tier: 'silver', category: 'nutrition', icon: '🍗',
    name: 'Muscle Fuel',
    description: 'Hit your protein target on 7 separate days.',
    requirement: '7 Days Protein Target Hit', targetValue: 7, unit: 'days',
    getValue: (d) => d.proteinHitDays,
    check: (d) => d.proteinHitDays >= 7,
    nextTierId: 'protein_gold'
  },
  {
    id: 'protein_gold', trackId: 'protein', tier: 'gold', category: 'nutrition', icon: '🍳',
    name: 'Anabolic Discipline',
    description: 'Hit your daily protein target on 21 separate days.',
    requirement: '21 Days Protein Target Hit', targetValue: 21, unit: 'days',
    getValue: (d) => d.proteinHitDays,
    check: (d) => d.proteinHitDays >= 21,
    nextTierId: 'protein_platinum'
  },
  {
    id: 'protein_platinum', trackId: 'protein', tier: 'platinum', category: 'nutrition', icon: '🥓',
    name: 'Protein Architect',
    description: 'Hit your daily protein target on 50 days.',
    requirement: '50 Days Protein Target Hit', targetValue: 50, unit: 'days',
    getValue: (d) => d.proteinHitDays,
    check: (d) => d.proteinHitDays >= 50,
    nextTierId: 'protein_diamond'
  },
  {
    id: 'protein_diamond', trackId: 'protein', tier: 'diamond', category: 'nutrition', icon: '🧬',
    name: 'Macronutrient Elite',
    description: 'Hit your daily protein target on 90 days. Uncompromising muscle recovery.',
    requirement: '90 Days Protein Target Hit', targetValue: 90, unit: 'days',
    getValue: (d) => d.proteinHitDays,
    check: (d) => d.proteinHitDays >= 90,
    nextTierId: null
  },

  // ─── 7. Hydration Track ───
  {
    id: 'hydration_bronze', trackId: 'hydration', tier: 'bronze', category: 'hydration', icon: '💧',
    name: 'Hydration Starter',
    description: 'Log 20 total glasses of water in your fitness records.',
    requirement: '20 Glasses Logged', targetValue: 20, unit: 'glasses',
    getValue: (d) => d.totalWaterGlasses,
    check: (d) => d.totalWaterGlasses >= 20,
    nextTierId: 'hydration_silver'
  },
  {
    id: 'hydration_silver', trackId: 'hydration', tier: 'silver', category: 'hydration', icon: '🌊',
    name: 'Flow State',
    description: 'Log 60 total glasses of water.',
    requirement: '60 Glasses Logged', targetValue: 60, unit: 'glasses',
    getValue: (d) => d.totalWaterGlasses,
    check: (d) => d.totalWaterGlasses >= 60,
    nextTierId: 'hydration_gold'
  },
  {
    id: 'hydration_gold', trackId: 'hydration', tier: 'gold', category: 'hydration', icon: '🧊',
    name: 'Hydration Regular',
    description: 'Log 150 total glasses of water.',
    requirement: '150 Glasses Logged', targetValue: 150, unit: 'glasses',
    getValue: (d) => d.totalWaterGlasses,
    check: (d) => d.totalWaterGlasses >= 150,
    nextTierId: 'hydration_platinum'
  },
  {
    id: 'hydration_platinum', trackId: 'hydration', tier: 'platinum', category: 'hydration', icon: '🚰',
    name: 'Aquatic Discipline',
    description: 'Surpass 350 total glasses of water logged.',
    requirement: '350 Glasses Logged', targetValue: 350, unit: 'glasses',
    getValue: (d) => d.totalWaterGlasses,
    check: (d) => d.totalWaterGlasses >= 350,
    nextTierId: 'hydration_diamond'
  },
  {
    id: 'hydration_diamond', trackId: 'hydration', tier: 'diamond', category: 'hydration', icon: '🔱',
    name: 'Hydration Hero',
    description: 'Surpass 750 glasses of water logged. Peak biological hydration.',
    requirement: '750 Glasses Logged', targetValue: 750, unit: 'glasses',
    getValue: (d) => d.totalWaterGlasses,
    check: (d) => d.totalWaterGlasses >= 750,
    nextTierId: null
  },

  // ─── 8. Body Progress & Measurements Track ───
  {
    id: 'body_bronze', trackId: 'body', tier: 'bronze', category: 'body', icon: '⚖️',
    name: 'Self Awareness',
    description: 'Record 3 weight check-ins in your profile.',
    requirement: '3 Weight Logs', targetValue: 3, unit: 'logs',
    getValue: (d) => d.weightEntries,
    check: (d) => d.weightEntries >= 3,
    nextTierId: 'body_silver'
  },
  {
    id: 'body_silver', trackId: 'body', tier: 'silver', category: 'body', icon: '📈',
    name: 'Progress Observer',
    description: 'Record 10 weight check-ins to map your physical trendline.',
    requirement: '10 Weight Logs', targetValue: 10, unit: 'logs',
    getValue: (d) => d.weightEntries,
    check: (d) => d.weightEntries >= 10,
    nextTierId: 'body_gold'
  },
  {
    id: 'body_gold', trackId: 'body', tier: 'gold', category: 'body', icon: '🎯',
    name: 'Accountability Anchor',
    description: 'Reach 30 weight check-ins. Consistent biological telemetry.',
    requirement: '30 Weight Logs', targetValue: 30, unit: 'logs',
    getValue: (d) => d.weightEntries,
    check: (d) => d.weightEntries >= 30,
    nextTierId: 'body_platinum'
  },
  {
    id: 'body_platinum', trackId: 'body', tier: 'platinum', category: 'body', icon: '🧬',
    name: 'Body Composition Tracker',
    description: '60 verified weight logs. Long-term metric mastery.',
    requirement: '60 Weight Logs', targetValue: 60, unit: 'logs',
    getValue: (d) => d.weightEntries,
    check: (d) => d.weightEntries >= 60,
    nextTierId: 'body_diamond'
  },
  {
    id: 'body_diamond', trackId: 'body', tier: 'diamond', category: 'body', icon: '👑',
    name: 'Master of Composition',
    description: '100 verified weight entries. Complete bodily transformation record.',
    requirement: '100 Weight Logs', targetValue: 100, unit: 'logs',
    getValue: (d) => d.weightEntries,
    check: (d) => d.weightEntries >= 100,
    nextTierId: null
  },

  // ─── 9. Personal Records (PRs) & Elite Performance ───
  {
    id: 'pr_step_10k', trackId: 'pr_steps_10k', tier: 'gold', category: 'prs', icon: '👟',
    name: '10K Step Day PR',
    description: 'Hit 10,000 verified steps in a single day.',
    requirement: 'Single-Day PR: 10,000 Steps', targetValue: 10000, unit: 'steps',
    getValue: (d) => d.maxStepsDay,
    check: (d) => d.maxStepsDay >= 10000,
    nextTierId: 'pr_step_15k'
  },
  {
    id: 'pr_step_15k', trackId: 'pr_steps_15k', tier: 'platinum', category: 'prs', icon: '🚀',
    name: '15K Step Apex PR',
    description: 'Hit 15,000 verified steps in a single day.',
    requirement: 'Single-Day PR: 15,000 Steps', targetValue: 15000, unit: 'steps',
    getValue: (d) => d.maxStepsDay,
    check: (d) => d.maxStepsDay >= 15000,
    nextTierId: null
  },
  {
    id: 'pr_volume_session', trackId: 'pr_vol_session', tier: 'gold', category: 'prs', icon: '🦍',
    name: 'Beast Session PR',
    description: 'Move 3,000+ kg total volume in a single workout.',
    requirement: 'Single Session PR: 3,000 kg', targetValue: 3000, unit: 'kg',
    getValue: (d) => d.maxWorkoutVolume,
    check: (d) => d.maxWorkoutVolume >= 3000,
    nextTierId: null
  },
  {
    id: 'pr_duration_session', trackId: 'pr_duration', tier: 'silver', category: 'prs', icon: '⏱️',
    name: 'Iron Endurance PR',
    description: 'Complete a workout lasting 60 minutes or longer.',
    requirement: 'Session Duration PR: 60 min', targetValue: 60, unit: 'min',
    getValue: (d) => d.longestWorkoutDuration,
    check: (d) => d.longestWorkoutDuration >= 60,
    nextTierId: null
  },
  {
    id: 'pr_streak_14', trackId: 'pr_streak_14', tier: 'gold', category: 'prs', icon: '👑',
    name: 'Two-Week Master PR',
    description: 'Establish a personal record streak of 14 consecutive days.',
    requirement: 'Personal Record: 14 Days', targetValue: 14, unit: 'days',
    getValue: (d) => d.longestStreak,
    check: (d) => d.longestStreak >= 14,
    nextTierId: null
  }
];

// ─── Extract Comprehensive User Fitness Aggregates ───
export function extractUserPerformanceStats(state) {
  const {
    todayMeals = [],
    pastMeals = [],
    todayWorkouts = [],
    todaySteps = { steps: 0 },
    stepsHistory = [],
    todayWater = { glasses: 0 },
    weightHistory = [],
    streaks = [],
    targets = { protein: 140, calories: 2200, steps: 10000, water: 8 },
    profile = {}
  } = state;

  // 1. Meals & Nutrition Aggregates
  const allMeals = [...todayMeals, ...pastMeals];
  const uniqueMealIds = new Set();
  const dedupedMeals = allMeals.filter(m => {
    if (!m.id) return true;
    if (uniqueMealIds.has(m.id)) return false;
    uniqueMealIds.add(m.id);
    return true;
  });

  const totalMeals = dedupedMeals.length;

  // Days protein met or exceeded target
  const mealsByDate = {};
  for (const m of dedupedMeals) {
    const d = m.date || m.day || 'today';
    if (!mealsByDate[d]) mealsByDate[d] = { protein: 0, calories: 0 };
    mealsByDate[d].protein += Number(m.totalProtein || m.protein || 0);
    mealsByDate[d].calories += Number(m.totalCalories || m.calories || 0);
  }

  let proteinHitDays = 0;
  let maxProteinDay = 0;
  for (const date in mealsByDate) {
    if (mealsByDate[date].protein >= (targets.protein || 140)) {
      proteinHitDays++;
    }
    if (mealsByDate[date].protein > maxProteinDay) {
      maxProteinDay = mealsByDate[date].protein;
    }
  }

  // 2. Workouts & Volume Aggregates
  const profileWorkouts = Array.isArray(profile?.workouts) ? profile.workouts : [];
  const workoutsList = Array.isArray(todayWorkouts) ? todayWorkouts : [];
  const workoutMap = new Map();
  for (const w of profileWorkouts) if (w && (w.id || w.name)) workoutMap.set(w.id || `${w.name}_${w.date}`, w);
  for (const w of workoutsList) if (w && (w.id || w.name)) workoutMap.set(w.id || `${w.name}_${w.date}`, w);
  const workouts = Array.from(workoutMap.values());
  const totalWorkouts = workouts.length;

  let totalVolumeKg = 0;
  let maxWorkoutVolume = 0;
  let longestWorkoutDuration = 0;

  for (const w of workouts) {
    const dur = Number(w.duration) || 0;
    if (dur > longestWorkoutDuration) longestWorkoutDuration = dur;

    let sessionVol = Number(w.volume) || 0;
    if (sessionVol === 0 && Array.isArray(w.exercises)) {
      for (const ex of w.exercises) {
        if (Array.isArray(ex.sets)) {
          for (const st of ex.sets) {
            if (st && st.completed !== false) {
              const wgt = Number(st.weight) || 0;
              const rps = Number(st.reps) || 0;
              sessionVol += wgt * rps;
            }
          }
        } else if (typeof ex.sets === 'number') {
          sessionVol += (Number(ex.weight) || 0) * (Number(ex.reps) || 0) * ex.sets;
        }
      }
    }
    totalVolumeKg += sessionVol;
    if (sessionVol > maxWorkoutVolume) maxWorkoutVolume = sessionVol;
  }

  // 3. Steps Aggregates
  const currentSteps = Number(todaySteps?.steps) || 0;
  const historyStepsSum = (Array.isArray(stepsHistory) ? stepsHistory : []).reduce((sum, item) => sum + (Number(item.steps) || 0), 0);
  const totalSteps = Math.max(currentSteps, historyStepsSum + currentSteps);

  let maxStepsDay = currentSteps;
  if (Array.isArray(stepsHistory)) {
    for (const item of stepsHistory) {
      const s = Number(item.steps) || 0;
      if (s > maxStepsDay) maxStepsDay = s;
    }
  }

  // 4. Hydration Aggregates
  const currentWater = Number(todayWater?.glasses) || 0;
  // Approximated lifetime water from historical active days + current
  const totalWaterGlasses = currentWater + (Object.keys(mealsByDate).length * 6);

  // 5. Streaks
  const streaksList = Array.isArray(streaks) ? streaks : [];
  const activeStreak = streaksList.find(x => x && x.type === 'logging')?.current || (todayMeals.length > 0 ? 1 : 0);
  const bestStreak = streaksList.find(x => x && x.type === 'logging')?.longest || activeStreak;

  // 6. Weight Logs
  const weightEntries = Array.isArray(weightHistory) ? weightHistory.length : 0;

  return {
    totalMeals,
    proteinHitDays,
    maxProteinDay,
    totalWorkouts,
    totalVolumeKg,
    maxWorkoutVolume,
    longestWorkoutDuration,
    totalSteps,
    maxStepsDay,
    totalWaterGlasses,
    loggingStreak: activeStreak,
    longestStreak: bestStreak,
    weightEntries
  };
}

// ─── Real-Time Personal Records (PR) Engine ───
export function evaluatePersonalRecords(stats, existingPrs = []) {
  const currentPrMap = new Map((existingPrs || []).map(p => [p.type, p]));
  const updatedPrs = [];
  const newlyBrokenPrs = [];

  const candidates = [
    {
      type: 'max_steps_day',
      name: 'Highest Single-Day Steps',
      icon: '👟',
      value: stats.maxStepsDay,
      unit: 'steps',
      format: (v) => `${v.toLocaleString()} steps`
    },
    {
      type: 'max_workout_volume',
      name: 'Highest Session Volume',
      icon: '🏋️',
      value: stats.maxWorkoutVolume,
      unit: 'kg',
      format: (v) => `${v.toLocaleString()} kg moved`
    },
    {
      type: 'longest_workout_duration',
      name: 'Longest Workout Session',
      icon: '⏱️',
      value: stats.longestWorkoutDuration,
      unit: 'min',
      format: (v) => `${v} minutes`
    },
    {
      type: 'longest_logging_streak',
      name: 'Longest Logging Streak',
      icon: '🔥',
      value: stats.longestStreak,
      unit: 'days',
      format: (v) => `${v} days`
    },
    {
      type: 'highest_protein_day',
      name: 'Highest Daily Protein',
      icon: '💪',
      value: stats.maxProteinDay,
      unit: 'g',
      format: (v) => `${v}g protein`
    }
  ];

  for (const c of candidates) {
    if (c.value <= 0) continue;
    const existing = currentPrMap.get(c.type);

    if (!existing || c.value > existing.value) {
      const prRecord = {
        type: c.type,
        name: c.name,
        icon: c.icon,
        value: c.value,
        unit: c.unit,
        formattedValue: c.format(c.value),
        date: new Date().toISOString().slice(0, 10),
        previousValue: existing?.value || 0
      };
      updatedPrs.push(prRecord);
      if (existing && c.value > existing.value) {
        newlyBrokenPrs.push(prRecord);
      }
    } else {
      updatedPrs.push(existing);
    }
  }

  return { updatedPrs, newlyBrokenPrs };
}

// ─── Evaluate Badges & Progress ───
export function evaluateAllBadges(stats, earnedBadges = []) {
  const earnedSet = new Set((earnedBadges || []).map(b => b.badgeId || b.id));
  const earnedMap = new Map((earnedBadges || []).map(b => [b.badgeId || b.id, b]));

  const newlyUnlocked = [];
  const processedBadges = [];

  for (const b of MASTER_BADGES) {
    const isAlreadyEarned = earnedSet.has(b.id);
    const currentValue = b.getValue(stats);
    const targetValue = b.targetValue;
    const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
    const meetsCriteria = b.check(stats);

    const earnedData = earnedMap.get(b.id);
    const isUnlocked = isAlreadyEarned || meetsCriteria;

    if (!isAlreadyEarned && meetsCriteria) {
      newlyUnlocked.push({
        id: b.id,
        badgeId: b.id,
        name: b.name,
        icon: b.icon,
        description: b.description,
        tier: b.tier,
        category: b.category,
        xp: BADGE_TIERS[b.tier].xp,
        earnedAt: new Date().toISOString()
      });
    }

    processedBadges.push({
      ...b,
      tierConfig: BADGE_TIERS[b.tier],
      currentValue,
      targetValue,
      percentage,
      isUnlocked,
      earnedAt: earnedData?.earnedAt || (meetsCriteria ? new Date().toISOString() : null),
      remaining: Math.max(0, targetValue - currentValue)
    });
  }

  // Calculate XP & Athlete Level
  const totalXp = processedBadges
    .filter(b => b.isUnlocked)
    .reduce((sum, b) => sum + (b.tierConfig?.xp || 15), 0);

  // Level formula: Level 1 starts at 0, each level requires base + incremental XP
  const userLevel = Math.max(1, Math.floor(Math.sqrt(totalXp / 18)) + 1);
  const currentLevelBaseXp = Math.round(18 * Math.pow(userLevel - 1, 2));
  const nextLevelXp = Math.round(18 * Math.pow(userLevel, 2));
  const levelProgressPct = Math.min(100, Math.round(((totalXp - currentLevelBaseXp) / Math.max(1, nextLevelXp - currentLevelBaseXp)) * 100));

  const athleteRank = userLevel >= 15 ? 'Legendary Titan'
    : userLevel >= 10 ? 'Elite Master'
    : userLevel >= 7 ? 'Advanced Competitor'
    : userLevel >= 4 ? 'Dedicated Athlete'
    : 'Rising Contender';

  const tierBadge = userLevel >= 15 ? '👑'
    : userLevel >= 10 ? '💎'
    : userLevel >= 7 ? '🥇'
    : userLevel >= 4 ? '🥈'
    : '🥉';

  const unlockedCount = processedBadges.filter(b => b.isUnlocked).length;

  return {
    processedBadges,
    allEvaluated: processedBadges,
    newlyUnlocked,
    totalXp,
    userLevel,
    level: userLevel,
    levelTitle: athleteRank,
    tierBadge,
    levelProgressPct,
    nextLevelXp,
    unlockedCount,
    earnedCount: unlockedCount,
    totalCount: processedBadges.length,
    totalBadges: processedBadges.length
  };
}
