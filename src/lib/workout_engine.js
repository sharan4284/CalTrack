// Next-Gen AI Fitness Coach & 7-Day Adaptive Workout Engine
// Integrates Gemini AI plan generation with strict JSON schema validation,
// deterministic fallback split generator, progressive overload calculations,
// comeback mode, missed workout adaptation, and exercise substitutions.

import { EXERCISE_DATABASE, getExerciseById, calculate1RM, calculateWorkoutVolume, estimateCaloriesBurned } from './exercises.js';

// ─── Default 7-Day Plan Templates (Rule-Based Deterministic Engine) ───
export function generateDeterministic7DayPlan({
  goal = 'lose',
  fitnessLevel = 'beginner',
  equipment = 'dumbbells',
  durationMinutes = 45,
  name = 'Athlete'
}) {
  const dur = Number(durationMinutes) || 45;
  const isBeginner = fitnessLevel === 'beginner';
  const isAdvanced = fitnessLevel === 'advanced';

  // Filter pool by user's equipment
  const filterByEquipment = (exercises) => {
    if (equipment === 'bodyweight' || equipment === 'none') {
      return exercises.filter(e => e.equipment === 'bodyweight' || e.equipment === 'none');
    }
    if (equipment === 'dumbbells') {
      return exercises.filter(e => e.equipment === 'dumbbells' || e.equipment === 'bodyweight' || e.equipment === 'none');
    }
    if (equipment === 'barbell') {
      return exercises.filter(e => e.equipment === 'barbell' || e.equipment === 'bodyweight' || e.equipment === 'none');
    }
    return exercises; // full_gym or all
  };

  const getExercisesForMuscles = (muscles, count = 4) => {
    let matches = EXERCISE_DATABASE.filter(e => muscles.includes(e.muscle));
    let filtered = filterByEquipment(matches);
    if (filtered.length < count) {
      // Fallback to bodyweight if equipment pool is small
      filtered = [...filtered, ...EXERCISE_DATABASE.filter(e => e.equipment === 'bodyweight' && muscles.includes(e.muscle))];
    }
    // Remove duplicates
    const unique = [];
    const ids = new Set();
    for (const ex of filtered) {
      if (!ids.has(ex.id)) {
        ids.add(ex.id);
        unique.push(ex);
      }
    }
    return unique.slice(0, count).map(ex => ({
      exerciseId: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      equipment: ex.equipment,
      sets: isBeginner ? 3 : isAdvanced ? 4 : 3,
      targetReps: goal === 'strength' ? '5–8' : goal === 'gain' ? '8–12' : '12–15',
      suggestedWeightKg: ex.equipment === 'bodyweight' || ex.equipment === 'none' ? 0 : (isBeginner ? 10 : 20),
      restSeconds: goal === 'strength' ? 90 : 60,
      difficulty: ex.difficulty || fitnessLevel,
      reason: `Targets ${ex.muscle} with ${ex.movementPattern.replace('_', ' ')} mechanics.`
    }));
  };

  let days = [];

  if (goal === 'gain' || goal === 'strength') {
    // Upper / Lower / Rest / Push / Pull / Legs / Active Recovery
    days = [
      {
        day: 1,
        title: 'Upper Body Power',
        type: 'strength',
        durationMinutes: dur,
        focus: ['chest', 'back', 'shoulders'],
        isRest: false,
        exercises: getExercisesForMuscles(['chest', 'back', 'shoulders'], 5)
      },
      {
        day: 2,
        title: 'Lower Body & Core Hypertrophy',
        type: 'strength',
        durationMinutes: dur,
        focus: ['legs', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['legs', 'core'], 5)
      },
      {
        day: 3,
        title: 'Active Mobility & Recovery',
        type: 'recovery',
        durationMinutes: 20,
        focus: ['mobility', 'cardio'],
        isRest: true,
        recoveryActivity: '20 min brisk walking, hip flexor stretches, and foam rolling',
        exercises: getExercisesForMuscles(['cardio'], 1)
      },
      {
        day: 4,
        title: 'Push Focus (Chest, Shoulders, Triceps)',
        type: 'strength',
        durationMinutes: dur,
        focus: ['chest', 'shoulders', 'arms'],
        isRest: false,
        exercises: getExercisesForMuscles(['chest', 'shoulders', 'arms'], 5)
      },
      {
        day: 5,
        title: 'Pull Focus (Back, Biceps, Core)',
        type: 'strength',
        durationMinutes: dur,
        focus: ['back', 'arms', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['back', 'arms', 'core'], 5)
      },
      {
        day: 6,
        title: 'Legs & Posterior Chain',
        type: 'strength',
        durationMinutes: dur,
        focus: ['legs'],
        isRest: false,
        exercises: getExercisesForMuscles(['legs'], 4)
      },
      {
        day: 7,
        title: 'Full Body Rest & Restoration',
        type: 'rest',
        durationMinutes: 15,
        focus: ['recovery'],
        isRest: true,
        recoveryActivity: 'Complete rest, hydration focus, and light breathing work',
        exercises: []
      }
    ];
  } else if (goal === 'endurance') {
    // Conditioning & Cardio Focused
    days = [
      {
        day: 1,
        title: 'Aerobic Base Conditioning',
        type: 'cardio',
        durationMinutes: dur,
        focus: ['cardio', 'legs'],
        isRest: false,
        exercises: getExercisesForMuscles(['cardio', 'legs'], 4)
      },
      {
        day: 2,
        title: 'Full Body Muscular Endurance',
        type: 'strength',
        durationMinutes: dur,
        focus: ['chest', 'back', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['chest', 'back', 'core'], 4)
      },
      {
        day: 3,
        title: 'Active Recovery Walk',
        type: 'recovery',
        durationMinutes: 25,
        focus: ['recovery'],
        isRest: true,
        recoveryActivity: 'Brisk outdoor walk & gentle stretching',
        exercises: getExercisesForMuscles(['cardio'], 1)
      },
      {
        day: 4,
        title: 'HIIT & Core Capacity',
        type: 'cardio',
        durationMinutes: Math.min(30, dur),
        focus: ['cardio', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['cardio', 'core'], 4)
      },
      {
        day: 5,
        title: 'Lower Body Stamina',
        type: 'strength',
        durationMinutes: dur,
        focus: ['legs', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['legs', 'core'], 4)
      },
      {
        day: 6,
        title: 'Long Sustained Cardio',
        type: 'cardio',
        durationMinutes: 40,
        focus: ['cardio'],
        isRest: false,
        exercises: getExercisesForMuscles(['cardio'], 2)
      },
      {
        day: 7,
        title: 'Full Rest & Glycogen Recovery',
        type: 'rest',
        durationMinutes: 15,
        focus: ['recovery'],
        isRest: true,
        recoveryActivity: 'Relaxation & hydration',
        exercises: []
      }
    ];
  } else {
    // Fat Loss / General Fitness / Maintenance (Balanced Split)
    days = [
      {
        day: 1,
        title: 'Full Body Strength & Metabolism',
        type: 'strength',
        durationMinutes: dur,
        focus: ['chest', 'legs', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['chest', 'legs', 'core'], 4)
      },
      {
        day: 2,
        title: 'Conditioning & Core Burner',
        type: 'cardio',
        durationMinutes: Math.min(35, dur),
        focus: ['cardio', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['cardio', 'core'], 4)
      },
      {
        day: 3,
        title: 'Active Recovery & Mobility',
        type: 'recovery',
        durationMinutes: 20,
        focus: ['recovery'],
        isRest: true,
        recoveryActivity: '30-minute steady-state walking and light hamstring/hip stretches',
        exercises: getExercisesForMuscles(['cardio'], 1)
      },
      {
        day: 4,
        title: 'Upper Body Tone & Posture',
        type: 'strength',
        durationMinutes: dur,
        focus: ['back', 'shoulders', 'arms'],
        isRest: false,
        exercises: getExercisesForMuscles(['back', 'shoulders', 'arms'], 4)
      },
      {
        day: 5,
        title: 'Lower Body & Glute Sculpt',
        type: 'strength',
        durationMinutes: dur,
        focus: ['legs', 'core'],
        isRest: false,
        exercises: getExercisesForMuscles(['legs', 'core'], 4)
      },
      {
        day: 6,
        title: 'Cardio Intervals & Calorie Burn',
        type: 'cardio',
        durationMinutes: 30,
        focus: ['cardio'],
        isRest: false,
        exercises: getExercisesForMuscles(['cardio'], 3)
      },
      {
        day: 7,
        title: 'Rest & Mental Restoration',
        type: 'rest',
        durationMinutes: 15,
        focus: ['recovery'],
        isRest: true,
        recoveryActivity: 'Full physical rest, hydration, and meal prep for the week ahead',
        exercises: []
      }
    ];
  }

  return {
    id: 'plan_' + Date.now(),
    generatedAt: new Date().toISOString(),
    engine: 'deterministic_smart_rules',
    planTitle: `${goal === 'lose' ? 'Metabolic Fat Loss' : goal === 'gain' ? 'Hypertrophy Power Split' : 'Athletic Longevity'} 7-Day Plan`,
    goal,
    fitnessLevel,
    equipment,
    durationMinutes: dur,
    totalWorkouts: days.filter(d => !d.isRest).length,
    averageDuration: Math.round(days.reduce((acc, d) => acc + d.durationMinutes, 0) / 7),
    days
  };
}

