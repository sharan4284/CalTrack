// Database Service — Firestore CRUD + Realtime Listeners
// Fully compatible with existing deployed Firestore security rules
// Uses:
//  - 'entries' for meals (compatible with legacy records & new logs)
//  - 'vitals' for hydration, weight, steps & daily status
//  - 'users/{uid}' for user profile, targets/goals, workouts, badges, streaks, measurements & custom foods

import { db, storage } from './firebase.js';
import {
  doc, collection, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from './firebase.js';

// ─── Helpers ───
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function dateStr(date) {
  return date.toISOString().slice(0, 10);
}

export function pastDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// ─── CLOUD STORAGE ───
export async function uploadMealImage(userId, fileOrDataUrl) {
  if (!userId || !fileOrDataUrl) return null;
  try {
    const filename = `users/${userId}/meals/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      await uploadString(storageRef, fileOrDataUrl, 'data_url');
    } else {
      await uploadBytes(storageRef, fileOrDataUrl);
    }

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload error, falling back to data URL:', err);
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      return fileOrDataUrl;
    }
    return '';
  }
}

// ─── MEALS (Stored in 'entries' collection) ───

export async function addMeal(userId, mealData) {
  const date = mealData.date || todayStr();
  const cals = Number(mealData.totalCalories ?? mealData.calories ?? 0);
  const prot = Number(mealData.totalProtein ?? mealData.protein ?? 0);
  const carbs = Number(mealData.totalCarbs ?? mealData.carbs ?? 0);
  const fat = Number(mealData.totalFat ?? mealData.fat ?? 0);
  const fiber = Number(mealData.totalFiber ?? mealData.fiber ?? 0);

  const data = {
    uid: userId,
    userId,
    day: date,
    date,
    mealType: mealData.mealType || 'Lunch',
    type: mealData.mealType || 'Lunch',
    foods: mealData.foods || [],
    calories: cals,
    totalCalories: cals,
    protein: prot,
    totalProtein: prot,
    carbs,
    totalCarbs: carbs,
    fat,
    totalFat: fat,
    fiber,
    totalFiber: fiber,
    notes: mealData.notes || '',
    imageUrl: mealData.imageUrl || '',
    source: mealData.source || 'manual',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'entries'), data);
  return { id: ref.id, ...data };
}

export async function updateMeal(mealId, updates) {
  const patch = { ...updates, updatedAt: serverTimestamp() };
  if (updates.totalCalories !== undefined) patch.calories = updates.totalCalories;
  if (updates.totalProtein !== undefined) patch.protein = updates.totalProtein;
  if (updates.totalCarbs !== undefined) patch.carbs = updates.totalCarbs;
  if (updates.totalFat !== undefined) patch.fat = updates.totalFat;
  if (updates.totalFiber !== undefined) patch.fiber = updates.totalFiber;
  if (updates.date !== undefined) patch.day = updates.date;

  await updateDoc(doc(db, 'entries', mealId), patch);
}

export async function deleteMeal(mealId) {
  await deleteDoc(doc(db, 'entries', mealId));
}

function normalizeMealDoc(d) {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    totalCalories: Number(data.totalCalories ?? data.calories ?? 0),
    totalProtein: Number(data.totalProtein ?? data.protein ?? 0),
    totalCarbs: Number(data.totalCarbs ?? data.carbs ?? 0),
    totalFat: Number(data.totalFat ?? data.fat ?? 0),
    totalFiber: Number(data.totalFiber ?? data.fiber ?? 0),
    mealType: data.mealType || data.type || 'Meal',
    date: data.date || data.day || todayStr(),
    foods: Array.isArray(data.foods) ? data.foods : []
  };
}

export function onMealsToday(userId, callback) {
  const today = todayStr();
  const q = query(
    collection(db, 'entries'),
    where('uid', '==', userId),
    where('day', '==', today)
  );

  return onSnapshot(q, snap => {
    const meals = snap.docs.map(normalizeMealDoc);
    meals.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    callback(meals);
  }, err => {
    console.warn('onMealsToday listener error:', err);
    callback([]);
  });
}

export function onMealsRange(userId, startDate, endDate, callback) {
  const q = query(
    collection(db, 'entries'),
    where('uid', '==', userId)
  );

  return onSnapshot(q, snap => {
    const meals = snap.docs
      .map(normalizeMealDoc)
      .filter(m => m.date >= startDate && m.date <= endDate);
    callback(meals);
  }, err => {
    console.warn('onMealsRange listener error:', err);
    callback([]);
  });
}

export function onPastMeals(userId, days, callback) {
  const startDate = pastDateStr(days);
  const q = query(
    collection(db, 'entries'),
    where('uid', '==', userId)
  );

  return onSnapshot(q, snap => {
    const meals = snap.docs
      .map(normalizeMealDoc)
      .filter(m => m.date >= startDate);
    callback(meals);
  }, err => {
    console.warn('onPastMeals listener error:', err);
    callback([]);
  });
}

// ─── WATER, WEIGHT, STEPS (Stored in 'vitals' collection) ───

export async function logWater(userId, glasses) {
  const docId = `${userId}_${todayStr()}`;
  await setDoc(doc(db, 'vitals', docId), {
    uid: userId,
    userId,
    day: todayStr(),
    date: todayStr(),
    water: Number(glasses),
    glasses: Number(glasses),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function onWaterToday(userId, callback) {
  const docId = `${userId}_${todayStr()}`;
  return onSnapshot(doc(db, 'vitals', docId), snap => {
    const data = snap.data();
    callback({ glasses: Number(data?.water ?? data?.glasses ?? 0) });
  }, err => {
    console.warn('onWaterToday listener error:', err);
    callback({ glasses: 0 });
  });
}

export async function logWeight(userId, weight, unit = 'kg') {
  const docId = `${userId}_${todayStr()}`;
  await setDoc(doc(db, 'vitals', docId), {
    uid: userId,
    userId,
    day: todayStr(),
    date: todayStr(),
    weight: Number(weight),
    unit,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // Also update user profile with latest weight
  await setDoc(doc(db, 'users', userId), {
    weight: Number(weight),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function onWeightHistory(userId, days, callback) {
  const startDate = pastDateStr(days);
  const q = query(
    collection(db, 'vitals'),
    where('uid', '==', userId)
  );

  return onSnapshot(q, snap => {
    const logs = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          date: data.day || data.date || '',
          weight: data.weight !== undefined && data.weight !== null ? Number(data.weight) : null,
          unit: data.unit || 'kg'
        };
      })
      .filter(l => l.date >= startDate && typeof l.weight === 'number' && !isNaN(l.weight));

    logs.sort((a, b) => a.date.localeCompare(b.date));
    callback(logs);
  }, err => {
    console.warn('onWeightHistory listener error:', err);
    callback([]);
  });
}

export async function logSteps(userId, steps, source = 'manual') {
  const docId = `${userId}_${todayStr()}`;
  await setDoc(doc(db, 'vitals', docId), {
    uid: userId,
    userId,
    day: todayStr(),
    date: todayStr(),
    steps: Number(steps),
    source,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function onStepsToday(userId, callback) {
  const docId = `${userId}_${todayStr()}`;
  return onSnapshot(doc(db, 'vitals', docId), snap => {
    const data = snap.data();
    callback({ steps: Number(data?.steps || 0) });
  }, err => {
    console.warn('onStepsToday listener error:', err);
    callback({ steps: 0 });
  });
}

export function onStepsHistory(userId, days, callback) {
  const startDate = pastDateStr(days);
  const q = query(
    collection(db, 'vitals'),
    where('uid', '==', userId)
  );

  return onSnapshot(q, snap => {
    const logs = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          date: data.day || data.date || '',
          steps: Number(data.steps || 0)
        };
      })
      .filter(l => l.date >= startDate && l.steps > 0);

    logs.sort((a, b) => a.date.localeCompare(b.date));
    callback(logs);
  }, err => {
    console.warn('onStepsHistory listener error:', err);
    callback([]);
  });
}

// ─── WORKOUTS (Stored in 'users/{uid}' document) ───

export async function addWorkout(userId, workoutData) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const userData = snap.exists() ? snap.data() : {};
  const currentWorkouts = Array.isArray(userData.workouts) ? userData.workouts : [];

  const newWorkout = {
    id: 'wk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    userId,
    date: workoutData.date || todayStr(),
    name: workoutData.name || 'Workout',
    type: workoutData.type || 'strength',
    duration: Number(workoutData.duration || 0),
    caloriesBurned: Number(workoutData.caloriesBurned || 0),
    volume: Number(workoutData.volume || 0),
    exercises: workoutData.exercises || [],
    completed: workoutData.completed ?? true,
    notes: workoutData.notes || '',
    source: 'manual',
    createdAt: new Date().toISOString()
  };

  currentWorkouts.push(newWorkout);
  await setDoc(userRef, { workouts: currentWorkouts, updatedAt: serverTimestamp() }, { merge: true });

  // Mark workoutDone in today's vitals
  const vitalId = `${userId}_${newWorkout.date}`;
  await setDoc(doc(db, 'vitals', vitalId), {
    uid: userId,
    userId,
    day: newWorkout.date,
    date: newWorkout.date,
    workoutDone: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return newWorkout;
}

export async function updateWorkout(workoutId, updates) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const workouts = (snap.data().workouts || []).map(w => {
    if (w.id === workoutId) {
      return { ...w, ...updates, updatedAt: new Date().toISOString() };
    }
    return w;
  });

  await setDoc(userRef, { workouts, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteWorkout(workoutId) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const workouts = (snap.data().workouts || []).filter(w => w.id !== workoutId);
  await setDoc(userRef, { workouts, updatedAt: serverTimestamp() }, { merge: true });
}

export function onWorkoutsToday(userId, callback) {
  const today = todayStr();
  return onSnapshot(doc(db, 'users', userId), snap => {
    const workouts = (snap.data()?.workouts || []).filter(w => (w.date || '') === today);
    callback(workouts);
  }, err => {
    console.warn('onWorkoutsToday listener error:', err);
    callback([]);
  });
}

export function onWorkoutsRange(userId, startDate, endDate, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    const workouts = (snap.data()?.workouts || []).filter(w => {
      const d = w.date || '';
      return d >= startDate && d <= endDate;
    });
    callback(workouts);
  }, err => {
    console.warn('onWorkoutsRange listener error:', err);
    callback([]);
  });
}

export function onAllWorkouts(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }
  return onSnapshot(doc(db, 'users', userId), snap => {
    const workouts = snap.data()?.workouts || [];
    callback(workouts);
  }, err => {
    console.warn('onAllWorkouts listener error:', err);
    callback([]);
  });
}

// ─── 7-DAY WORKOUT PLANS (Stored in 'users/{uid}' document) ───

export async function saveWorkoutPlan(userId, plan) {
  if (!userId || !plan) return null;
  const userRef = doc(db, 'users', userId);
  const cleanPlan = {
    ...plan,
    updatedAt: new Date().toISOString()
  };
  await setDoc(userRef, { activeWorkoutPlan: cleanPlan, updatedAt: serverTimestamp() }, { merge: true });
  return cleanPlan;
}

export function onWorkoutPlan(userId, callback) {
  if (!userId) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'users', userId), snap => {
    const plan = snap.data()?.activeWorkoutPlan || null;
    callback(plan);
  }, err => {
    console.warn('onWorkoutPlan listener error:', err);
    callback(null);
  });
}

export async function updateWorkoutPlanDay(userId, dayNumber, updates) {
  if (!userId) return null;
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const plan = snap.data().activeWorkoutPlan;
  if (!plan || !Array.isArray(plan.days)) return null;

  const days = plan.days.map(d => {
    if (d.day === dayNumber) {
      return { ...d, ...updates };
    }
    return d;
  });

  const updatedPlan = { ...plan, days, updatedAt: new Date().toISOString() };
  await setDoc(userRef, { activeWorkoutPlan: updatedPlan, updatedAt: serverTimestamp() }, { merge: true });
  return updatedPlan;
}

// ─── DAILY SUMMARY ───

export async function saveDailySummary(userId, date, summaryData) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const summaries = snap.exists() ? (snap.data().summaries || {}) : {};
  summaries[date] = { ...summaryData, updatedAt: new Date().toISOString() };
  await setDoc(userRef, { summaries, updatedAt: serverTimestamp() }, { merge: true });
}

export function onDailySummaries(userId, startDate, endDate, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    const summariesMap = snap.data()?.summaries || {};
    const list = Object.entries(summariesMap)
      .filter(([d]) => d >= startDate && d <= endDate)
      .map(([d, val]) => ({ date: d, ...val }));
    list.sort((a, b) => a.date.localeCompare(b.date));
    callback(list);
  }, err => {
    console.warn('onDailySummaries listener error:', err);
    callback([]);
  });
}

// ─── BODY MEASUREMENTS ───

export async function logMeasurement(userId, data) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const measurements = snap.exists() ? (snap.data().measurements || []) : [];
  measurements.push({
    date: todayStr(),
    ...data,
    recordedAt: new Date().toISOString()
  });
  await setDoc(userRef, { measurements, updatedAt: serverTimestamp() }, { merge: true });
}

export function onMeasurementsHistory(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    const logs = snap.data()?.measurements || [];
    logs.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    callback(logs);
  }, err => {
    console.warn('onMeasurementsHistory listener error:', err);
    callback([]);
  });
}

// ─── GOALS & TARGETS ───

export async function saveGoals(userId, goals) {
  await setDoc(doc(db, 'users', userId), {
    goals,
    targetCalories: goals.calories,
    targetProtein: goals.protein,
    targetCarbs: goals.carbs,
    targetFat: goals.fat,
    targetWater: goals.water,
    targetSteps: goals.steps,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function onGoals(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    const data = snap.data();
    callback(data?.goals || (data?.targetCalories ? {
      calories: data.targetCalories,
      protein: data.targetProtein || 140,
      carbs: data.targetCarbs || 250,
      fat: data.targetFat || 60,
      water: data.targetWater || 8,
      steps: data.targetSteps || 10000
    } : null));
  }, err => {
    console.warn('onGoals listener error:', err);
    callback(null);
  });
}

// ─── ACHIEVEMENTS / BADGES ───

export async function awardBadge(userId, badge) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const badges = snap.exists() ? (snap.data().badges || []) : [];

  if (!badges.some(b => b.badgeId === badge.id || b.id === badge.id)) {
    badges.push({
      badgeId: badge.id,
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      tier: badge.tier || 'bronze',
      category: badge.category || 'general',
      earnedAt: new Date().toISOString()
    });
    await setDoc(userRef, { badges, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export async function awardBadgesBatch(userId, newBadgesList) {
  if (!newBadgesList || newBadgesList.length === 0) return;
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const badges = snap.exists() ? (snap.data().badges || []) : [];
  const existingIds = new Set(badges.map(b => b.badgeId || b.id));

  let modified = false;
  for (const b of newBadgesList) {
    if (!existingIds.has(b.id)) {
      badges.push({
        badgeId: b.id,
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        tier: b.tier || 'bronze',
        category: b.category || 'general',
        earnedAt: b.earnedAt || new Date().toISOString()
      });
      existingIds.add(b.id);
      modified = true;
    }
  }

  if (modified) {
    await setDoc(userRef, { badges, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export function onBadges(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    callback(snap.data()?.badges || []);
  }, err => {
    console.warn('onBadges listener error:', err);
    callback([]);
  });
}

// ─── PERSONAL RECORDS (PRs) ───

export async function savePersonalRecords(userId, personalRecords) {
  if (!userId || !personalRecords) return;
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { personalRecords, updatedAt: serverTimestamp() }, { merge: true });
}

export function onPersonalRecords(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    callback(snap.data()?.personalRecords || []);
  }, err => {
    console.warn('onPersonalRecords listener error:', err);
    callback([]);
  });
}

// ─── STREAKS ───

export async function updateStreak(userId, streakType, data) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const streaks = snap.exists() ? (snap.data().streaks || []) : [];

  const existingIdx = streaks.findIndex(s => s.type === streakType);
  const streakItem = { type: streakType, ...data, updatedAt: new Date().toISOString() };

  if (existingIdx >= 0) {
    streaks[existingIdx] = streakItem;
  } else {
    streaks.push(streakItem);
  }

  await setDoc(userRef, { streaks, updatedAt: serverTimestamp() }, { merge: true });
}

export function onStreaks(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    callback(snap.data()?.streaks || []);
  }, err => {
    console.warn('onStreaks listener error:', err);
    callback([]);
  });
}

// ─── USER PROFILE ───

export function onUserProfile(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, err => {
    console.warn('onUserProfile listener error:', err);
    callback(null);
  });
}

// ─── COACH HUB: All Users ───

export function onAllUsers(callback) {
  return onSnapshot(collection(db, 'users'), snap => {
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(users);
  }, err => {
    console.warn('onAllUsers listener warning (coach access):', err);
    callback([]);
  });
}

// ─── Custom Foods ───

export async function addCustomFood(userId, foodData) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const customFoods = snap.exists() ? (snap.data().customFoods || []) : [];

  const newFood = {
    id: 'cf_' + Date.now(),
    ...foodData,
    createdAt: new Date().toISOString()
  };

  customFoods.push(newFood);
  await setDoc(userRef, { customFoods, updatedAt: serverTimestamp() }, { merge: true });
  return newFood;
}

export function onCustomFoods(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), snap => {
    callback(snap.data()?.customFoods || []);
  }, err => {
    console.warn('onCustomFoods listener error:', err);
    callback([]);
  });
}

// ─── User Data Export (GDPR / Backup) ───

export async function exportUserData(userId) {
  const exportData = {
    userId,
    exportedAt: new Date().toISOString(),
    data: {}
  };

  try {
    const qEntries = query(collection(db, 'entries'), where('uid', '==', userId));
    const entriesSnap = await getDocs(qEntries);
    exportData.data.meals = entriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Export skipping entries:', e);
    exportData.data.meals = [];
  }

  try {
    const qVitals = query(collection(db, 'vitals'), where('uid', '==', userId));
    const vitalsSnap = await getDocs(qVitals);
    exportData.data.vitals = vitalsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Export skipping vitals:', e);
    exportData.data.vitals = [];
  }

  try {
    const profileSnap = await getDoc(doc(db, 'users', userId));
    if (profileSnap.exists()) {
      exportData.data.profile = profileSnap.data();
    }
  } catch (e) {
    console.warn('Export skipping profile:', e);
  }

  return exportData;
}