// ─── Gemini AI 7-Day Plan Generator with Strict JSON Schema Validation ───
export async function generateGemini7DayPlan({
  apiKey,
  userProfile = {},
  recentWorkouts = []
}) {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const name = userProfile.name || 'Athlete';
  const goal = userProfile.goal || 'lose';
  const fitnessLevel = userProfile.fitnessLevel || 'intermediate';
  const equipment = userProfile.equipment || 'dumbbells';
  const duration = userProfile.workoutDuration || 45;

  const validExerciseIds = EXERCISE_DATABASE.map(e => e.id);

  const systemPrompt = `You are an elite, certified strength and conditioning coach and exercise physiologist.
Create a personalized 7-Day Workout Plan tailored strictly to this user profile:
- Name: ${name}
- Primary Fitness Goal: ${goal} (Options: fat loss, muscle gain, strength, endurance, general fitness)
- Fitness Level: ${fitnessLevel} (Options: beginner, intermediate, advanced)
- Available Equipment: ${equipment} (Options: none/bodyweight, dumbbells, barbell, machines, full gym)
- Preferred Workout Duration: ${duration} minutes
- Recent Workouts Logged: ${recentWorkouts.length} in history

CRITICAL RULES:
1. ONLY pick exercises from this verified database: [${validExerciseIds.join(', ')}]. Do NOT invent exercise IDs.
2. Structure the 7 days logically with progressive load and adequate muscle recovery (e.g. 4-5 training days, 2-3 active recovery/rest days).
3. Output strictly valid JSON matching this exact schema:
{
  "planTitle": "string (motivating title)",
  "goal": "${goal}",
  "fitnessLevel": "${fitnessLevel}",
  "duration": 7,
  "days": [
    {
      "day": 1,
      "title": "string (e.g. Upper Body Hypertrophy)",
      "type": "strength" | "cardio" | "recovery" | "rest",
      "durationMinutes": number,
      "focus": ["chest", "back"],
      "isRest": boolean,
      "recoveryActivity": "string (only if isRest is true)",
      "exercises": [
        {
          "exerciseId": "exact_id_from_list",
          "name": "Exact Name",
          "sets": number (e.g. 3),
          "targetReps": "string (e.g. 8-12)",
          "restSeconds": number (e.g. 60),
          "difficulty": "beginner" | "intermediate" | "advanced",
          "reason": "short explanation why this exercise fits goal"
        }
      ]
    }
  ]
}
Output raw JSON ONLY. No markdown ticks, no conversational filler.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 20,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response received from Gemini.');

  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse valid JSON from Gemini output.');

  const parsedPlan = JSON.parse(match[0]);

  // Strict Validation against local database
  if (!Array.isArray(parsedPlan.days) || parsedPlan.days.length !== 7) {
    throw new Error('Gemini plan does not contain exactly 7 days.');
  }

  // Sanitize each day and replace any hallucinated exercise IDs with verified exercises
  const sanitizedDays = parsedPlan.days.map((day, dIdx) => {
    const isRest = day.isRest === true || day.type === 'rest' || day.type === 'recovery';
    const exercises = isRest ? [] : (day.exercises || []).map(ex => {
      let verified = getExerciseById(ex.exerciseId);
      if (!verified) {
        // Fallback to nearest exercise by muscle
        verified = EXERCISE_DATABASE.find(e => e.muscle === (day.focus?.[0] || 'chest')) || EXERCISE_DATABASE[0];
      }
      return {
        exerciseId: verified.id,
        name: verified.name,
        muscle: verified.muscle,
        equipment: verified.equipment,
        sets: Number(ex.sets) || 3,
        targetReps: ex.targetReps || '10',
        suggestedWeightKg: verified.equipment === 'bodyweight' ? 0 : 15,
        restSeconds: Number(ex.restSeconds) || 60,
        difficulty: verified.difficulty || 'beginner',
        reason: ex.reason || `Targets ${verified.muscle}`
      };
    });

    return {
      day: day.day || (dIdx + 1),
      title: day.title || `Day ${dIdx + 1} Workout`,
      type: day.type || (isRest ? 'recovery' : 'strength'),
      durationMinutes: Number(day.durationMinutes) || (isRest ? 20 : 45),
      focus: Array.isArray(day.focus) ? day.focus : ['full_body'],
      isRest,
      recoveryActivity: day.recoveryActivity || (isRest ? 'Light walking & stretching' : null),
      exercises
    };
  });

  return {
    id: 'plan_gemini_' + Date.now(),
    generatedAt: new Date().toISOString(),
    engine: 'gemini_1.5_flash',
    planTitle: parsedPlan.planTitle || `${goal.toUpperCase()} 7-Day AI Plan`,
    goal,
    fitnessLevel,
    equipment,
    durationMinutes: Number(duration),
    totalWorkouts: sanitizedDays.filter(d => !d.isRest).length,
    averageDuration: Math.round(sanitizedDays.reduce((acc, d) => acc + d.durationMinutes, 0) / 7),
    days: sanitizedDays
  };
}

// ─── Unified 7-Day Plan Factory (Tries Gemini, safely falls back) ───
export async function createPersonalized7DayPlan({
  profile,
  recentWorkouts = [],
  apiKey = null,
  isGeminiConnected = false
}) {
  if (isGeminiConnected && apiKey) {
    try {
      const plan = await generateGemini7DayPlan({ apiKey, userProfile: profile, recentWorkouts });
      return plan;
    } catch (err) {
      console.warn('Gemini 7-day plan generation failed, falling back to smart rules:', err);
    }
  }

  // Fallback to deterministic rules
  return generateDeterministic7DayPlan({
    goal: profile?.goal || 'lose',
    fitnessLevel: profile?.fitnessLevel || 'intermediate',
    equipment: profile?.equipment || 'dumbbells',
    durationMinutes: profile?.workoutDuration || 45,
    name: profile?.name || 'Athlete'
  });
}

// ─── Adaptive Progressive Overload Engine ───
export function getAdaptiveWeightAndReps(exerciseId, recentWorkouts = [], goal = 'gain') {
  const ex = getExerciseById(exerciseId);
  const isBodyweight = ex?.equipment === 'bodyweight' || ex?.equipment === 'none';

  // Search historical sessions for this exercise
  let lastLoggedSets = null;
  for (const w of recentWorkouts) {
    if (!Array.isArray(w.exercises)) continue;
    const match = w.exercises.find(e => e.name === ex?.name || e.id === exerciseId);
    if (match && Array.isArray(match.sets) && match.sets.length > 0) {
      lastLoggedSets = match.sets;
      break;
    }
  }

  if (lastLoggedSets && lastLoggedSets.length > 0) {
    const highestWeight = Math.max(...lastLoggedSets.map(s => Number(s.weight) || 0));
    const avgReps = Math.round(lastLoggedSets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0) / lastLoggedSets.length);

    // If bodyweight
    if (isBodyweight) {
      return {
        previousWeight: 0,
        previousReps: avgReps,
        suggestedWeight: 0,
        suggestedReps: `${avgReps + 1}–${avgReps + 3}`,
        progressionReason: `Personal best: ${avgReps} reps. Pushing for +1–2 reps progressive overload.`
      };
    }

    // Weight overload increment (compound: +2.5kg, isolation: +1kg)
    const increment = ex?.category === 'strength' && (ex.muscle === 'legs' || ex.muscle === 'back' || ex.muscle === 'chest') ? 2.5 : 1.0;
    const nextWeight = highestWeight > 0 ? highestWeight + increment : 12;

    return {
      previousWeight: highestWeight,
      previousReps: avgReps,
      suggestedWeight: nextWeight,
      suggestedReps: goal === 'strength' ? '6–8' : '8–12',
      progressionReason: `Based on your previous ${highestWeight} kg × ${avgReps} reps, overload target is ${nextWeight} kg.`
    };
  }

  // Default baseline for new exercises
  const defaultWeight = isBodyweight ? 0 : (ex?.muscle === 'legs' ? 25 : ex?.muscle === 'chest' || ex?.muscle === 'back' ? 16 : 8);
  return {
    previousWeight: null,
    previousReps: null,
    suggestedWeight: defaultWeight,
    suggestedReps: goal === 'strength' ? '6–8' : '10–12',
    progressionReason: 'Introductory baseline weight to calibrate form.'
  };
}

// ─── "What Should I Train Today?" Coach Analyzer ───
export function whatShouldITrainToday({
  profile = {},
  recentWorkouts = [],
  activePlan = null
}) {
  const goal = profile.goal || 'lose';
  const name = profile.name || 'Athlete';

  // 1. Check for Comeback Mode (> 10 days since last workout)
  if (recentWorkouts.length > 0) {
    const lastWorkout = recentWorkouts[0];
    const lastDate = new Date(lastWorkout.date || lastWorkout.createdAt);
    const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays >= 10) {
      return {
        mode: 'comeback',
        headline: `Welcome Back, ${name}! 👋`,
        recommendation: `It's been ${diffDays} days since your last session. We'll ease you back into training with a lighter 25-minute Full Body re-activation session.`,
        suggestedWorkoutType: 'full_body_light',
        durationMinutes: 25,
        targetMuscles: ['full_body'],
        actionText: 'Start Comeback Session'
      };
    }
  }

  // 2. Check muscles trained yesterday/recently
  const musclesTrainedRecently = new Set();
  const last2Days = recentWorkouts.slice(0, 2);
  for (const w of last2Days) {
    if (Array.isArray(w.exercises)) {
      for (const ex of w.exercises) {
        if (ex.muscle) musclesTrainedRecently.add(ex.muscle);
      }
    }
  }

  // 3. Match against active 7-day plan if present
  if (activePlan && Array.isArray(activePlan.days)) {
    const todayDayOfWeek = new Date().getDay(); // 0 is Sunday
    const dayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // 0..6
    const plannedDay = activePlan.days[dayIndex] || activePlan.days[0];

    if (plannedDay.isRest) {
      return {
        mode: 'recovery',
        headline: 'Rest & Recovery Day 🧘',
        recommendation: `Your schedule has ${plannedDay.title} planned today. Take time to hydrate, do light mobility, and hit your protein target.`,
        suggestedWorkoutType: 'recovery',
        durationMinutes: 20,
        targetMuscles: ['mobility'],
        actionText: 'View Recovery Cues'
      };
    }

    return {
      mode: 'plan',
      headline: `Today: ${plannedDay.title} 💪`,
      recommendation: `Targeting ${plannedDay.focus.join(' & ')} for ~${plannedDay.durationMinutes} minutes (${plannedDay.exercises.length} exercises).`,
      suggestedWorkoutType: plannedDay.type,
      durationMinutes: plannedDay.durationMinutes,
      targetMuscles: plannedDay.focus,
      exercises: plannedDay.exercises,
      actionText: 'Start Planned Workout'
    };
  }

  // 4. Intelligent recommendation if no plan is active
  if (musclesTrainedRecently.has('legs')) {
    return {
      mode: 'adaptive',
      headline: 'Upper Body & Core Day 🏋️',
      recommendation: 'Your legs worked hard recently. Today we focus on chest, back, and shoulders for balanced recovery.',
      suggestedWorkoutType: 'upper_body',
      durationMinutes: 40,
      targetMuscles: ['chest', 'back', 'shoulders'],
      actionText: 'Start Upper Body'
    };
  } else if (musclesTrainedRecently.has('chest') || musclesTrainedRecently.has('back')) {
    return {
      mode: 'adaptive',
      headline: 'Lower Body & Core Power 🦵',
      recommendation: 'Your upper body is resting today. Focus on legs, glutes, and posterior chain.',
      suggestedWorkoutType: 'lower_body',
      durationMinutes: 40,
      targetMuscles: ['legs', 'core'],
      actionText: 'Start Lower Body'
    };
  }

  return {
    mode: 'general',
    headline: 'Full Body Conditioning ⚡',
    recommendation: 'You are well-rested. A dynamic 35-minute full body resistance session will stimulate maximum metabolic burn.',
    suggestedWorkoutType: 'full_body',
    durationMinutes: 35,
    targetMuscles: ['chest', 'legs', 'core'],
    actionText: 'Start Full Body'
  };
}

// ─── Quick Workout Generator (5, 10, 15, 20, 30 min) ───
export function generateQuickWorkout({
  durationMinutes = 15,
  equipment = 'dumbbells',
  focus = 'full_body'
}) {
  const dur = Number(durationMinutes) || 15;
  const numExercises = dur <= 10 ? 3 : dur <= 15 ? 4 : dur <= 20 ? 5 : 6;

  let pool = EXERCISE_DATABASE;
  if (equipment === 'bodyweight' || equipment === 'none') {
    pool = pool.filter(e => e.equipment === 'bodyweight' || e.equipment === 'none');
  } else if (equipment === 'dumbbells') {
    pool = pool.filter(e => e.equipment === 'dumbbells' || e.equipment === 'bodyweight' || e.equipment === 'none');
  }

  // Pick across varied muscle groups
  const selected = [];
  const musclesWanted = ['legs', 'chest', 'back', 'core', 'cardio'];
  for (const m of musclesWanted) {
    if (selected.length >= numExercises) break;
    const match = pool.find(e => e.muscle === m && !selected.some(s => s.id === e.id));
    if (match) selected.push(match);
  }

  // Fill remaining if needed
  for (const e of pool) {
    if (selected.length >= numExercises) break;
    if (!selected.some(s => s.id === e.id)) selected.push(e);
  }

  const exercises = selected.map(ex => ({
    exerciseId: ex.id,
    name: ex.name,
    muscle: ex.muscle,
    equipment: ex.equipment,
    sets: dur <= 10 ? 2 : 3,
    targetReps: ex.category === 'cardio' ? '45s' : '10–12',
    suggestedWeightKg: ex.equipment === 'bodyweight' ? 0 : 12,
    restSeconds: 45,
    difficulty: ex.difficulty || 'beginner'
  }));

  return {
    id: 'quick_wk_' + Date.now(),
    title: `⚡ ${dur}-Min Quick ${focus === 'core' ? 'Core' : 'Full Body'} Burner`,
    durationMinutes: dur,
    caloriesBurned: Math.round(7.5 * 70 * (dur / 60)),
    exercises
  };
}

// ─── Exercise Substitution Engine ───
export function getExerciseSubstitutes(exerciseId, userEquipment = 'all') {
  const currentEx = getExerciseById(exerciseId);
  if (!currentEx) return [];

  // 1. Direct predefined substitutions
  const directIds = currentEx.substitutions || [];
  const directMatches = directIds.map(id => getExerciseById(id)).filter(Boolean);

  // 2. Movement pattern and target muscle matches
  const sameMuscleAndPattern = EXERCISE_DATABASE.filter(e =>
    e.id !== exerciseId &&
    !directIds.includes(e.id) &&
    (e.muscle === currentEx.muscle || e.movementPattern === currentEx.movementPattern)
  );

  let combined = [...directMatches, ...sameMuscleAndPattern];

  // Filter by user equipment if specified
  if (userEquipment === 'bodyweight' || userEquipment === 'none') {
    combined = combined.filter(e => e.equipment === 'bodyweight' || e.equipment === 'none');
  } else if (userEquipment === 'dumbbells') {
    combined = combined.filter(e => e.equipment === 'dumbbells' || e.equipment === 'bodyweight' || e.equipment === 'none');
  }

  return combined.slice(0, 5);
}
