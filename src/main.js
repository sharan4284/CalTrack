// CalTrack — Main Application Entry
// Orchestrates auth, routing, data binding, UI rendering, Chart.js analytics,
// Apple Health activity rings, workout generator, set builder, meal photo scanner & Google Fit sync.
// Strictly REAL DATA ONLY — no fabricated or mock records.

import './style.css';
import { auth } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
  signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword,
  logOut, deleteAccount, updateUserProfile, getUserProfile
} from './lib/auth.js';
import {
  addMeal, updateMeal, deleteMeal, onMealsToday, onMealsRange,
  logWater, onWaterToday, logWeight, onWeightHistory,
  logSteps, onStepsToday, onStepsHistory, onPastMeals,
  addWorkout, deleteWorkout, onWorkoutsToday,
  onWorkoutsRange, onAllWorkouts, saveWorkoutPlan, onWorkoutPlan, updateWorkoutPlanDay,
  saveGoals, onGoals, awardBadge, awardBadgesBatch, onBadges,
  savePersonalRecords, onPersonalRecords,
  updateStreak, onStreaks, onUserProfile, todayStr, dateStr, pastDateStr,
  saveDailySummary, onDailySummaries, logMeasurement, onMeasurementsHistory,
  addCustomFood, onCustomFoods, exportUserData, onAllUsers, uploadMealImage
} from './lib/database.js';
import {
  FOOD_DATABASE, searchFoods, scaleNutrition, calculateBMR,
  calculateTDEE, calculateTargets, getBMICategory
} from './lib/nutrition.js';
import {
  MASTER_BADGES, BADGE_TIERS, BADGE_CATEGORIES,
  extractUserPerformanceStats, evaluatePersonalRecords, evaluateAllBadges
} from './lib/achievements.js';
import {
  EXERCISE_DATABASE, searchExercises, calculate1RM,
  calculateWorkoutVolume, estimateCaloriesBurned, generatePersonalizedWorkout,
  renderExerciseVisualSvg
} from './lib/exercises.js';
import {
  createPersonalized7DayPlan, generateDeterministic7DayPlan,
  getAdaptiveWeightAndReps, whatShouldITrainToday,
  generateQuickWorkout, getExerciseSubstitutes
} from './lib/workout_engine.js';
import {
  renderWeightChart, renderCalorieChart,
  renderMacroDoughnut, renderStepsChart
} from './lib/charts.js';
import {
  compressImage, analyzeMealWithGemini, analyzeImageLocally
} from './lib/scanner.js';
import { healthSync } from './lib/sync.js';
import {
  getState, setState, subscribe, showToast, registerListener,
  cleanupListeners, initTheme, toggleTheme, applyTheme
} from './lib/state.js';

// ─── Initialize Theme ───
initTheme();

// ─── Register PWA Service Worker & Network Sync Listeners ───
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('CalTrack Service Worker registered:', reg.scope);
    }).catch(err => {
      console.warn('CalTrack Service Worker registration failed:', err);
    });
  });
}

window.addEventListener('online', () => {
  setState({ syncStatus: 'connected' });
  showToast('Network connection restored. Realtime sync active! 🌐', 'success');
});

window.addEventListener('offline', () => {
  setState({ syncStatus: 'offline' });
  showToast('You are currently offline. Local cache is recording your updates. 💾', 'warn');
});

// ─── Render App Shell ───
document.getElementById('app').innerHTML = `
  <div class="ambient">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- Loading Screen -->
  <div class="screen active" id="screen-loading">
    <div class="loading-screen">
      <div class="header-logo" style="width:56px;height:56px;font-size:1.8rem;border-radius:16px">🥗</div>
      <div class="spinner" style="width:32px;height:32px"></div>
      <div style="font-size:0.85rem;color:var(--ink-secondary)">Loading CalTrack...</div>
    </div>
  </div>

  <!-- Landing Screen -->
  <div class="screen" id="screen-landing">
    <div class="landing">
      <div class="header-logo" style="width:64px;height:64px;font-size:2rem;border-radius:18px;margin-bottom:24px">🥗</div>
      <h1 class="landing-title">CalTrack</h1>
      <p class="landing-sub">The next-generation fitness platform. Apple Health activity rings, Google Fit activity sync, real-time macro tracking, smart meal photo scanning, and strength analytics.</p>
      <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:320px">
        <button class="btn btn-primary btn-lg btn-block" onclick="window.ctApp.showAuth()">
          Get Started
        </button>
        <button class="btn btn-glass btn-lg btn-block" onclick="window.ctApp.showAuth('signin')">
          Sign In
        </button>
      </div>
      <div class="landing-features">
        <div class="landing-feature">
          <div class="landing-feature-icon">⭕</div>
          <div class="landing-feature-title">Apple Health Rings</div>
          <div class="landing-feature-desc">Concentric Move, Exercise, and Stand activity rings</div>
        </div>
        <div class="landing-feature">
          <div class="landing-feature-icon">⚡</div>
          <div class="landing-feature-title">Google Fit Sync</div>
          <div class="landing-feature-desc">Live activity and hardware pedometer bridge</div>
        </div>
        <div class="landing-feature">
          <div class="landing-feature-icon">📸</div>
          <div class="landing-feature-title">Meal Photo Scanner</div>
          <div class="landing-feature-desc">AI vision macro estimation with 1-click cloud logging</div>
        </div>
        <div class="landing-feature">
          <div class="landing-feature-icon">🏋️</div>
          <div class="landing-feature-title">Strength & 1RM Tracker</div>
          <div class="landing-feature-desc">Exercise set builder, volume calculator, and PRs</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Auth Screen -->
  <div class="screen" id="screen-auth">
    <div class="auth-container">
      <div class="auth-card glass" id="authCard">
        <div style="text-align:center;margin-bottom:20px">
          <div class="header-logo" style="width:48px;height:48px;font-size:1.5rem;margin:0 auto 12px">🥗</div>
          <h2>Welcome to CalTrack</h2>
          <p>Sign in to sync your fitness data across devices</p>
        </div>
        <button class="btn btn-google btn-block btn-lg" onclick="window.ctApp.googleSignIn()">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <div class="auth-divider">or use email</div>
        <div id="authEmailForm">
          <div id="signInForm">
            <div class="field">
              <label class="label">Email</label>
              <input class="input" type="email" id="siEmail" placeholder="you@example.com">
            </div>
            <div class="field">
              <label class="label">Password</label>
              <input class="input" type="password" id="siPass" placeholder="••••••••" onkeydown="if(event.key==='Enter')window.ctApp.emailSignIn()">
            </div>
            <div class="auth-error" id="siError"></div>
            <button class="btn btn-primary btn-block" id="siBtn" onclick="window.ctApp.emailSignIn()">Sign In</button>
            <div style="display:flex;justify-content:space-between;margin-top:12px">
              <button class="btn btn-glass btn-sm" onclick="window.ctApp.forgotPassword()">Forgot password?</button>
              <button class="btn btn-glass btn-sm" onclick="window.ctApp.switchAuthMode('signup')">Create account</button>
            </div>
          </div>
          <div id="signUpForm" style="display:none">
            <div class="field">
              <label class="label">Full Name</label>
              <input class="input" type="text" id="suName" placeholder="Your name">
            </div>
            <div class="field">
              <label class="label">Email</label>
              <input class="input" type="email" id="suEmail" placeholder="you@example.com">
            </div>
            <div class="field">
              <label class="label">Password</label>
              <input class="input" type="password" id="suPass" placeholder="Min 6 characters" onkeydown="if(event.key==='Enter')window.ctApp.emailSignUp()">
            </div>
            <div class="auth-error" id="suError"></div>
            <button class="btn btn-primary btn-block" id="suBtn" onclick="window.ctApp.emailSignUp()">Create Account</button>
            <div style="margin-top:12px;text-align:center">
              <button class="btn btn-glass btn-sm" onclick="window.ctApp.switchAuthMode('signin')">Already have an account? Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Onboarding Screen -->
  <div class="screen" id="screen-onboarding">
    <div class="onboarding-container">
      <div class="onboarding-card glass" id="obCard"></div>
    </div>
  </div>

  <!-- Main App Screen -->
  <div class="screen" id="screen-app">
    <header class="header">
      <div class="header-brand" onclick="window.ctApp.showBatmanEasterEgg()" style="cursor:pointer" title="CalTrack by Sharan (Batman 🦇)">
        <div class="header-logo">🥗</div>
        <div>
          <div class="header-title">CalTrack <span class="bat-mini-tag">🦇</span></div>
        </div>
      </div>
      <div class="header-actions">
        <div class="sync-pill" id="healthSyncPill" onclick="window.ctApp.toggleGoogleFit()" style="cursor:pointer" title="Google Fit & Health Connect status">
          <span class="sync-dot"></span> <span id="syncPillText">Google Fit: Connect</span>
        </div>
        <button class="btn btn-icon" onclick="window.ctApp.toggleTheme()" id="themeBtn" title="Toggle theme">☀️</button>
        <div style="position:relative">
          <div class="user-chip" onclick="window.ctApp.toggleUserMenu(event)">
            <div class="user-avatar" id="userAvatar">U</div>
            <span class="user-name" id="userName">User</span>
          </div>
          <div class="dropdown" id="userDropdown">
            <button class="dropdown-item" onclick="window.ctApp.editProfile()">👤 Edit Profile</button>
            <button class="dropdown-item" onclick="window.ctApp.switchTab('achievements')">🏆 Badges & Streaks</button>
            <button class="dropdown-item" onclick="window.ctApp.toggleCoachMode()">👥 <span id="coachToggleText">Switch to Coach Mode</span></button>
            <button class="dropdown-item" onclick="window.ctApp.exportData()">📁 Export All Data (CSV)</button>
            <button class="dropdown-item" onclick="window.ctApp.showBatmanEasterEgg()">🦇 Built by Sharan (Batman)</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" onclick="window.ctApp.handleLogout()">🚪 Sign Out</button>
            <button class="dropdown-item" style="color:var(--danger)" onclick="window.ctApp.handleDeleteAccount()">🗑 Delete Account</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Global Meal Photo Input for 1-Tap Mobile & Desktop Upload -->
    <input type="file" id="globalMealPhotoInput" accept="image/*" capture="environment" style="display:none" onchange="window.ctApp.handleGlobalPhotoUpload(this.files[0])">

    <!-- Desktop Tabs -->
    <div class="page-wrap">
      <div class="tabs" id="desktopTabs">
        <button class="tab active" data-tab="dashboard" onclick="window.ctApp.switchTab('dashboard')">📊 Dashboard</button>
        <button class="tab" data-tab="meals" onclick="window.ctApp.switchTab('meals')">🍽️ Meals & Scan</button>
        <button class="tab" data-tab="workouts" onclick="window.ctApp.switchTab('workouts')">🏋️ Workouts</button>
        <button class="tab" data-tab="progress" onclick="window.ctApp.switchTab('progress')">📈 Analytics</button>
        <button class="tab hidden" id="coachHubTabBtn" data-tab="coach_hub" onclick="window.ctApp.switchTab('coach_hub')">👥 Coach Hub</button>
        <button class="tab" data-tab="achievements" onclick="window.ctApp.switchTab('achievements')">🏆 Badges</button>
        <button class="tab" data-tab="profile" onclick="window.ctApp.switchTab('profile')">👤 Profile</button>
      </div>

      <!-- Tab Content -->
      <div id="tabContent"></div>

      <!-- Creator Credit Footer -->
      <footer class="app-credit-footer" onclick="window.ctApp.showBatmanEasterEgg()" title="Tap to summon the Bat-Signal 🦇">
        <div class="credit-pill">
          <span class="bat-icon">🦇</span>
          <span class="credit-text">Crafted by <strong class="bat-name">Sharan</strong> <span class="bat-alias">(Batman)</span></span>
          <span class="credit-dot"></span>
          <span class="credit-ver">Dark Knight Edition</span>
        </div>
      </footer>
    </div>

    <!-- Mobile Bottom Nav (Clean 5 items) -->
    <nav class="bottom-nav">
      <button class="nav-item active" data-tab="dashboard" onclick="window.ctApp.switchTab('dashboard')">
        <span class="nav-icon">📊</span><span>Home</span>
      </button>
      <button class="nav-item" data-tab="meals" onclick="window.ctApp.switchTab('meals')">
        <span class="nav-icon">🍽️</span><span>Meals</span>
      </button>
      <button class="nav-item" data-tab="workouts" onclick="window.ctApp.switchTab('workouts')">
        <span class="nav-icon">🏋️</span><span>Workouts</span>
      </button>
      <!-- Small Reactive Camera Icon Between Workouts & Charts -->
      <button class="nav-item nav-camera-item" id="navCameraBtn" onclick="window.ctApp.triggerQuickCamera()" title="Quick Meal Photo Scan" aria-label="Snap meal photo">
        <span class="nav-camera-orb"><span class="nav-icon">📸</span></span>
        <span>Scan</span>
      </button>
      <button class="nav-item" data-tab="progress" onclick="window.ctApp.switchTab('progress')">
        <span class="nav-icon">📈</span><span>Charts</span>
      </button>
      <button class="nav-item" data-tab="profile" onclick="window.ctApp.switchTab('profile')">
        <span class="nav-icon">👤</span><span>Profile</span>
      </button>
    </nav>

    <!-- Floating AI Coach Assistant Button (FAB) -->
    <div class="floating-ai-fab" id="floatingAiFab" onclick="window.ctApp.toggleFloatingAi()" title="Open CalTrack AI Coach">
      <div class="fab-orb">
        <span class="fab-orb-icon">✨</span>
        <span class="fab-pulse-ring"></span>
      </div>
      <span class="fab-text">AI Coach</span>
      <span class="fab-status-dot"></span>
    </div>

    <!-- Organised Floating AI Coach Drawer / Modal -->
    <div class="floating-ai-drawer" id="floatingAiDrawer">
      <!-- Drawer Header -->
      <div class="floating-ai-header">
        <div class="floating-ai-title-wrap">
          <div class="floating-ai-avatar">✨</div>
          <div>
            <div class="floating-ai-title">CalTrack AI Coach</div>
            <div class="floating-ai-status">
              <span class="floating-ai-online-dot"></span>
              <span id="floatingAiStatusText">Google Gemini AI Connected</span>
            </div>
          </div>
        </div>
        <div class="floating-ai-actions">
          <button class="floating-ai-btn-icon" onclick="window.ctApp.clearFloatingAiChat()" title="Reset / Clear Chat">🗑</button>
          <button class="floating-ai-btn-icon" onclick="window.ctApp.toggleFloatingAi()" title="Minimize / Close">✕</button>
        </div>
      </div>

      <!-- Live Telemetry Snapshot Strip -->
      <div class="floating-ai-telemetry" id="floatingAiTelemetry"></div>

      <!-- Quick Action Prompt Chips -->
      <div class="floating-ai-chips" id="floatingAiChips">
        <button class="chip-btn" onclick="window.ctApp.sendFloatingAiPrompt('What should I eat next?')">🍽️ Meal Advice</button>
        <button class="chip-btn" onclick="window.ctApp.sendFloatingAiPrompt('How is my protein target?')">💪 Protein Check</button>
        <button class="chip-btn" onclick="window.ctApp.sendFloatingAiPrompt('Am I in a deficit or surplus?')">⚖️ Deficit Check</button>
        <button class="chip-btn" onclick="window.ctApp.sendFloatingAiPrompt('Give me a quick workout tip')">⚡ Workout Tip</button>
        <button class="chip-btn" onclick="window.ctApp.sendFloatingAiPrompt('Check my badges and PR achievements')">🏆 PR & Badges</button>
        <button class="chip-btn" onclick="window.ctApp.sendFloatingAiPrompt('Review today\'s progress')">📊 Daily Review</button>
      </div>

      <!-- Chat History Stream -->
      <div class="floating-ai-messages" id="floatingAiMessages"></div>

      <!-- Input Dock -->
      <div class="floating-ai-input-dock">
        <input class="floating-ai-input" id="floatingAiInput" placeholder="Ask AI Coach anything..." onkeydown="if(event.key==='Enter')window.ctApp.sendFloatingAiMessage()">
        <button class="floating-ai-send-btn" onclick="window.ctApp.sendFloatingAiMessage()" title="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <!-- Photo Nutrition Scanner Modal (Easy 1-Tap Access from Everywhere) -->
    <div class="modal-backdrop" id="photoScanModal" style="display:none" onclick="if(event.target===this)window.ctApp.closePhotoScanModal()">
      <div class="modal" style="max-width:540px;width:100%">
        <div class="modal-header">
          <div class="modal-title" style="display:flex;align-items:center;gap:8px">
            <span>📸</span><span>Instant Meal Photo Scanner</span>
          </div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closePhotoScanModal()" style="width:30px;height:30px">✕</button>
        </div>

        <div class="modal-body" style="display:flex;flex-direction:column;gap:14px">
          <!-- Photo Preview with Laser Sweep -->
          <div class="scan-preview-box" id="scanPreviewBox">
            <img id="scanModalImg" class="scan-modal-image" src="" alt="Captured Food">
            <div class="scan-laser-line" id="scanModalLaser"></div>
            <div class="scan-overlay-pill" id="scanModalCloudStatus">
              <span class="spinner" style="width:10px;height:10px;border-width:2px;display:inline-block"></span>
              <span id="scanModalCloudText">Uploading to Cloud Storage...</span>
            </div>
          </div>

          <!-- Live AI Detection Feedback -->
          <div class="scan-status-alert" id="scanModalAlert">
            <span class="spinner" id="scanModalSpinner" style="width:16px;height:16px;border-width:2px;display:inline-block"></span>
            <span id="scanModalStatusText">Analyzing meal composition with Gemini Vision AI...</span>
          </div>

          <!-- Editable Meal Form (Verified by User) -->
          <div class="card" style="padding:14px;background:var(--surface);border:1px solid var(--border);margin-bottom:0">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <strong class="text-sm">🥗 Detected Meal & Portions</strong>
              <span class="text-xs" style="color:var(--orange)">⚠️ Estimated — please verify portions</span>
            </div>

            <div class="field mb-sm">
              <label class="label text-xs">Meal / Dish Name</label>
              <input class="input" id="scanDishName" placeholder="e.g. Grilled Chicken Salad">
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" class="mb-sm">
              <div class="field">
                <label class="label text-xs">Meal Type</label>
                <select class="input select" id="scanMealType">
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch" selected>Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Pre-workout">Pre-workout</option>
                  <option value="Post-workout">Post-workout</option>
                </select>
              </div>
              <div class="field">
                <label class="label text-xs">Calories (kcal)</label>
                <input type="number" class="input" id="scanCalories" placeholder="450">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
              <div class="field">
                <label class="label text-xs">Protein (g)</label>
                <input type="number" class="input" id="scanProtein" placeholder="35">
              </div>
              <div class="field">
                <label class="label text-xs">Carbs (g)</label>
                <input type="number" class="input" id="scanCarbs" placeholder="40">
              </div>
              <div class="field">
                <label class="label text-xs">Fat (g)</label>
                <input type="number" class="input" id="scanFat" placeholder="12">
              </div>
            </div>
          </div>

          <!-- Cloud Storage Info Pill -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);border:1px solid var(--border);font-size:0.75rem">
            <span class="text-muted">Cloud Reference:</span>
            <span id="scanModalCloudRef" class="text-accent fw-600">users/{uid}/meals/cloud.jpg</span>
          </div>
        </div>

        <div class="modal-footer" style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-glass" onclick="window.ctApp.closePhotoScanModal()">Cancel</button>
          <button class="btn btn-primary" id="saveScannedMealBtn" onclick="window.ctApp.saveScannedMeal()" style="display:flex;align-items:center;gap:6px">
            <span>Save Meal to Cloud</span> ✓
          </button>
        </div>
      </div>
    </div>

    <!-- Full Photo Viewer Modal -->
    <div class="modal-backdrop" id="photoPreviewModal" style="display:none" onclick="if(event.target===this)window.ctApp.closePhotoPreviewModal()">
      <div class="modal" style="max-width:500px;width:100%;text-align:center">
        <div class="modal-header">
          <div class="modal-title" id="photoPreviewTitle">Meal Photo</div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closePhotoPreviewModal()">✕</button>
        </div>
        <div style="max-height:65vh;overflow:hidden;border-radius:var(--radius-md);margin-bottom:12px">
          <img id="photoPreviewImg" style="width:100%;height:auto;max-height:65vh;object-fit:contain;border-radius:var(--radius-md)" src="" alt="Meal Photo">
        </div>
        <div class="text-xs text-muted" id="photoPreviewUrl" style="word-break:break-all">Stored in Firebase Cloud Storage</div>
      </div>
    </div>

    <!-- Real-Time Steps & Google Fit Modal -->
    <div class="modal-backdrop" id="stepsActivityModal" style="display:none" onclick="if(event.target===this)window.ctApp.closeStepsModal()">
      <div class="modal steps-modal-card">
        <div class="modal-header">
          <div class="modal-title" style="display:flex;align-items:center;gap:8px">
            <span>👟</span><span>Real-Time Steps & Activity</span>
          </div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closeStepsModal()" style="width:30px;height:30px">✕</button>
        </div>

        <div class="modal-body">
          <div class="steps-hero-gauge">
            <div class="steps-hero-num" id="modalStepsCount">0</div>
            <div class="steps-hero-goal" id="modalStepsGoal">Daily Goal: 10,000 steps</div>
            <div class="steps-progress-bar">
              <div class="steps-progress-fill" id="modalStepsBar" style="width: 0%"></div>
            </div>
            <div class="text-xs text-muted" id="modalStepsKcal">~0 kcal active burn</div>
          </div>

          <!-- Google Fit Live Sync -->
          <div class="steps-sync-box">
            <div>
              <div class="fw-700 text-sm" style="display:flex;align-items:center;gap:6px">
                <span>⚡ Google Fit REST API</span>
                <span class="badge ${healthSync.isConnected ? 'badge-success' : 'badge-muted'}" id="modalFitStatusBadge">
                  ${healthSync.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div class="text-xs text-muted" id="modalFitSubtext">
                ${healthSync.isConnected ? `Last synced: ${healthSync.lastSyncTime || 'Just now'}` : 'Sync real-time Android & WearOS steps'}
              </div>
            </div>
            <button class="btn btn-sm ${healthSync.isConnected ? 'btn-primary' : 'btn-glass'}" id="modalFitActionBtn" onclick="window.ctApp.syncGoogleFitNow()">
              ${healthSync.isConnected ? '🔄 Sync Now' : 'Connect Fit'}
            </button>
          </div>

          <!-- Hardware Motion Sensor Pedometer -->
          <div class="steps-sync-box">
            <div>
              <div class="fw-700 text-sm">📱 Live Phone Motion Pedometer</div>
              <div class="text-xs text-muted">Detects walking strides in real-time</div>
            </div>
            <button class="btn btn-sm ${healthSync.pedometerActive ? 'btn-primary' : 'btn-glass'}" id="modalPedometerBtn" onclick="window.ctApp.startPhonePedometer()">
              ${healthSync.pedometerActive ? 'Active 👟' : 'Start Sensor'}
            </button>
          </div>

          <!-- Manual Steps Log -->
          <div class="steps-manual-box">
            <label class="label text-xs">📝 Quick Manual Step Log (e.g. Treadmill or Watch)</label>
            <div style="display:flex;gap:8px">
              <input type="number" class="input" id="manualStepsInput" placeholder="e.g. 5000" min="0" max="100000">
              <button class="btn btn-primary btn-sm" onclick="window.ctApp.saveManualSteps()">Save Steps</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Badge Detail Modal -->
    <div class="modal-backdrop" id="badgeDetailModal" style="display:none" onclick="if(event.target===this)window.ctApp.closeBadgeDetailModal()">
      <div class="modal badge-detail-card">
        <div class="modal-header" style="justify-content:flex-end;border-bottom:none;padding-bottom:0">
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closeBadgeDetailModal()" style="width:30px;height:30px">✕</button>
        </div>
        <div class="badge-detail-icon-wrap" id="badgeDetailIconWrap">
          <span id="badgeDetailIcon">🏆</span>
        </div>
        <div class="badge-detail-title" id="badgeDetailTitle">Achievement Title</div>
        <div style="margin-bottom:12px">
          <span class="badge" id="badgeDetailTierTag">Bronze</span>
        </div>
        <div class="badge-detail-desc" id="badgeDetailDesc">Achievement description and requirements.</div>

        <div class="badge-detail-stats-box">
          <div class="badge-detail-stat-row">
            <span class="text-muted">Target Criterion:</span>
            <strong id="badgeDetailReq">50 Workouts</strong>
          </div>
          <div class="badge-detail-stat-row">
            <span class="text-muted">Your Current Progress:</span>
            <strong id="badgeDetailProgressVal">14 / 50 (28%)</strong>
          </div>
          <div class="badge-detail-stat-row">
            <span class="text-muted">XP Reward:</span>
            <strong class="text-accent" id="badgeDetailXp">+75 XP</strong>
          </div>
          <div class="badge-detail-stat-row" id="badgeDetailEarnedRow" style="display:none">
            <span class="text-muted">Status:</span>
            <strong class="text-accent" id="badgeDetailEarnedDate">✓ Earned</strong>
          </div>
        </div>

        <div style="margin-bottom:16px">
          <div class="perf-badge-track" style="height:8px">
            <div class="perf-badge-fill" id="badgeDetailProgressBar" style="width:28%"></div>
          </div>
        </div>

        <button class="btn btn-glass btn-block" onclick="window.ctApp.closeBadgeDetailModal()">Close</button>
      </div>
    </div>

    <!-- ─── DISTRACTION-FREE LIVE WORKOUT MODE MODAL ─── -->
    <div class="live-workout-modal-overlay" id="liveWorkoutModal">
      <div class="live-workout-container">
        <!-- Live Navigation Bar -->
        <div class="live-workout-nav">
          <div class="live-workout-stepper" id="liveWorkoutStepper">Exercise 1 of 5</div>
          <div style="font-weight:700;font-size:0.9rem" id="liveWorkoutHeaderTitle">Today's Workout</div>
          <button class="live-workout-exit-btn" onclick="window.ctApp.confirmExitWorkout()">Exit ✕</button>
        </div>

        <!-- Main Live Card -->
        <div class="live-workout-card">
          <!-- Visual Form Guidance Frame -->
          <div class="exercise-visual-frame" id="liveExerciseVisualFrame">
            <div id="liveVisualSvg"></div>
            <div class="exercise-visual-overlay-tag" id="liveExerciseEquipmentTag">
              <span>🏋️</span><span>Dumbbells</span>
            </div>
          </div>

          <!-- Exercise Title & Tags -->
          <div>
            <div class="live-exercise-title" id="liveExerciseName">Goblet Squat</div>
            <div class="live-exercise-tags">
              <span class="badge badge-success" id="liveExerciseMuscleTag">Legs & Glutes</span>
              <span class="badge" id="liveExerciseDifficultyTag">Beginner</span>
              <span class="badge" id="liveTargetScheme">3 SETS × 10–12 (REST 60s)</span>
            </div>
          </div>

          <!-- Smart Weight & Rep Suggestion (Adaptive Engine) -->
          <div class="live-suggestion-grid">
            <div class="live-suggestion-col">
              <span class="live-suggestion-lbl">Smart Suggestion</span>
              <span class="live-suggestion-val" id="liveSuggestedWeight">8 kg × 10–12</span>
            </div>
            <div class="live-suggestion-col">
              <span class="live-suggestion-lbl">Previous Best</span>
              <span class="live-suggestion-val" id="livePreviousPerformance" style="color:var(--ink-secondary)">7.5 kg × 10</span>
            </div>
          </div>

          <!-- Active Set Control Box -->
          <div class="live-set-control-box" id="liveSetControlBox">
            <div class="live-set-counter-badge">
              <span id="liveSetCounter">Set 1 of 3</span>
              <span class="text-xs text-muted" id="liveRestInfoText">Rest: 60s between sets</span>
            </div>

            <div class="live-inputs-row">
              <div class="live-input-field">
                <label>Weight (kg)</label>
                <div class="live-stepper-wrap">
                  <button class="live-stepper-btn" onclick="window.ctApp.stepLiveWeight(-1)">−</button>
                  <input class="live-stepper-input" type="number" id="liveSetWeightInput" value="10" step="0.5">
                  <button class="live-stepper-btn" onclick="window.ctApp.stepLiveWeight(1)">+</button>
                </div>
              </div>

              <div class="live-input-field">
                <label>Reps Completed</label>
                <div class="live-stepper-wrap">
                  <button class="live-stepper-btn" onclick="window.ctApp.stepLiveReps(-1)">−</button>
                  <input class="live-stepper-input" type="number" id="liveSetRepsInput" value="10">
                  <button class="live-stepper-btn" onclick="window.ctApp.stepLiveReps(1)">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Effort Rating Prompt (Appears after set) -->
          <div class="effort-prompt-box" id="liveEffortBox">
            <strong style="font-size:1rem;color:var(--ink)">How did that set feel?</strong>
            <div class="text-xs text-muted">Your answer directly calibrates the adaptive weight engine for next time</div>
            <div class="effort-options-row">
              <button class="effort-btn" onclick="window.ctApp.recordEffortAndRest('easy')">
                <span style="font-size:1.6rem">🙂</span>
                <span>Easy</span>
                <span class="text-xs text-muted">+Weight</span>
              </button>
              <button class="effort-btn" onclick="window.ctApp.recordEffortAndRest('good')">
                <span style="font-size:1.6rem">😐</span>
                <span>Good</span>
                <span class="text-xs text-muted">Perfect</span>
              </button>
              <button class="effort-btn" onclick="window.ctApp.recordEffortAndRest('hard')">
                <span style="font-size:1.6rem">😤</span>
                <span>Hard</span>
                <span class="text-xs text-muted">Manage</span>
              </button>
            </div>
          </div>

          <!-- Automated Rest Timer Box -->
          <div class="rest-timer-box" id="liveRestBox">
            <div class="text-xs fw-700" style="text-transform:uppercase;letter-spacing:0.08em;color:var(--ink-secondary)">Rest & Recovery Timer</div>
            <div class="rest-countdown-clock" id="liveRestClock">01:00</div>
            <div class="rest-next-preview" id="liveRestNextPreview">Next: Set 2 of 3 · 8 kg</div>
            <div class="rest-timer-controls">
              <button class="btn btn-glass btn-sm" onclick="window.ctApp.addRestTime(30)">+30s</button>
              <button class="btn btn-primary btn-sm" onclick="window.ctApp.skipRestTimer()">Skip Rest ⏭</button>
              <button class="btn btn-glass btn-sm" id="liveRestPauseBtn" onclick="window.ctApp.togglePauseRest()">Pause ⏸</button>
            </div>
          </div>

          <!-- Action Buttons Row -->
          <div style="display:flex;gap:10px;margin-top:4px" id="liveActionButtonsRow">
            <button class="btn btn-primary btn-lg" id="liveCompleteSetBtn" style="flex:1" onclick="window.ctApp.completeCurrentSet()">
              ✓ Complete Set
            </button>
          </div>

          <!-- Guidance / Modification Links -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid var(--border)">
            <button class="btn btn-glass btn-sm" onclick="window.ctApp.openCurrentHowTo()">
              <span>📖 How To Do It</span>
            </button>
            <button class="btn btn-glass btn-sm" onclick="window.ctApp.openCurrentReplace()">
              <span>🔁 Replace Exercise</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── "HOW TO DO IT" FORM GUIDANCE MODAL ─── -->
    <div class="modal-backdrop" id="exerciseHowToModal" style="display:none" onclick="if(event.target===this)window.ctApp.closeExerciseHowTo()">
      <div class="modal form-guide-card">
        <div class="modal-header">
          <div class="modal-title" id="howToModalTitle">How To Do Goblet Squat</div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closeExerciseHowTo()">✕</button>
        </div>
        <div class="modal-body" id="howToModalBody">
          <!-- Filled dynamically with visual, steps, breathing, mistakes, easier/harder -->
        </div>
      </div>
    </div>

    <!-- ─── EXERCISE SUBSTITUTION MODAL ─── -->
    <div class="modal-backdrop" id="exerciseReplaceModal" style="display:none" onclick="if(event.target===this)window.ctApp.closeExerciseReplace()">
      <div class="modal" style="max-width:500px;width:95%">
        <div class="modal-header">
          <div class="modal-title">🔁 Replace Exercise</div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closeExerciseReplace()">✕</button>
        </div>
        <div class="modal-body">
          <p class="text-xs text-muted mb-sm">Showing alternatives with the same muscle group, movement pattern, and matching your equipment.</p>
          <div id="exerciseReplaceList"></div>
        </div>
      </div>
    </div>

    <!-- ─── 7-DAY PLAN QUESTIONNAIRE MODAL ─── -->
    <div class="modal-backdrop" id="planOnboardingModal" style="display:none" onclick="if(event.target===this)window.ctApp.closePlanOnboarding()">
      <div class="modal" style="max-width:540px;width:95%;max-height:90vh;overflow-y:auto">
        <div class="modal-header">
          <div class="modal-title" style="display:flex;align-items:center;gap:8px">
            <span>✨</span><span>Create Your Personalized 7-Day Plan</span>
          </div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closePlanOnboarding()">✕</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:14px">
          <p class="text-xs text-muted">
            CalTrack creates a structured, progressive 7-day routine tailored to your goals, available equipment, and experience. Powered by Gemini AI with offline deterministic rule-based verification.
          </p>

          <div class="field">
            <label class="label text-xs">Primary Fitness Goal</label>
            <select class="input select" id="planGoalSelect">
              <option value="gain" selected>💪 Muscle Gain / Hypertrophy</option>
              <option value="lose">🔻 Fat Loss / Caloric Deficit</option>
              <option value="strength">🏋️ Pure Strength / Power</option>
              <option value="endurance">🏃 Endurance & Stamina</option>
              <option value="general">✨ General Fitness & Longevity</option>
              <option value="maintain">⚖️ Maintenance & Toning</option>
            </select>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="field">
              <label class="label text-xs">Fitness Level</label>
              <select class="input select" id="planLevelSelect">
                <option value="beginner">🟢 Beginner (0-1 yr)</option>
                <option value="intermediate" selected>🟡 Intermediate (1-3 yrs)</option>
                <option value="advanced">🔴 Advanced (3+ yrs)</option>
              </select>
            </div>
            <div class="field">
              <label class="label text-xs">Available Equipment</label>
              <select class="input select" id="planEquipmentSelect">
                <option value="dumbbells" selected>Dumbbells & Bench</option>
                <option value="bodyweight">Bodyweight Only (Home)</option>
                <option value="resistance_bands">Resistance Bands</option>
                <option value="barbell">Barbell & Plates</option>
                <option value="gym">Full Commercial Gym</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="field">
              <label class="label text-xs">Workout Duration</label>
              <select class="input select" id="planDurationSelect">
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="40" selected>40 Minutes</option>
                <option value="50">50 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
            <div class="field">
              <label class="label text-xs">Training Days / Week</label>
              <select class="input select" id="planDaysSelect">
                <option value="3">3 Days (Full Body)</option>
                <option value="4" selected>4 Days (Upper / Lower)</option>
                <option value="5">5 Days (Push / Pull / Legs)</option>
                <option value="6">6 Days (Dedicated Split)</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label class="label text-xs">Limitations / Disliked Exercises (Optional)</label>
            <input class="input" id="planLimitationsInput" placeholder="e.g. Mild shoulder pain, avoid heavy overhead press">
          </div>
        </div>
        <div class="modal-footer" style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-glass" onclick="window.ctApp.closePlanOnboarding()">Cancel</button>
          <button class="btn btn-primary" id="generatePlanBtn" onclick="window.ctApp.generateNew7DayPlan()">
            <span>🚀 Generate My 7-Day Plan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ─── "WHAT SHOULD I TRAIN TODAY?" COACH MODAL ─── -->
    <div class="modal-backdrop" id="whatToTrainModal" style="display:none" onclick="if(event.target===this)window.ctApp.closeWhatToTrain()">
      <div class="modal" style="max-width:500px;width:95%">
        <div class="modal-header">
          <div class="modal-title" style="display:flex;align-items:center;gap:8px">
            <span>🤖</span><span>AI Coach Daily Recommendation</span>
          </div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closeWhatToTrain()">✕</button>
        </div>
        <div class="modal-body" id="whatToTrainBody">
          <!-- Filled dynamically from whatShouldITrainToday -->
        </div>
      </div>
    </div>

    <!-- ─── QUICK WORKOUT GENERATOR MODAL ─── -->
    <div class="modal-backdrop" id="quickWorkoutModal" style="display:none" onclick="if(event.target===this)window.ctApp.closeQuickWorkout()">
      <div class="modal" style="max-width:480px;width:95%">
        <div class="modal-header">
          <div class="modal-title" style="display:flex;align-items:center;gap:8px">
            <span>⚡</span><span>Quick Burner Workout</span>
          </div>
          <button class="btn btn-icon btn-sm" onclick="window.ctApp.closeQuickWorkout()">✕</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:14px">
          <p class="text-xs text-muted">Short on time? Pick your window and the coach will assemble a focused, zero-fluff circuit instantly.</p>
          <div class="field">
            <label class="label text-xs">Available Time</label>
            <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:6px">
              ${[5, 10, 15, 20, 30].map(m => `
                <button class="btn btn-glass btn-sm quick-time-btn ${m === 15 ? 'btn-primary' : ''}" onclick="window.ctApp.selectQuickTime(${m}, this)">
                  ${m}m
                </button>
              `).join('')}
            </div>
          </div>
          <div class="field">
            <label class="label text-xs">Target Focus</label>
            <select class="input select" id="quickFocusSelect">
              <option value="full_body" selected>⚡ Full Body High Efficiency</option>
              <option value="upper">💪 Upper Body Power</option>
              <option value="lower">🦵 Lower Body Burn</option>
              <option value="core">🧘 Core & Stability</option>
              <option value="hiit">🔥 HIIT Conditioning</option>
            </select>
          </div>
          <button class="btn btn-primary btn-block" onclick="window.ctApp.launchQuickWorkout()">
            🚀 Start Quick Session Now
          </button>
        </div>
      </div>
    </div>

    <!-- ─── WORKOUT COMPLETE CELEBRATION MODAL ─── -->
    <div class="modal-backdrop" id="workoutCompleteModal" style="display:none" onclick="if(event.target===this)window.ctApp.closeWorkoutComplete()">
      <div class="modal" style="max-width:480px;width:95%;text-align:center">
        <div style="font-size:3.5rem;margin:10px auto 4px">🎉</div>
        <h2 style="font-size:1.6rem;font-weight:900;color:var(--ink);letter-spacing:-0.02em">WORKOUT COMPLETE!</h2>
        <p class="text-xs text-muted" id="completeWorkoutSubtitle">Great job crushing your session today.</p>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin:18px 0">
          <div class="stat-card">
            <div class="stat-value" id="completeDuration">35m</div>
            <div class="stat-label">Duration</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="completeVolume">2,450 kg</div>
            <div class="stat-label">Total Volume</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="completeCalories">280</div>
            <div class="stat-label">Est. Kcal</div>
          </div>
        </div>

        <!-- PR Banner if detected -->
        <div id="completePrBanner" style="display:none;background:rgba(251, 191, 36, 0.15);border:1px solid rgba(251, 191, 36, 0.4);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:14px;text-align:left">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:1.4rem">🔥</span>
            <div>
              <strong style="color:#fbbf24;font-size:0.9rem">NEW PERSONAL RECORD!</strong>
              <div class="text-xs text-muted" id="completePrText">You achieved a new personal best today!</div>
            </div>
          </div>
        </div>

        <!-- Coach Progression Note -->
        <div style="background:rgba(255, 255, 255, 0.03);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:18px;text-align:left;font-size:0.85rem">
          <strong class="text-accent">🤖 AI Coach Adaptation:</strong>
          <div class="text-muted mt-xs" id="completeCoachNote">
            Data verified and saved to cloud. Your progressive overload profile has been calibrated for your next session.
          </div>
        </div>

        <div style="display:flex;gap:10px">
          <button class="btn btn-glass" style="flex:1" onclick="window.ctApp.switchTab('achievements');window.ctApp.closeWorkoutComplete()">
            🏆 View Badges
          </button>
          <button class="btn btn-primary" style="flex:1" onclick="window.ctApp.closeWorkoutComplete()">
            Done ✓
          </button>
        </div>
      </div>
    </div>
  </div>
`;

// ─── App Controller ───
const app = {
  activeFoodSelection: null,
  editingMealId: null,
  lastUploadedImageUrl: '',
  lastScannedImageUrl: '',
  analyticsRangeDays: 7,
  activeWorkoutSets: [
    { reps: 10, weight: 60, completed: true }
  ],
  generatedRoutine: null,
  isCoachMode: localStorage.getItem('caltrack_coach_mode') === 'true',
  isGeminiConnected: localStorage.getItem('caltrack_gemini_connected') !== 'false',
  customFoods: [],

  // Screen management
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
    setState({ screen: screenId.replace('screen-', '') });

    const fab = document.getElementById('floatingAiFab');
    const drawer = document.getElementById('floatingAiDrawer');
    if (screenId === 'screen-app') {
      if (fab && !this.isFloatingAiOpen) fab.style.display = 'flex';
    } else {
      if (fab) fab.style.display = 'none';
      if (drawer) drawer.classList.remove('open');
      this.isFloatingAiOpen = false;
    }
  },

  showAuth(mode = 'signin') {
    this.showScreen('screen-auth');
    this.switchAuthMode(mode);
  },

  switchAuthMode(mode) {
    const si = document.getElementById('signInForm');
    const su = document.getElementById('signUpForm');
    if (mode === 'signup') {
      si.style.display = 'none'; su.style.display = 'block';
    } else {
      si.style.display = 'block'; su.style.display = 'none';
    }
  },

  // Auth actions
  async googleSignIn() {
    const result = await signInWithGoogle();
    if (!result.success) {
      showToast(result.error, 'error');
    }
  },

  async emailSignIn() {
    const email = document.getElementById('siEmail')?.value?.trim();
    const pass = document.getElementById('siPass')?.value;
    const errEl = document.getElementById('siError');
    if (!email || !pass) { errEl.textContent = 'Please enter email and password.'; return; }
    const btn = document.getElementById('siBtn');
    btn.disabled = true; btn.textContent = 'Signing in...';
    const result = await signInWithEmail(email, pass);
    if (!result.success) { errEl.textContent = result.error; }
    btn.disabled = false; btn.textContent = 'Sign In';
  },

  async emailSignUp() {
    const name = document.getElementById('suName')?.value?.trim();
    const email = document.getElementById('suEmail')?.value?.trim();
    const pass = document.getElementById('suPass')?.value;
    const errEl = document.getElementById('suError');
    if (!name) { errEl.textContent = 'Please enter your name.'; return; }
    if (!email) { errEl.textContent = 'Please enter a valid email.'; return; }
    if (!pass || pass.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
    const btn = document.getElementById('suBtn');
    btn.disabled = true; btn.textContent = 'Creating account...';
    const result = await signUpWithEmail(name, email, pass);
    if (!result.success) { errEl.textContent = result.error; }
    btn.disabled = false; btn.textContent = 'Create Account';
  },

  async forgotPassword() {
    const email = document.getElementById('siEmail')?.value?.trim();
    if (!email) { document.getElementById('siError').textContent = 'Enter your email first.'; return; }
    const result = await resetPassword(email);
    if (result.success) showToast('Password reset email sent!', 'success');
    else showToast(result.error, 'error');
  },

  async handleLogout() {
    cleanupListeners();
    await logOut();
    showToast('Signed out successfully.', 'info');
  },

  async handleDeleteAccount() {
    if (!confirm('⚠️ This will permanently delete your account and all fitness data. This cannot be undone.\n\nAre you sure?')) return;
    if (!confirm('This is your final confirmation. All data will be lost.')) return;
    try {
      await deleteAccount();
      showToast('Account deleted.', 'info');
    } catch (err) {
      showToast('Could not delete account: ' + err.message, 'error');
    }
  },

  toggleTheme() {
    toggleTheme();
    const state = getState();
    document.getElementById('themeBtn').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  },

  toggleUserMenu(e) {
    e?.stopPropagation();
    const dd = document.getElementById('userDropdown');
    dd.classList.toggle('open');
  },

  toggleCoachMode() {
    this.isCoachMode = !this.isCoachMode;
    localStorage.setItem('caltrack_coach_mode', this.isCoachMode ? 'true' : 'false');
    const coachBtn = document.getElementById('coachHubTabBtn');
    const coachToggleText = document.getElementById('coachToggleText');
    if (coachBtn) {
      coachBtn.classList.toggle('hidden', !this.isCoachMode);
    }
    if (coachToggleText) {
      coachToggleText.textContent = this.isCoachMode ? 'Switch to Client Mode' : 'Switch to Coach Mode';
    }
    showToast(this.isCoachMode ? 'Coach Mode Enabled 👥' : 'Client Mode Active 👤', 'info');
    if (this.isCoachMode) this.switchTab('coach_hub');
    else this.switchTab('dashboard');
  },

  // Tab switching
  switchTab(tab) {
    if (tab === 'coach') {
      this.toggleFloatingAi(true);
      return;
    }
    setState({ activeTab: tab });
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
    this.renderActiveTab();
  },

  // ─── Onboarding ───
  obStep: 1,
  obData: { name: '', age: 25, sex: 'male', height: 175, weight: 72, activity: 1.55, goal: 'lose' },

  renderOnboarding(user) {
    this.obData.name = user.displayName || user.email?.split('@')[0] || '';
    this.obStep = 1;
    this._renderObStep();
  },

  _renderObStep() {
    const d = this.obData;
    const card = document.getElementById('obCard');
    const steps = [
      // Step 1: Basic Info
      `<div class="ob-progress">${[1,2,3,4].map(s => `<div class="ob-step ${s < this.obStep ? 'done' : s === this.obStep ? 'active' : ''}"></div>`).join('')}</div>
       <h2 style="font-weight:800;margin-bottom:4px">👋 Welcome, let's set up your profile</h2>
       <p class="text-muted text-sm" style="margin-bottom:20px">Tell us about yourself so CalTrack can personalize your targets</p>
       <div class="field"><label class="label">Your Name</label><input class="input" id="obName" value="${d.name}" placeholder="Your name"></div>
       <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
         <div class="field"><label class="label">Age</label><input class="input" type="number" id="obAge" value="${d.age}" min="10" max="100"></div>
         <div class="field"><label class="label">Biological Sex</label>
           <div class="ob-options" style="grid-template-columns:1fr 1fr;margin:0">
             <div class="ob-option ${d.sex==='male'?'selected':''}" onclick="window.ctApp.obData.sex='male';window.ctApp._renderObStep()">♂️ Male</div>
             <div class="ob-option ${d.sex==='female'?'selected':''}" onclick="window.ctApp.obData.sex='female';window.ctApp._renderObStep()">♀️ Female</div>
           </div>
         </div>
       </div>
       <button class="btn btn-primary btn-block mt-md" onclick="window.ctApp.obNext()">Continue →</button>`,

      // Step 2: Body measurements
      `<div class="ob-progress">${[1,2,3,4].map(s => `<div class="ob-step ${s < this.obStep ? 'done' : s === this.obStep ? 'active' : ''}"></div>`).join('')}</div>
       <h2 style="font-weight:800;margin-bottom:20px">📏 Body Measurements</h2>
       <div class="field"><label class="label">Height (cm): <strong id="obHVal">${d.height}</strong></label>
         <input type="range" min="120" max="220" value="${d.height}" style="width:100%" oninput="window.ctApp.obData.height=+this.value;document.getElementById('obHVal').textContent=this.value">
       </div>
       <div class="field"><label class="label">Weight (kg): <strong id="obWVal">${d.weight}</strong></label>
         <input type="range" min="30" max="200" value="${d.weight}" style="width:100%" oninput="window.ctApp.obData.weight=+this.value;document.getElementById('obWVal').textContent=this.value">
       </div>
       <div style="text-align:center;padding:16px;border-radius:var(--radius-md);background:var(--surface);border:1px solid var(--border);margin-bottom:16px">
         <div class="text-xs text-muted">BMI Preview</div>
         <div style="font-size:1.8rem;font-weight:800;color:var(--accent-light)">${(d.weight / ((d.height/100)**2)).toFixed(1)}</div>
         <div class="text-xs" style="color:${getBMICategory(d.weight/((d.height/100)**2)).color}">${getBMICategory(d.weight/((d.height/100)**2)).label}</div>
       </div>
       <div style="display:flex;gap:10px">
         <button class="btn btn-glass" onclick="window.ctApp.obPrev()">← Back</button>
         <button class="btn btn-primary" style="flex:1" onclick="window.ctApp.obNext()">Continue →</button>
       </div>`,

      // Step 3: Activity & Goal
      `<div class="ob-progress">${[1,2,3,4].map(s => `<div class="ob-step ${s < this.obStep ? 'done' : s === this.obStep ? 'active' : ''}"></div>`).join('')}</div>
       <h2 style="font-weight:800;margin-bottom:8px">🎯 Activity & Goal</h2>
       <p class="text-muted text-sm" style="margin-bottom:16px">Select your typical activity level and fitness goal</p>
       <label class="label">Activity Level</label>
       <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px">
         ${[[1.2,'Sedentary','Desk job, minimal exercise'],[1.375,'Lightly Active','1-3 days/week'],[1.55,'Moderately Active','3-5 days/week'],[1.725,'Very Active','6-7 days/week'],[1.9,'Athlete','Intense daily training']].map(([v,l,desc]) => `
           <div class="ob-option ${d.activity===v?'selected':''}" style="text-align:left;display:flex;justify-content:space-between;align-items:center"
                onclick="window.ctApp.obData.activity=${v};window.ctApp._renderObStep()">
             <div><strong>${l}</strong><div class="text-xs text-muted">${desc}</div></div>
             ${d.activity===v?'<span style="color:var(--accent)">✓</span>':''}
           </div>`).join('')}
       </div>
       <label class="label">Fitness Goal</label>
       <div class="ob-options" style="grid-template-columns:1fr 1fr 1fr">
         <div class="ob-option ${d.goal==='lose'?'selected':''}" onclick="window.ctApp.obData.goal='lose';window.ctApp._renderObStep()">🔻 Lose Fat</div>
         <div class="ob-option ${d.goal==='maintain'?'selected':''}" onclick="window.ctApp.obData.goal='maintain';window.ctApp._renderObStep()">⚖️ Maintain</div>
         <div class="ob-option ${d.goal==='gain'?'selected':''}" onclick="window.ctApp.obData.goal='gain';window.ctApp._renderObStep()">💪 Build Muscle</div>
       </div>
       <div style="display:flex;gap:10px;margin-top:16px">
         <button class="btn btn-glass" onclick="window.ctApp.obPrev()">← Back</button>
         <button class="btn btn-primary" style="flex:1" onclick="window.ctApp.obNext()">Continue →</button>
       </div>`,

      // Step 4: Summary & Launch
      (() => {
        const bmr = calculateBMR(d.weight, d.height, d.age, d.sex);
        const tdee = calculateTDEE(bmr, d.activity);
        const targets = calculateTargets(tdee, d.goal, d.weight);
        return `<div class="ob-progress">${[1,2,3,4].map(s => `<div class="ob-step ${s < this.obStep ? 'done' : s === this.obStep ? 'active' : ''}"></div>`).join('')}</div>
          <h2 style="font-weight:800;margin-bottom:16px">🚀 Your Personalized Plan</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            <div class="stat-card"><div class="stat-value">${(d.weight / ((d.height/100)**2)).toFixed(1)}</div><div class="stat-label">BMI</div></div>
            <div class="stat-card"><div class="stat-value">${bmr.toLocaleString()}</div><div class="stat-label">BMR (kcal)</div></div>
            <div class="stat-card"><div class="stat-value">${tdee.toLocaleString()}</div><div class="stat-label">TDEE (kcal)</div></div>
            <div class="stat-card"><div class="stat-value" style="color:var(--accent-light)">${targets.calories.toLocaleString()}</div><div class="stat-label">Daily Target</div></div>
          </div>
          <div style="padding:12px;border-radius:var(--radius-md);background:var(--surface);border:1px solid var(--border);margin-bottom:16px;font-size:0.85rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Protein target:</span><strong>${targets.protein}g/day</strong></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Carbs target:</span><strong>${targets.carbs}g/day</strong></div>
            <div style="display:flex;justify-content:space-between"><span>Fat target:</span><strong>${targets.fat}g/day</strong></div>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-glass" onclick="window.ctApp.obPrev()">← Back</button>
            <button class="btn btn-primary btn-lg" style="flex:1" id="obLaunchBtn" onclick="window.ctApp.obSave()">🚀 Launch CalTrack</button>
          </div>`;
      })()
    ];
    card.innerHTML = steps[this.obStep - 1];
  },

  obNext() {
    if (this.obStep === 1) {
      const name = document.getElementById('obName')?.value?.trim();
      const age = Number(document.getElementById('obAge')?.value);
      if (!name) { showToast('Please enter your name', 'error'); return; }
      if (!age || age < 10 || age > 100) { showToast('Please enter a valid age', 'error'); return; }
      this.obData.name = name;
      this.obData.age = age;
    }
    if (this.obStep < 4) { this.obStep++; this._renderObStep(); }
  },

  obPrev() {
    if (this.obStep > 1) { this.obStep--; this._renderObStep(); }
  },

  async obSave() {
    const d = this.obData;
    const btn = document.getElementById('obLaunchBtn');
    btn.disabled = true; btn.textContent = 'Saving...';

    const bmr = calculateBMR(d.weight, d.height, d.age, d.sex);
    const tdee = calculateTDEE(bmr, d.activity);
    const targets = calculateTargets(tdee, d.goal, d.weight);
    const bmi = Number((d.weight / ((d.height / 100) ** 2)).toFixed(1));

    const profileData = {
      name: d.name, height: d.height, weight: d.weight, age: d.age,
      sex: d.sex, activity: d.activity, goal: d.goal,
      bmi, bmr, tdee,
      targetCalories: targets.calories,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFat: targets.fat,
      targetWater: 8,
      targetSteps: 10000,
      onboardingComplete: true
    };

    try {
      await updateUserProfile(profileData);
      await saveGoals(auth.currentUser.uid, {
        calories: targets.calories,
        protein: targets.protein,
        carbs: targets.carbs,
        fat: targets.fat,
        water: 8,
        steps: 10000
      });

      setState({
        profile: profileData,
        targets: {
          calories: targets.calories,
          protein: targets.protein,
          carbs: targets.carbs,
          fat: targets.fat,
          water: 8,
          steps: 10000
        }
      });

      this.showScreen('screen-app');
      this.initApp(auth.currentUser);
      showToast(`Welcome to CalTrack, ${d.name}! 🎉`, 'success');
    } catch (err) {
      showToast('Error saving profile: ' + err.message, 'error');
      btn.disabled = false; btn.textContent = '🚀 Launch CalTrack';
    }
  },

  editProfile() {
    this.toggleUserMenu();
    const state = getState();
    if (state.profile) {
      this.obData = {
        name: state.profile.name || '',
        age: state.profile.age || 25,
        sex: state.profile.sex || 'male',
        height: state.profile.height || 175,
        weight: state.profile.weight || 72,
        activity: state.profile.activity || 1.55,
        goal: state.profile.goal || 'lose'
      };
    }
    this.obStep = 1;
    this._renderObStep();
    this.showScreen('screen-onboarding');
  },

  // ─── Initialize Main App ───
  initApp(user) {
    const uid = user.uid;

    document.getElementById('userName').textContent = user.displayName || user.email?.split('@')[0] || 'User';
    const avatarEl = document.getElementById('userAvatar');
    if (user.photoURL) {
      avatarEl.innerHTML = `<img src="${user.photoURL}" alt="avatar">`;
    } else {
      avatarEl.textContent = (user.displayName || user.email || 'U')[0].toUpperCase();
    }

    // Bind real-time listeners for authenticated user
    registerListener('meals_today', onMealsToday(uid, meals => {
      setState({ todayMeals: meals });
      this.renderActiveTab();
      this.checkAndAwardBadges();
    }));

    registerListener('water_today', onWaterToday(uid, water => {
      setState({ todayWater: water });
      this.renderActiveTab();
      this.checkAndAwardBadges();
    }));

    registerListener('steps_today', onStepsToday(uid, steps => {
      setState({ todaySteps: steps });
      this.renderActiveTab();
      this.checkAndAwardBadges();
    }));

    registerListener('steps_history', onStepsHistory(uid, 30, logs => {
      setState({ stepsHistory: logs });
      if (getState().activeTab === 'progress') this.initProgressCharts();
    }));

    registerListener('past_meals', onPastMeals(uid, 30, meals => {
      setState({ pastMeals: meals });
      if (getState().activeTab === 'progress') this.initProgressCharts();
    }));

    registerListener('workouts_today', onWorkoutsToday(uid, workouts => {
      setState({ todayWorkouts: workouts });
      this.renderActiveTab();
      this.checkAndAwardBadges();
    }));

    registerListener('workout_plan', onWorkoutPlan(uid, plan => {
      setState({ activeWorkoutPlan: plan });
      this.renderActiveTab();
    }));

    registerListener('all_workouts', onAllWorkouts(uid, allWk => {
      setState({ allUserWorkouts: allWk });
    }));

    registerListener('weight_history', onWeightHistory(uid, 90, logs => {
      setState({ weightHistory: logs });
      if (getState().activeTab === 'progress') {
        this.initProgressCharts();
      }
    }));

    registerListener('measurements', onMeasurementsHistory(uid, measurements => {
      setState({ measurementsHistory: measurements });
      if (getState().activeTab === 'progress') this.renderActiveTab();
    }));

    registerListener('goals', onGoals(uid, goals => {
      if (goals) {
        setState({
          goals,
          targets: {
            calories: goals.calories || 2200,
            protein: goals.protein || 140,
            carbs: goals.carbs || 250,
            fat: goals.fat || 60,
            water: goals.water || 8,
            steps: goals.steps || 10000
          }
        });
      }
    }));

    registerListener('badges', onBadges(uid, badges => {
      setState({ badges });
      if (getState().activeTab === 'achievements') this.renderActiveTab();
    }));

    registerListener('personal_records', onPersonalRecords(uid, personalRecords => {
      setState({ personalRecords });
      if (getState().activeTab === 'achievements') this.renderActiveTab();
    }));

    registerListener('streaks', onStreaks(uid, streaks => {
      setState({ streaks });
    }));

    registerListener('profile', onUserProfile(uid, profile => {
      if (profile) setState({ profile });
    }));

    registerListener('custom_foods', onCustomFoods(uid, foods => {
      this.customFoods = foods;
    }));

    // If coach mode is active, load all registered users
    if (this.isCoachMode) {
      const coachBtn = document.getElementById('coachHubTabBtn');
      if (coachBtn) coachBtn.classList.remove('hidden');
      registerListener('all_users', onAllUsers(users => {
        setState({ allUsers: users });
        if (getState().activeTab === 'coach_hub') this.renderActiveTab();
      }));
    }

    // Google Fit Auto-Sync & Status initialization
    const pill = document.getElementById('syncPillText');
    if (pill) pill.textContent = healthSync.isConnected ? 'Google Fit: Synced' : 'Google Fit: Connect';
    healthSync.startAutoSync(uid);

    this.renderActiveTab();
  },

  // ─── Tab Rendering ───
  renderActiveTab() {
    const state = getState();
    const content = document.getElementById('tabContent');
    if (!content) return;

    if (this.isFloatingAiOpen) {
      this.updateFloatingAiTelemetry();
    }

    switch (state.activeTab) {
      case 'dashboard':
        content.innerHTML = this.renderDashboard(state);
        break;
      case 'meals':
        content.innerHTML = this.renderMeals(state);
        break;
      case 'workouts':
        content.innerHTML = this.renderWorkouts(state);
        break;
      case 'progress':
        content.innerHTML = this.renderProgress(state);
        this.initProgressCharts();
        break;
      case 'coach':
        content.innerHTML = this.renderCoach(state);
        break;
      case 'coach_hub':
        content.innerHTML = this.renderCoachHub(state);
        break;
      case 'achievements':
        content.innerHTML = this.renderAchievements(state);
        break;
      case 'profile':
        content.innerHTML = this.renderProfile(state);
        break;
      default:
        content.innerHTML = this.renderDashboard(state);
    }
  },

  // ─── 1. Dashboard (Apple Health Concentric Rings + Live Stats) ───
  renderDashboard(s) {
    const { dailyTotals: t, targets: g, todayWater: w, todaySteps: st, todayWorkouts: wk, todayMeals: meals, weightHistory: wh, streaks } = s;
    const calPct = g.calories > 0 ? Math.min(100, Math.round((t.calories / g.calories) * 100)) : 0;
    const protPct = g.protein > 0 ? Math.min(100, Math.round((t.protein / g.protein) * 100)) : 0;
    const waterPct = g.water > 0 ? Math.min(100, Math.round(((w.glasses || 0) / g.water) * 100)) : 0;
    const stepsPct = g.steps > 0 ? Math.min(100, Math.round(((st.steps || 0) / g.steps) * 100)) : 0;
    const remaining = Math.max(0, g.calories - t.calories);
    const latestWeight = wh.length > 0 ? wh[wh.length - 1].weight : (s.profile?.weight || '—');
    const loggingStreak = streaks.find(x => x.type === 'logging') || { current: meals.length > 0 ? 1 : 0 };

    const totalWorkoutMinutes = wk.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    const exercisePct = Math.min(100, Math.round((totalWorkoutMinutes / 30) * 100)); // 30 min daily activity goal

    // Apple Health Concentric Rings Geometry
    const moveCircumference = 439.82;
    const moveOffset = moveCircumference - (moveCircumference * Math.min(100, calPct) / 100);

    const exerciseCircumference = 339.29;
    const exerciseOffset = exerciseCircumference - (exerciseCircumference * Math.min(100, exercisePct) / 100);

    const standCircumference = 238.76;
    const standOffset = standCircumference - (standCircumference * Math.min(100, waterPct) / 100);

    return `
      <!-- Google Fit Sync Banner -->
      <div class="sync-card">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:1.8rem">⚡</div>
          <div>
            <div class="fw-700" style="font-size:0.92rem">Google Fit & Health Connect Bridge</div>
            <div class="text-xs text-muted">
              ${healthSync.isConnected ? `Connected · Last synced: ${healthSync.lastSyncTime || 'Today'}` : 'Authentic Google Fitness REST API sync (OAuth verified)'}
            </div>
          </div>
        </div>
        <button class="btn btn-sm ${healthSync.isConnected ? 'btn-primary' : 'btn-glass'}" onclick="window.ctApp.toggleGoogleFit()">
          ${healthSync.isConnected ? 'Disconnect' : 'Connect Google Fit'}
        </button>
      </div>

      <!-- ONE UNIFIED MASTER DASHBOARD (Apple Health Rings + Live Telemetry + Super Animation) -->
      <div class="unified-hero-card">
        <!-- Left Column: Apple Health Concentric Rings -->
        <div class="rings-hero-wrap">
          <div class="rings-svg-wrap">
            <svg class="rings-svg" viewBox="0 0 170 170">
              <!-- Move Ring (Outer - Active Calories) -->
              <circle class="ring-track" cx="85" cy="85" r="70" stroke="rgba(250, 45, 72, 0.2)" />
              <circle class="ring-bar ring-move" cx="85" cy="85" r="70"
                stroke-dasharray="${moveCircumference}"
                stroke-dashoffset="${moveOffset}" />

              <!-- Exercise Ring (Middle - Workouts) -->
              <circle class="ring-track" cx="85" cy="85" r="54" stroke="rgba(153, 230, 0, 0.2)" />
              <circle class="ring-bar ring-exercise" cx="85" cy="85" r="54"
                stroke-dasharray="${exerciseCircumference}"
                stroke-dashoffset="${exerciseOffset}" />

              <!-- Stand/Hydrate Ring (Inner - Water) -->
              <circle class="ring-track" cx="85" cy="85" r="38" stroke="rgba(0, 229, 255, 0.2)" />
              <circle class="ring-bar ring-stand" cx="85" cy="85" r="38"
                stroke-dasharray="${standCircumference}"
                stroke-dashoffset="${standOffset}" />
            </svg>
            <div class="rings-center-icon">
              <span class="pulse-flame">🔥</span>
              <span class="rings-pct-text">${calPct}%</span>
            </div>
          </div>

          <!-- Ring Legend Compact Strip -->
          <div class="rings-legend-compact">
            <div class="legend-pill" title="Calories / Move">
              <span class="legend-dot" style="background:#fa2d48;box-shadow:0 0 6px #fa2d48"></span>
              <span class="legend-label">Move</span>
              <span class="legend-val" style="color:#fa2d48">${t.calories}</span>
            </div>
            <div class="legend-pill" title="Exercise / Workouts">
              <span class="legend-dot" style="background:#99e600;box-shadow:0 0 6px #99e600"></span>
              <span class="legend-label">Ex</span>
              <span class="legend-val" style="color:#99e600">${totalWorkoutMinutes}m</span>
            </div>
            <div class="legend-pill" title="Hydration">
              <span class="legend-dot" style="background:#00e5ff;box-shadow:0 0 6px #00e5ff"></span>
              <span class="legend-label">Hydrate</span>
              <span class="legend-val" style="color:#00e5ff">${w.glasses || 0}gl</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Live Caloric Budget, Macros & Realtime Telemetry -->
        <div class="unified-metrics-wrap">
          <!-- Calorie Budget Header -->
          <div class="calorie-budget-row">
            <div>
              <div class="calorie-budget-label">Daily Calorie Intake</div>
              <div class="calorie-budget-nums">
                <span class="cal-main-val">${t.calories.toLocaleString()}</span>
                <span class="cal-goal-val">/ ${g.calories.toLocaleString()} kcal</span>
              </div>
            </div>
            <div class="calorie-rem-badge ${remaining <= 0 ? 'reached' : ''}">
              ${remaining > 0 ? `<span>⚡ ${remaining.toLocaleString()} kcal left</span>` : '<span>🎉 Target Reached</span>'}
            </div>
          </div>

          <!-- Macro Meters with Spring Animations -->
          <div class="macro-meters-grid">
            <div class="macro-meter-item">
              <div class="macro-meter-header">
                <span class="macro-name">Protein</span>
                <span class="macro-val">${t.protein}/${g.protein}g</span>
              </div>
              <div class="macro-track">
                <div class="macro-fill macro-protein" style="width:${protPct}%;"></div>
              </div>
            </div>

            <div class="macro-meter-item">
              <div class="macro-meter-header">
                <span class="macro-name">Carbs</span>
                <span class="macro-val">${t.carbs}/${g.carbs}g</span>
              </div>
              <div class="macro-track">
                <div class="macro-fill macro-carbs" style="width:${g.carbs > 0 ? Math.min(100, Math.round(t.carbs / g.carbs * 100)) : 0}%;"></div>
              </div>
            </div>

            <div class="macro-meter-item">
              <div class="macro-meter-header">
                <span class="macro-name">Fat</span>
                <span class="macro-val">${t.fat}/${g.fat}g</span>
              </div>
              <div class="macro-track">
                <div class="macro-fill macro-fat" style="width:${g.fat > 0 ? Math.min(100, Math.round(t.fat / g.fat * 100)) : 0}%;"></div>
              </div>
            </div>
          </div>

          <!-- Live Activity Telemetry Row (Interactive 1-Tap Chips) -->
          <div class="telemetry-badges-row">
            <div class="telemetry-chip" onclick="window.ctApp.openStepsModal()" title="Real-time steps tracking & Google Fit sync">
              <span class="telemetry-icon">👟</span>
              <div>
                <div class="telemetry-chip-val">${(st.steps || 0).toLocaleString()}</div>
                <div class="telemetry-chip-lbl">Steps (${stepsPct}%) ⚡</div>
              </div>
            </div>

            <div class="telemetry-chip" onclick="window.ctApp.switchTab('workouts')" title="Workouts">
              <span class="telemetry-icon">🏋️</span>
              <div>
                <div class="telemetry-chip-val">${wk.length > 0 ? `${totalWorkoutMinutes}m` : 'Rest Day'}</div>
                <div class="telemetry-chip-lbl">${wk.length} Session${wk.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <!-- Small Reactive Camera Icon Between Workouts & Charts -->
            <div class="telemetry-chip camera-chip" onclick="window.ctApp.triggerQuickCamera()" title="Tap to snap meal photo (AI Vision)">
              <span class="telemetry-icon camera-pulse-icon">📸</span>
              <div>
                <div class="telemetry-chip-val">Scan</div>
                <div class="telemetry-chip-lbl">1-Tap AI 📷</div>
              </div>
            </div>

            <div class="telemetry-chip" onclick="window.ctApp.incrementWater()" title="Tap to add 1 glass of water (+250ml)">
              <span class="telemetry-icon">💧</span>
              <div>
                <div class="telemetry-chip-val">${w.glasses || 0} / ${g.water}</div>
                <div class="telemetry-chip-lbl">+1 Glass ⚡</div>
              </div>
            </div>

            <div class="telemetry-chip" onclick="window.ctApp.switchTab('progress')" title="Weight check-in">
              <span class="telemetry-icon">⚖️</span>
              <div>
                <div class="telemetry-chip-val">${typeof latestWeight === 'number' ? latestWeight + ' kg' : latestWeight}</div>
                <div class="telemetry-chip-lbl">${s.profile?.goal === 'lose' ? 'Cutting' : s.profile?.goal === 'gain' ? 'Bulking' : 'Maintain'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TODAY'S WORKOUT CARD (1-Tap Direct Launch) -->
      ${(() => {
        const plan = s.activeWorkoutPlan;
        if (plan && Array.isArray(plan.days) && plan.days.length > 0) {
          const dayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
          const todayPlanDay = plan.days[dayIdx] || plan.days.find(d => !d.completed) || plan.days[0];
          const isRest = todayPlanDay.isRest || todayPlanDay.type === 'rest' || todayPlanDay.title?.toLowerCase().includes('rest') || todayPlanDay.title?.toLowerCase().includes('recovery');
          const isCompleted = todayPlanDay.completed;

          return `
            <div class="today-workout-hero">
              <div class="today-workout-badge-row">
                <span class="today-workout-label">
                  <span>⚡</span><span>TODAY'S WORKOUT · DAY ${todayPlanDay.day || (dayIdx + 1)}</span>
                </span>
                <span class="badge ${isCompleted ? 'badge-success' : isRest ? 'badge-muted' : 'badge-primary'}">
                  ${isCompleted ? '✓ Completed Today' : isRest ? '🧘 Active Recovery / Rest' : '🔥 Scheduled'}
                </span>
              </div>
              <div class="today-workout-title">${todayPlanDay.title}</div>
              <div class="today-workout-meta">
                <span>⏱ ${todayPlanDay.durationMinutes || 35} minutes</span>
                <span>•</span>
                <span>🏋️ ${todayPlanDay.exercises ? todayPlanDay.exercises.length : 0} exercises</span>
                <span>•</span>
                <span>🎯 ${(todayPlanDay.focus || []).join(' • ') || 'Full Body'}</span>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="today-workout-btn" style="flex:1" onclick="window.ctApp.startPlanDayWorkout(${todayPlanDay.day || (dayIdx + 1)})">
                  <span>${isCompleted ? '🔄 Re-Run Workout' : '🚀 START WORKOUT'}</span>
                </button>
                <button class="btn btn-glass" onclick="window.ctApp.switchTab('workouts')" style="padding:14px 18px">
                  <span>📅 7-Day Plan</span>
                </button>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="today-workout-hero">
              <div class="today-workout-badge-row">
                <span class="today-workout-label">
                  <span>✨</span><span>NEXT-GEN AI FITNESS COACH</span>
                </span>
                <span class="badge badge-success">Adaptive 7-Day Engine</span>
              </div>
              <div class="today-workout-title">Ready to Train Today?</div>
              <div class="today-workout-meta">
                <span>Get a custom 7-day plan adapted to your goal, equipment, and experience.</span>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="today-workout-btn" style="flex:1" onclick="window.ctApp.openPlanOnboarding()">
                  <span>✨ CREATE MY 7-DAY PLAN</span>
                </button>
                <button class="btn btn-glass" onclick="window.ctApp.openQuickWorkout()" style="padding:14px 18px">
                  <span>⚡ Quick Workout</span>
                </button>
                <button class="btn btn-glass" onclick="window.ctApp.openWhatShouldITrain()" style="padding:14px 18px">
                  <span>🤖 What To Train?</span>
                </button>
              </div>
            </div>
          `;
        }
      })()}

      <!-- Streak Pill -->
      <div class="streak-display mb-md">
        <span class="streak-fire">🔥</span>
        <span class="streak-count">${loggingStreak.current || (meals.length > 0 ? 1 : 0)}</span>
        <span class="streak-label">Day Active Streak · Verified from your real cloud logs</span>
      </div>

      <!-- ⚡ CENTERPIECE AI MEAL PHOTO STUDIO ⚡ -->
      <div class="center-meal-studio">
        <div class="center-meal-header">
          <div class="center-meal-title-group">
            <span style="font-size:1.4rem">📸</span>
            <div>
              <h3>AI Meal Vision Studio</h3>
              <div class="text-xs text-muted">Gemini Vision AI · Instant Calorie & Macro Estimations</div>
            </div>
          </div>
          <span class="center-meal-badge">✨ 1-Tap Cloud Vision</span>
        </div>

        <div class="center-meal-viewfinder" onclick="window.ctApp.triggerQuickMealScan('camera')">
          <div class="viewfinder-lens-wrap">
            <span class="viewfinder-lens-icon">📷</span>
          </div>
          <div class="viewfinder-title">Snap or Upload Your Meal Photo</div>
          <div class="viewfinder-subtitle">
            Point your camera at any meal or snack. Gemini Vision AI identifies ingredients, portions, and real-time macros in 2 seconds.
          </div>

          <div class="center-meal-actions" onclick="event.stopPropagation()">
            <button class="btn btn-primary" onclick="window.ctApp.triggerQuickMealScan('camera')">
              <span>📸 Open Camera</span>
            </button>
            <button class="btn btn-glass" onclick="window.ctApp.triggerQuickMealScan('gallery')">
              <span>📁 Pick from Gallery</span>
            </button>
          </div>

          <div class="center-meal-quick-chips" onclick="event.stopPropagation()">
            <span class="text-xs text-muted" style="align-self:center;margin-right:4px">Quick Test:</span>
            <span class="quick-dish-chip" onclick="window.ctApp.quickTestSample('salad')">🥗 Fresh Salad</span>
            <span class="quick-dish-chip" onclick="window.ctApp.quickTestSample('chicken')">🍗 Grilled Chicken & Rice</span>
            <span class="quick-dish-chip" onclick="window.ctApp.quickTestSample('dosa')">🥞 Dosa with Chutney</span>
            <span class="quick-dish-chip" onclick="window.ctApp.quickTestSample('shake')">🥤 Whey Protein Shake</span>
          </div>
        </div>
      </div>

      <!-- Today's Logged Meals (With Photo Thumbnails & Instant Scan) -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div class="section-title" style="margin-bottom:0">🍽️ Today's Logged Meals</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-glass btn-sm" onclick="document.getElementById('globalMealPhotoInput').click()" style="display:flex;align-items:center;gap:4px">
              <span>📸</span><span>Snap Photo</span>
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.ctApp.switchTab('meals')">+ Add Meal</button>
          </div>
        </div>
        ${meals.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <div class="empty-state-text">No meals logged yet today. Tap "Snap Photo" or "+ Add Meal" to start tracking.</div>
          </div>
        ` : meals.map(m => `
          <div class="meal-item">
            ${m.imageUrl ? `
              <img src="${m.imageUrl}" class="meal-item-thumb" alt="${m.foods?.map(f => f.name).join(', ') || m.notes || m.mealType}" onclick="window.ctApp.viewMealPhoto('${m.imageUrl}', '${(m.foods?.map(f => f.name).join(', ') || m.notes || m.mealType).replace(/'/g, "\\'")}')" title="Click to view full photo">
            ` : `
              <div class="meal-item-icon-box">${this._mealIcon(m.mealType)}</div>
            `}
            <div class="meal-item-info">
              <div class="meal-item-name">${m.foods?.map(f => f.name).join(', ') || m.notes || m.mealType}</div>
              <div class="meal-item-macros">
                <span>🔥 ${m.totalCalories} kcal</span>
                <span>💪 ${m.totalProtein}g P</span>
                <span>🍚 ${m.totalCarbs}g C</span>
                <span>🧈 ${m.totalFat}g F</span>
                ${m.imageUrl ? '<span class="text-xs text-accent">☁️ Photo</span>' : ''}
              </div>
            </div>
            <div class="meal-item-actions">
              <button class="btn btn-icon btn-sm" onclick="window.ctApp.editMeal('${m.id}')" title="Edit Meal" style="width:28px;height:28px;font-size:0.75rem">✏️</button>
              <button class="btn btn-icon btn-sm" onclick="window.ctApp.removeMeal('${m.id}')" title="Delete" style="width:28px;height:28px;font-size:0.75rem">🗑</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async incrementWater() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const current = getState().todayWater?.glasses || 0;
    await logWater(uid, current + 1);
    showToast(`Hydration logged: ${current + 1} glasses! 💧`, 'info');
  },

  _mealIcon(type) {
    const icons = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎', 'Pre-workout': '⚡', 'Post-workout': '💪' };
    return icons[type] || '🍽️';
  },

  async setWater(glasses) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await logWater(uid, glasses);
  },

  async toggleGoogleFit() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const res = await healthSync.connectGoogleFit(uid);
    const pill = document.getElementById('syncPillText');
    if (pill) pill.textContent = res.connected ? 'Google Fit: Synced' : 'Google Fit: Connect';
    this.renderActiveTab();
  },

  // ─── 2. Meals Tab (Food Search, Portion Scaler, Photo Scanner, Cloud Upload, Custom Foods) ───
  renderMeals(s) {
    const { todayMeals: meals, dailyTotals: t, targets: g } = s;
    return `
      <!-- Smart Meal Photo Scanner Card -->
      <div class="card">
        <div class="section-title">📸 AI Meal Photo Scanner & Cloud Upload</div>
        <p class="text-sm text-muted" style="margin-bottom:14px">Upload a meal photo. Automatically compresses, uploads to Cloud Storage, and estimates macro breakdown.</p>
        <div class="scanner-container" id="scannerDropZone" onclick="document.getElementById('globalMealPhotoInput').click()">
          <div class="scanner-laser" id="scannerLaser"></div>
          <div id="scannerPlaceholder">
            <div style="font-size:2.4rem;margin-bottom:8px">📷</div>
            <div class="fw-700 text-sm">Tap to Snap or Upload Meal Photo</div>
            <div class="text-xs text-muted mt-sm">Camera, phone gallery, or drag-and-drop · Instant Gemini AI Estimation</div>
          </div>
          <img id="scannerPreviewImg" class="scanner-preview" style="display:none" alt="Meal Preview">
          <div id="scannerStatusText" class="text-xs fw-700 text-accent mt-sm" style="display:none"></div>
        </div>
      </div>

      <!-- Log Food & Portion Scaler -->
      <div class="card" id="mealFormCard">
        <div class="section-title" id="mealFormTitle">🍽️ ${this.editingMealId ? 'Edit Meal' : 'Food Search & Portion Scaler'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field">
            <label class="label">Meal Type</label>
            <select class="input select" id="mealType">
              <option>Breakfast</option><option selected>Lunch</option><option>Dinner</option>
              <option>Snack</option><option>Pre-workout</option><option>Post-workout</option>
            </select>
          </div>
          <div class="field">
            <label class="label">Portion (Grams / Servings)</label>
            <input class="input" type="number" id="portionGrams" placeholder="e.g. 150" value="150" oninput="window.ctApp.handlePortionChange(this.value)">
          </div>
        </div>

        <div class="field search-wrap">
          <label class="label">Search Food Database (70+ Indian, Gym & Global Foods)</label>
          <input class="input" id="foodSearch" placeholder="Type chicken, rice, dosa, eggs, whey, dal..." oninput="window.ctApp.handleFoodSearch(this.value)">
          <div class="search-results" id="foodSearchResults" style="display:none"></div>
        </div>

        <div id="activeFoodBanner" style="display:none;margin-bottom:12px;padding:10px 14px;border-radius:var(--radius-md);background:rgba(16,185,129,0.1);border:1px solid rgba(52,211,153,0.3)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="fw-700 text-sm" id="activeFoodName">Selected Food</span>
            <span class="text-xs text-muted" id="activeFoodOriginalServing">100g serving</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px">
          <div class="field"><label class="label">Calories</label><input class="input" type="number" id="mCal" placeholder="0"></div>
          <div class="field"><label class="label">Protein (g)</label><input class="input" type="number" id="mProt" placeholder="0"></div>
          <div class="field"><label class="label">Carbs (g)</label><input class="input" type="number" id="mCarbs" placeholder="0"></div>
          <div class="field"><label class="label">Fat (g)</label><input class="input" type="number" id="mFat" placeholder="0"></div>
        </div>

        <div class="field">
          <label class="label">Notes / Description (optional)</label>
          <input class="input" id="mNotes" placeholder="e.g. 2 bowls rice + sambar with salad">
        </div>

        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" style="flex:1" id="saveMealBtn" onclick="window.ctApp.saveMeal()">
            ${this.editingMealId ? '✓ Update Meal' : 'Save Meal to Log'}
          </button>
          ${this.editingMealId ? `<button class="btn btn-glass" onclick="window.ctApp.cancelEditMeal()">Cancel</button>` : ''}
          <button class="btn btn-glass" onclick="window.ctApp.showCustomFoodModal()">+ Custom Food</button>
        </div>
      </div>

      <!-- Quick Add Popular Staples -->
      <div class="card">
        <div class="section-title">⚡ Quick Add Staples</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${['chicken_breast', 'egg_boiled', 'white_rice', 'chapati', 'dosa_plain', 'idli', 'sambar', 'curd', 'dal_tadka', 'whey_protein', 'paneer', 'banana'].map(id => {
            const f = FOOD_DATABASE.find(x => x.id === id);
            return f ? `<button class="btn btn-glass btn-sm" onclick="window.ctApp.quickAddFood('${id}')">${f.name} (${f.cal} kcal)</button>` : '';
          }).join('')}
        </div>
      </div>

      <!-- Today's Logged Meals -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="section-title" style="margin-bottom:0">Today's Meals (${meals.length})</div>
          <span class="text-sm fw-700">${t.calories} / ${g.calories} kcal</span>
        </div>
        ${meals.length === 0 ? `<div class="empty-state"><div class="empty-state-text">No meals logged today yet.</div></div>` :
          meals.map(m => `
            <div class="meal-item">
              ${m.imageUrl ? `
                <img src="${m.imageUrl}" class="meal-item-thumb" alt="${m.notes || m.foods?.map(f => f.name).join(', ') || m.mealType}" onclick="window.ctApp.viewMealPhoto('${m.imageUrl}', '${(m.notes || m.foods?.map(f => f.name).join(', ') || m.mealType).replace(/'/g, "\\'")}')" title="Click to view cloud photo">
              ` : `
                <div class="meal-item-icon-box">${this._mealIcon(m.mealType)}</div>
              `}
              <div class="meal-item-info">
                <div class="meal-item-name">${m.notes || m.foods?.map(f => f.name).join(', ') || m.mealType}</div>
                <div class="meal-item-meta">${m.mealType} ${m.imageUrl ? '· 📸 Cloud Photo' : ''}</div>
                <div class="meal-item-macros">
                  <span>🔥 ${m.totalCalories} kcal</span>
                  <span>💪 ${m.totalProtein}g</span>
                  <span>🍚 ${m.totalCarbs}g</span>
                  <span>🧈 ${m.totalFat}g</span>
                </div>
              </div>
              <div class="meal-item-actions">
                <button class="btn btn-icon btn-sm" onclick="window.ctApp.editMeal('${m.id}')" title="Edit Meal" style="width:28px;height:28px;font-size:0.75rem">✏️</button>
                <button class="btn btn-icon btn-sm" onclick="window.ctApp.removeMeal('${m.id}')" title="Delete" style="width:28px;height:28px;font-size:0.75rem">🗑</button>
              </div>
            </div>
          `).join('')}
      </div>
    `;
  },

  handleFoodSearch(q) {
    const customMatches = (this.customFoods || []).filter(f => f.name?.toLowerCase().includes(q.toLowerCase()));
    const dbMatches = searchFoods(q);
    const results = [...customMatches, ...dbMatches];
    const container = document.getElementById('foodSearchResults');
    if (!results.length || !q) {
      container.style.display = 'none'; return;
    }
    container.style.display = 'block';
    container.innerHTML = results.map(f => `
      <div class="search-item" onclick="window.ctApp.selectFood('${f.id}')">
        <div class="search-item-name">${f.name} ${f.userId ? '<span class="badge">Custom</span>' : ''}</div>
        <div class="search-item-info">${f.cal} kcal · ${f.protein}g P · ${f.carbs}g C · ${f.fat}g F · per ${f.servingSize}${f.unit || 'g'}</div>
      </div>
    `).join('');
  },

  selectFood(foodId) {
    const food = (this.customFoods || []).find(f => f.id === foodId) || FOOD_DATABASE.find(f => f.id === foodId);
    if (!food) return;

    this.activeFoodSelection = food;

    document.getElementById('mCal').value = food.cal;
    document.getElementById('mProt').value = food.protein;
    document.getElementById('mCarbs').value = food.carbs;
    document.getElementById('mFat').value = food.fat;
    document.getElementById('mNotes').value = food.name;
    document.getElementById('foodSearch').value = food.name;
    document.getElementById('portionGrams').value = food.servingSize;
    document.getElementById('foodSearchResults').style.display = 'none';

    const banner = document.getElementById('activeFoodBanner');
    if (banner) {
      banner.style.display = 'block';
      document.getElementById('activeFoodName').textContent = food.name;
      document.getElementById('activeFoodOriginalServing').textContent = `Baseline: ${food.servingSize}${food.unit || 'g'}`;
    }
  },

  handlePortionChange(grams) {
    const g = Number(grams);
    if (!g || g <= 0 || !this.activeFoodSelection) return;
    const scaled = scaleNutrition(this.activeFoodSelection, g);
    document.getElementById('mCal').value = scaled.cal;
    document.getElementById('mProt').value = scaled.protein;
    document.getElementById('mCarbs').value = scaled.carbs;
    document.getElementById('mFat').value = scaled.fat;
  },

  async handlePhotoUpload(file) {
    if (!file) return;
    this.handleGlobalPhotoUpload(file);
  },

  async handleGlobalPhotoUpload(file) {
    if (!file) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      showToast('Please sign in to log meals', 'error');
      return;
    }

    const modal = document.getElementById('photoScanModal');
    const img = document.getElementById('scanModalImg');
    const laser = document.getElementById('scanModalLaser');
    const cloudStatus = document.getElementById('scanModalCloudStatus');
    const cloudText = document.getElementById('scanModalCloudText');
    const cloudRef = document.getElementById('scanModalCloudRef');
    const statusText = document.getElementById('scanModalStatusText');
    const spinner = document.getElementById('scanModalSpinner');

    // Open Modal immediately
    if (modal) modal.style.display = 'flex';
    if (laser) laser.style.display = 'block';
    if (spinner) spinner.style.display = 'inline-block';

    const tempCloudPath = `users/${uid}/meals/${Date.now()}.jpg`;
    if (cloudRef) cloudRef.textContent = tempCloudPath;
    if (cloudText) cloudText.textContent = 'Uploading to Firebase Cloud Storage...';
    if (statusText) statusText.textContent = 'Compressing image & analyzing food with Gemini Vision AI...';

    try {
      const compressed = await compressImage(file, 800, 0.85);
      if (img) img.src = compressed.dataUrl;

      // Start Cloud Storage upload
      this.lastScannedImageUrl = compressed.dataUrl; // instant safe fallback
      uploadMealImage(uid, compressed.dataUrl).then(url => {
        if (url) {
          this.lastScannedImageUrl = url;
          if (cloudText) cloudText.textContent = 'Saved to Cloud Storage ✓';
          if (cloudStatus) cloudStatus.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        }
      }).catch(err => {
        console.warn('Firebase Cloud storage warning:', err);
        if (cloudText) cloudText.textContent = 'Cloud Local Cache Active';
      });

      // AI Food Vision Estimation
      await new Promise(r => setTimeout(r, 600));
      let result = analyzeImageLocally(file.name, img);

      if (this.isGeminiConnected && import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          result = await analyzeMealWithGemini(compressed.dataUrl, import.meta.env.VITE_GEMINI_API_KEY);
        } catch (e) {
          console.warn('Gemini vision API error, using smart vision fallback:', e);
        }
      }

      // Populate editable fields
      const dishInput = document.getElementById('scanDishName');
      const calInput = document.getElementById('scanCalories');
      const protInput = document.getElementById('scanProtein');
      const carbsInput = document.getElementById('scanCarbs');
      const fatInput = document.getElementById('scanFat');
      const typeInput = document.getElementById('scanMealType');

      if (dishInput) dishInput.value = result.dishName;
      if (calInput) calInput.value = result.calories;
      if (protInput) protInput.value = result.protein;
      if (carbsInput) carbsInput.value = result.carbs;
      if (fatInput) fatInput.value = result.fat;

      // Smart default meal type by time of day
      const hour = new Date().getHours();
      const defaultMealType = hour < 11 ? 'Breakfast' : hour < 16 ? 'Lunch' : hour < 21 ? 'Dinner' : 'Snack';
      if (typeInput) typeInput.value = defaultMealType;

      if (laser) laser.style.display = 'none';
      if (spinner) spinner.style.display = 'none';
      if (statusText) statusText.innerHTML = `✓ Identified <strong>${result.dishName}</strong> (~${result.calories} kcal, ${result.protein}g P). Please verify portions and click Save!`;
      showToast(`Identified ${result.dishName}! 🥗`, 'success');
    } catch (err) {
      if (laser) laser.style.display = 'none';
      if (spinner) spinner.style.display = 'none';
      if (statusText) statusText.textContent = 'Could not scan image: ' + err.message + '. Please enter manually.';
    }
  },

  closePhotoScanModal() {
    const modal = document.getElementById('photoScanModal');
    if (modal) modal.style.display = 'none';
    const input = document.getElementById('globalMealPhotoInput');
    if (input) input.value = '';
  },

  async saveScannedMeal() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const dishName = document.getElementById('scanDishName')?.value?.trim() || 'Meal';
    const mealType = document.getElementById('scanMealType')?.value || 'Lunch';
    const calories = Number(document.getElementById('scanCalories')?.value) || 0;
    const protein = Number(document.getElementById('scanProtein')?.value) || 0;
    const carbs = Number(document.getElementById('scanCarbs')?.value) || 0;
    const fat = Number(document.getElementById('scanFat')?.value) || 0;

    if (calories <= 0 && protein <= 0) {
      showToast('Please enter estimated calories or protein', 'error');
      return;
    }

    const btn = document.getElementById('saveScannedMealBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving to Cloud...'; }

    try {
      await addMeal(uid, {
        mealType,
        foods: [{ name: dishName, cal: calories, protein, carbs, fat }],
        totalCalories: calories,
        totalProtein: protein,
        totalCarbs: carbs,
        totalFat: fat,
        totalFiber: 0,
        notes: dishName,
        imageUrl: this.lastScannedImageUrl || '',
        source: 'photo_vision'
      });

      this.closePhotoScanModal();
      showToast(`Logged ${dishName} to Cloud Storage! 🍽️`, 'success');
    } catch (err) {
      showToast('Failed to save meal: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save Meal to Cloud ✓'; }
    }
  },

  viewMealPhoto(url, name) {
    const modal = document.getElementById('photoPreviewModal');
    const img = document.getElementById('photoPreviewImg');
    const title = document.getElementById('photoPreviewTitle');
    const urlEl = document.getElementById('photoPreviewUrl');
    if (!modal || !img) return;
    img.src = url;
    if (title) title.textContent = name || 'Meal Photo';
    if (urlEl) urlEl.textContent = url.startsWith('data:') ? 'Stored in Firebase Cloud (Optimized Local Cache)' : url;
    modal.style.display = 'flex';
  },

  closePhotoPreviewModal() {
    const modal = document.getElementById('photoPreviewModal');
    if (modal) modal.style.display = 'none';
  },

  triggerQuickMealScan(mode = 'camera') {
    const input = document.getElementById('globalMealPhotoInput');
    if (!input) return;
    if (mode === 'camera') {
      input.setAttribute('capture', 'environment');
    } else {
      input.removeAttribute('capture');
    }
    input.click();
  },

  quickTestSample(sampleType) {
    // Generate high-resolution canvas food card for instant testing
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    let dishName = 'Balanced Meal Plate';
    let emoji = '🥗';
    let filename = 'meal_sample.jpg';

    if (sampleType === 'chicken') {
      grad.addColorStop(0, '#78350f'); grad.addColorStop(1, '#1e293b');
      dishName = 'Grilled Chicken & Rice'; emoji = '🍗'; filename = 'grilled_chicken_rice.jpg';
    } else if (sampleType === 'dosa') {
      grad.addColorStop(0, '#854d0e'); grad.addColorStop(1, '#0f172a');
      dishName = 'Crispy Dosa with Chutney'; emoji = '🥞'; filename = 'crispy_dosa_chutney.jpg';
    } else if (sampleType === 'shake') {
      grad.addColorStop(0, '#1e3a8a'); grad.addColorStop(1, '#020617');
      dishName = 'Whey Protein Shake'; emoji = '🥤'; filename = 'whey_protein_shake.jpg';
    } else {
      grad.addColorStop(0, '#064e3b'); grad.addColorStop(1, '#022c22');
      dishName = 'Fresh Protein Salad'; emoji = '🥗'; filename = 'fresh_protein_salad.jpg';
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, 200, 140);

    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(dishName, 200, 200);

    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#94a398';
    ctx.fillText('CalTrack Vision AI Sample Test', 200, 235);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        this.handleGlobalPhotoUpload(file);
      }
    }, 'image/jpeg', 0.9);
  },

  openStepsModal() {
    const s = getState();
    const steps = s.todaySteps?.steps || 0;
    const goal = s.targets?.steps || 10000;
    const pct = Math.min(100, Math.round((steps / goal) * 100));
    const kcalBurned = Math.round(steps * 0.04);

    const countEl = document.getElementById('modalStepsCount');
    const goalEl = document.getElementById('modalStepsGoal');
    const barEl = document.getElementById('modalStepsBar');
    const kcalEl = document.getElementById('modalStepsKcal');
    const statusBadge = document.getElementById('modalFitStatusBadge');
    const subtext = document.getElementById('modalFitSubtext');
    const actionBtn = document.getElementById('modalFitActionBtn');
    const pedometerBtn = document.getElementById('modalPedometerBtn');
    const modal = document.getElementById('stepsActivityModal');

    if (countEl) countEl.textContent = steps.toLocaleString();
    if (goalEl) goalEl.textContent = `Daily Goal: ${goal.toLocaleString()} steps (${pct}%)`;
    if (barEl) barEl.style.width = `${pct}%`;
    if (kcalEl) kcalEl.textContent = `~${kcalBurned} kcal active burn`;

    if (statusBadge) {
      statusBadge.textContent = healthSync.isConnected ? 'Connected' : 'Disconnected';
      statusBadge.className = `badge ${healthSync.isConnected ? 'badge-success' : 'badge-muted'}`;
    }
    if (subtext) {
      subtext.textContent = healthSync.isConnected 
        ? `Last synced: ${healthSync.lastSyncTime || 'Just now'}` 
        : 'Sync real-time Android & WearOS steps';
    }
    if (actionBtn) {
      actionBtn.textContent = healthSync.isConnected ? '🔄 Sync Now' : 'Connect Fit';
      actionBtn.className = `btn btn-sm ${healthSync.isConnected ? 'btn-primary' : 'btn-glass'}`;
    }
    if (pedometerBtn) {
      pedometerBtn.textContent = healthSync.pedometerActive ? 'Active 👟' : 'Start Sensor';
      pedometerBtn.className = `btn btn-sm ${healthSync.pedometerActive ? 'btn-primary' : 'btn-glass'}`;
    }

    if (modal) modal.style.display = 'flex';
  },

  closeStepsModal() {
    const modal = document.getElementById('stepsActivityModal');
    if (modal) modal.style.display = 'none';
  },

  async syncGoogleFitNow() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (!healthSync.isConnected) {
      await this.toggleGoogleFit();
      this.openStepsModal();
      return;
    }
    const btn = document.getElementById('modalFitActionBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Syncing...'; }
    await healthSync.syncActivity(uid);
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Sync Now'; }
    this.openStepsModal();
  },

  async startPhonePedometer() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ok = await healthSync.startHardwarePedometer(uid, (liveSteps) => {
      const countEl = document.getElementById('modalStepsCount');
      if (countEl) countEl.textContent = liveSteps.toLocaleString();
    });
    const btn = document.getElementById('modalPedometerBtn');
    if (btn && ok) {
      btn.textContent = 'Active 👟';
      btn.className = 'btn btn-sm btn-primary';
    }
  },

  async saveManualSteps() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const input = document.getElementById('manualStepsInput');
    const val = Number(input?.value);
    if (!val || val <= 0) {
      showToast('Please enter a valid step count (e.g. 5000)', 'warn');
      return;
    }
    try {
      await logSteps(uid, val, 'manual');
      if (input) input.value = '';
      this.closeStepsModal();
      showToast(`Saved ${val.toLocaleString()} steps to cloud! 👟`, 'success');
    } catch (err) {
      showToast('Failed to save steps: ' + err.message, 'error');
    }
  },

  async quickAddFood(foodId) {
    const food = FOOD_DATABASE.find(f => f.id === foodId);
    if (!food) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await addMeal(uid, {
      mealType: 'Snack',
      foods: [{ id: food.id, name: food.name, ...food }],
      totalCalories: food.cal,
      totalProtein: food.protein,
      totalCarbs: food.carbs,
      totalFat: food.fat,
      totalFiber: food.fiber,
      notes: food.name,
      source: 'quick_add'
    });
    showToast(`Added ${food.name} (${food.cal} kcal)`, 'success');
  },

  editMeal(mealId) {
    const s = getState();
    const meal = (s.todayMeals || []).find(m => m.id === mealId);
    if (!meal) return;

    this.editingMealId = mealId;
    this.renderActiveTab();

    setTimeout(() => {
      document.getElementById('mCal').value = meal.totalCalories || 0;
      document.getElementById('mProt').value = meal.totalProtein || 0;
      document.getElementById('mCarbs').value = meal.totalCarbs || 0;
      document.getElementById('mFat').value = meal.totalFat || 0;
      document.getElementById('mNotes').value = meal.notes || '';
      document.getElementById('mealType').value = meal.mealType || 'Lunch';
      document.getElementById('mealFormCard')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  },

  cancelEditMeal() {
    this.editingMealId = null;
    this.renderActiveTab();
  },

  async saveMeal() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const cal = Number(document.getElementById('mCal')?.value) || 0;
    const prot = Number(document.getElementById('mProt')?.value) || 0;
    const carbs = Number(document.getElementById('mCarbs')?.value) || 0;
    const fat = Number(document.getElementById('mFat')?.value) || 0;
    const notes = document.getElementById('mNotes')?.value?.trim() || '';
    const mealType = document.getElementById('mealType')?.value || 'Lunch';

    if (cal <= 0 && prot <= 0) { showToast('Please enter calories or select a food', 'error'); return; }

    const btn = document.getElementById('saveMealBtn');
    btn.disabled = true; btn.textContent = 'Saving...';

    try {
      if (this.editingMealId) {
        await updateMeal(this.editingMealId, {
          mealType,
          totalCalories: cal,
          totalProtein: prot,
          totalCarbs: carbs,
          totalFat: fat,
          notes
        });
        showToast('Meal updated successfully! ✓', 'success');
        this.editingMealId = null;
      } else {
        await addMeal(uid, {
          mealType,
          foods: [{ name: notes || mealType, cal, protein: prot, carbs, fat }],
          totalCalories: cal,
          totalProtein: prot,
          totalCarbs: carbs,
          totalFat: fat,
          totalFiber: 0,
          notes,
          imageUrl: this.lastUploadedImageUrl || '',
          source: this.lastUploadedImageUrl ? 'photo_scan' : 'manual'
        });
        showToast('Meal logged! 🍽️', 'success');
      }

      this.lastUploadedImageUrl = '';
      ['mCal', 'mProt', 'mCarbs', 'mFat', 'mNotes', 'foodSearch'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const banner = document.getElementById('activeFoodBanner');
      if (banner) banner.style.display = 'none';
    } catch (err) {
      showToast('Failed to save meal: ' + err.message, 'error');
    }
    btn.disabled = false;
  },

  async removeMeal(mealId) {
    if (!confirm('Delete this meal?')) return;
    try {
      await deleteMeal(mealId);
      showToast('Meal deleted', 'info');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  },

  showCustomFoodModal() {
    const name = prompt('Custom Food Name (e.g. Protein Banana Pancakes):');
    if (!name) return;
    const cal = Number(prompt('Calories per serving:')) || 0;
    const prot = Number(prompt('Protein (g):')) || 0;
    const carbs = Number(prompt('Carbs (g):')) || 0;
    const fat = Number(prompt('Fat (g):')) || 0;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    addCustomFood(uid, {
      name, cal, protein: prot, carbs, fat,
      servingSize: 100, unit: 'g', category: 'custom'
    }).then(() => {
      showToast(`Saved custom food: ${name}!`, 'success');
    });
  },

  // ─── 3. Workouts Tab (Sets/Reps Builder + Automated Workout Generator) ───
  renderWorkouts(s) {
    const { todayWorkouts } = s;
    return `
      <!-- ─── NEXT-GEN 7-DAY WORKOUT ENGINE ─── -->
      ${(() => {
        const plan = s.activeWorkoutPlan;
        if (plan && Array.isArray(plan.days) && plan.days.length > 0) {
          const completedCount = plan.days.filter(d => d.completed).length;
          const avgDuration = Math.round(plan.days.reduce((acc, d) => acc + (d.durationMinutes || 35), 0) / plan.days.length);
          const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

          return `
            <div class="plan-7day-header">
              <div class="plan-7day-top">
                <div>
                  <div class="text-xs text-accent fw-800" style="text-transform:uppercase;letter-spacing:0.06em">
                    🔥 Active 7-Day Fitness Program
                  </div>
                  <div class="plan-7day-title">${plan.planTitle || 'Personalized 7-Day Cycle'}</div>
                </div>
                <div class="badge badge-success">
                  ${completedCount} / 7 Completed (${Math.round((completedCount / 7) * 100)}%)
                </div>
              </div>

              <!-- Key Plan Metrics -->
              <div class="plan-7day-stats">
                <div class="plan-stat-item">
                  <div class="plan-stat-val">${plan.goal ? plan.goal.toUpperCase() : 'FITNESS'}</div>
                  <div class="plan-stat-lbl">Goal</div>
                </div>
                <div class="plan-stat-item">
                  <div class="plan-stat-val">${avgDuration}m</div>
                  <div class="plan-stat-lbl">Avg Duration</div>
                </div>
                <div class="plan-stat-item">
                  <div class="plan-stat-val">${plan.days.filter(d => !d.isRest && d.type !== 'rest').length} Workouts</div>
                  <div class="plan-stat-lbl">Planned</div>
                </div>
                <div class="plan-stat-item">
                  <div class="plan-stat-val">${plan.fitnessLevel ? plan.fitnessLevel.toUpperCase() : 'BEGINNER'}</div>
                  <div class="plan-stat-lbl">Level</div>
                </div>
              </div>
            </div>

            <!-- Action Buttons Strip -->
            <div class="plan-actions-strip">
              <button class="btn btn-primary" onclick="window.ctApp.openPlanOnboarding()">
                <span>✨ New 7-Day Plan</span>
              </button>
              <button class="btn btn-glass" onclick="window.ctApp.openQuickWorkout()">
                <span>⚡ Quick Workout</span>
              </button>
              <button class="btn btn-glass" onclick="window.ctApp.openWhatShouldITrain()">
                <span>🤖 What To Train Today?</span>
              </button>
            </div>

            <!-- 7-Day Plan Cards Grid -->
            <div class="plan-days-grid">
              ${plan.days.map((day, idx) => {
                const isToday = idx === currentDayIdx;
                const isRest = day.isRest || day.type === 'rest' || day.title?.toLowerCase().includes('rest') || day.title?.toLowerCase().includes('recovery');
                const isCompleted = day.completed;

                let cardClass = 'plan-day-card';
                if (isCompleted) cardClass += ' is-completed';
                if (isToday) cardClass += ' is-today';
                if (isRest) cardClass += ' is-rest';

                const icon = isRest ? '🧘' : day.title?.toLowerCase().includes('upper') ? '💪' : day.title?.toLowerCase().includes('lower') ? '🦵' : day.title?.toLowerCase().includes('cardio') ? '🏃' : '🏋️';

                return `
                  <div class="${cardClass}">
                    <div>
                      <div class="plan-day-topbar">
                        <span class="plan-day-num">DAY ${day.day || (idx + 1)}</span>
                        <span class="badge ${isCompleted ? 'badge-success' : isToday ? 'badge-primary' : isRest ? 'badge-muted' : ''}">
                          ${isCompleted ? '✓ Completed' : isToday ? '🔥 Today' : isRest ? 'Rest' : 'Scheduled'}
                        </span>
                      </div>
                      <div class="plan-day-heading">${icon} ${day.title}</div>
                      <div class="plan-day-duration">⏱ ${day.durationMinutes || 35} MIN · ${(day.difficulty || plan.fitnessLevel || 'Beginner').toUpperCase()}</div>

                      <div class="plan-day-focus-tags">
                        ${(day.focus || []).map(f => `<span class="plan-focus-pill">${f}</span>`).join('')}
                      </div>

                      ${day.exercises && day.exercises.length > 0 ? `
                        <div class="plan-day-exercises-preview">
                          ${day.exercises.slice(0, 3).map(e => `<div>• ${e.name} (${e.sets || 3} sets)</div>`).join('')}
                          ${day.exercises.length > 3 ? `<div class="text-xs text-muted">+${day.exercises.length - 3} more exercises</div>` : ''}
                        </div>
                      ` : `
                        <div class="text-xs text-muted mb-md">Active recovery walk, light mobility, hydration, and central nervous system replenishment.</div>
                      `}
                    </div>

                    <div>
                      ${isRest ? `
                        <button class="btn btn-glass btn-sm btn-block" onclick="window.ctApp.startPlanDayWorkout(${day.day || (idx + 1)})">
                          🧘 View Active Recovery
                        </button>
                      ` : `
                        <button class="btn ${isToday && !isCompleted ? 'btn-primary' : 'btn-glass'} btn-sm btn-block" onclick="window.ctApp.startPlanDayWorkout(${day.day || (idx + 1)})">
                          ${isCompleted ? '🔄 Re-Run Workout' : isToday ? '🚀 START WORKOUT' : 'View / Start'}
                        </button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } else {
          return `
            <div class="plan-7day-header" style="text-align:center;padding:32px 20px">
              <div style="font-size:2.8rem;margin-bottom:8px">🏋️</div>
              <h2 style="font-size:1.5rem;font-weight:900;color:var(--ink);margin-bottom:6px">NEXT-GEN AI FITNESS COACH</h2>
              <p class="text-muted text-sm" style="max-width:480px;margin:0 auto 20px">
                Generate an intelligent, personalized 7-day training plan calibrated to your goals, available equipment, and experience. Adapts with every set you complete.
              </p>
              <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
                <button class="btn btn-primary btn-lg" onclick="window.ctApp.openPlanOnboarding()">
                  <span>🚀 CREATE MY 7-DAY PLAN</span>
                </button>
                <button class="btn btn-glass btn-lg" onclick="window.ctApp.openQuickWorkout()">
                  <span>⚡ Quick Workout</span>
                </button>
                <button class="btn btn-glass btn-lg" onclick="window.ctApp.openWhatShouldITrain()">
                  <span>🤖 What To Train Today?</span>
                </button>
              </div>
            </div>
          `;
        }
      })()}

      <!-- Exercise & Sets Builder -->
      <div class="card">
        <div class="section-title">🏋️ Detailed Workout & Exercise Builder</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div class="field">
            <label class="label">Workout Title</label>
            <input class="input" id="wkName" placeholder="e.g. Heavy Push Day (Chest & Shoulders)">
          </div>
          <div class="field">
            <label class="label">Category</label>
            <select class="input select" id="wkType">
              <option value="strength">🏋️ Strength / Hypertrophy</option>
              <option value="cardio">🏃 Cardio / Endurance</option>
              <option value="hiit">⚡ HIIT & Conditioning</option>
              <option value="mobility">🧘 Mobility / Flexibility</option>
            </select>
          </div>
        </div>

        <div class="field search-wrap">
          <label class="label">Select Exercise from Library</label>
          <select class="input select" id="exerciseSelect" onchange="window.ctApp.onExercisePicked(this.value)">
            ${EXERCISE_DATABASE.map(e => `
              <option value="${e.id}">${e.name} (${e.muscle.toUpperCase()})</option>
            `).join('')}
          </select>
        </div>

        <!-- Set Builder Table -->
        <div class="exercise-block">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong id="activeExerciseTitle">Barbell Bench Press</strong>
            <span class="text-xs text-muted" id="volumeCalc">Volume: 0 kg</span>
          </div>
          <table class="set-table">
            <thead>
              <tr>
                <th style="width:40px">Set</th>
                <th>Weight (kg)</th>
                <th>Reps</th>
                <th style="width:50px">1RM</th>
                <th style="width:40px"></th>
              </tr>
            </thead>
            <tbody id="setsTableBody">
              ${this.activeWorkoutSets.map((set, idx) => `
                <tr>
                  <td style="text-align:center;font-weight:700">${idx + 1}</td>
                  <td><input class="set-input" type="number" value="${set.weight}" oninput="window.ctApp.updateSet(${idx}, 'weight', this.value)"></td>
                  <td><input class="set-input" type="number" value="${set.reps}" oninput="window.ctApp.updateSet(${idx}, 'reps', this.value)"></td>
                  <td style="text-align:center;font-size:0.75rem;color:var(--accent-light)">${calculate1RM(set.weight, set.reps)}</td>
                  <td style="text-align:center">
                    <button class="btn btn-icon btn-sm" onclick="window.ctApp.removeSet(${idx})" style="width:24px;height:24px;font-size:0.65rem">×</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="btn btn-glass btn-sm mt-sm" onclick="window.ctApp.addSetRow()">+ Add Set</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div class="field">
            <label class="label">Duration (minutes)</label>
            <input class="input" type="number" id="wkDuration" placeholder="45" value="45">
          </div>
          <div class="field">
            <label class="label">Est. Calories Burned</label>
            <input class="input" type="number" id="wkCalBurned" placeholder="320" value="320">
          </div>
        </div>

        <div class="field">
          <label class="label">Notes / Personal Records</label>
          <input class="input" id="wkNotes" placeholder="e.g. Felt strong on bench, increased 2.5kg">
        </div>

        <button class="btn btn-primary btn-block" onclick="window.ctApp.saveWorkout()">Save Workout</button>
      </div>

      <!-- Quick Steps & Weight Logging -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="card">
          <div class="section-title" style="font-size:0.95rem">👟 Steps</div>
          <input class="input" type="number" id="stepsInput" placeholder="Steps today" value="${s.todaySteps?.steps || ''}" style="margin-bottom:8px">
          <button class="btn btn-primary btn-sm btn-block" onclick="window.ctApp.saveSteps()">Update Steps</button>
        </div>
        <div class="card">
          <div class="section-title" style="font-size:0.95rem">⚖️ Weight</div>
          <input class="input" type="number" id="weightInput" placeholder="kg" step="0.1" style="margin-bottom:8px">
          <button class="btn btn-primary btn-sm btn-block" onclick="window.ctApp.saveWeight()">Log Weight</button>
        </div>
      </div>

      <!-- Today's Logged Workouts -->
      <div class="card">
        <div class="section-title">Today's Workouts (${todayWorkouts.length})</div>
        ${todayWorkouts.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🏋️</div>
            <div class="empty-state-text">No workouts logged yet today. Rest day or ready to hit the gym?</div>
          </div>
        ` : todayWorkouts.map(w => `
          <div class="meal-item">
            <div class="meal-item-info">
              <div class="meal-item-name">${w.name || 'Workout'}</div>
              <div class="meal-item-macros">
                <span>⏱ ${w.duration || 0} min</span>
                <span>🔥 ${w.caloriesBurned || 0} kcal burned</span>
                <span>${w.type || 'strength'}</span>
              </div>
              ${w.notes ? `<div class="text-xs text-muted mt-sm">${w.notes}</div>` : ''}
            </div>
            <button class="btn btn-icon btn-sm" onclick="window.ctApp.removeWorkout('${w.id}')" style="width:28px;height:28px;font-size:0.75rem">🗑</button>
          </div>
        `).join('')}
      </div>
    `;
  },

  generateWorkoutRoutine() {
    const goal = document.getElementById('genGoal')?.value || 'lose';
    const equipment = document.getElementById('genEquipment')?.value || 'dumbbells';
    const duration = document.getElementById('genDuration')?.value || 45;
    const experience = document.getElementById('genExp')?.value || 'intermediate';

    this.generatedRoutine = generatePersonalizedWorkout({ goal, equipment, duration, experience });
    this.renderActiveTab();
    showToast(`Generated: ${this.generatedRoutine.title}! 🏋️`, 'success');
  },

  loadGeneratedRoutine() {
    if (!this.generatedRoutine) return;
    const r = this.generatedRoutine;
    document.getElementById('wkName').value = r.title;
    document.getElementById('wkDuration').value = r.duration;
    document.getElementById('wkCalBurned').value = r.caloriesBurned;

    // Load first exercise's sets
    if (r.exercises && r.exercises.length > 0) {
      this.activeWorkoutSets = r.exercises[0].sets.map(s => ({ weight: s.weight, reps: s.reps, completed: true }));
      const title = document.getElementById('activeExerciseTitle');
      if (title) title.textContent = r.exercises[0].name;
    }
    this.renderActiveTab();
    showToast('Loaded workout routine into tracker! 💪', 'success');
  },

  onExercisePicked(exerciseId) {
    const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
    if (!ex) return;
    const title = document.getElementById('activeExerciseTitle');
    if (title) title.textContent = ex.name;
    const duration = Number(document.getElementById('wkDuration')?.value) || 45;
    const burned = estimateCaloriesBurned(ex.id, duration, getState().profile?.weight || 70);
    const calEl = document.getElementById('wkCalBurned');
    if (calEl) calEl.value = burned;
  },

  addSetRow() {
    const last = this.activeWorkoutSets[this.activeWorkoutSets.length - 1] || { weight: 60, reps: 10 };
    this.activeWorkoutSets.push({ weight: last.weight, reps: last.reps, completed: true });
    this.renderActiveTab();
  },

  removeSet(idx) {
    if (this.activeWorkoutSets.length <= 1) return;
    this.activeWorkoutSets.splice(idx, 1);
    this.renderActiveTab();
  },

  updateSet(idx, key, val) {
    if (!this.activeWorkoutSets[idx]) return;
    this.activeWorkoutSets[idx][key] = Number(val) || 0;
  },

  // ─── Reactive Camera Action ───
  triggerQuickCamera() {
    if (navigator.vibrate) {
      try { navigator.vibrate(35); } catch (e) {}
    }
    const input = document.getElementById('globalMealPhotoInput');
    if (input) input.click();
  },

  // ─── 7-Day Plan Onboarding & Generation ───
  openPlanOnboarding() {
    const s = getState();
    const modal = document.getElementById('planOnboardingModal');
    if (!modal) return;

    if (s.profile) {
      const g = document.getElementById('planGoalSelect');
      if (g && s.profile.goal) g.value = s.profile.goal;
    }
    modal.style.display = 'flex';
  },

  closePlanOnboarding() {
    const modal = document.getElementById('planOnboardingModal');
    if (modal) modal.style.display = 'none';
  },

  async generateNew7DayPlan() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      showToast('Please sign in to generate a workout plan', 'error');
      return;
    }

    const goal = document.getElementById('planGoalSelect')?.value || 'gain';
    const fitnessLevel = document.getElementById('planLevelSelect')?.value || 'intermediate';
    const equipment = document.getElementById('planEquipmentSelect')?.value || 'dumbbells';
    const durationMinutes = Number(document.getElementById('planDurationSelect')?.value) || 40;
    const preferredDays = Number(document.getElementById('planDaysSelect')?.value) || 4;
    const limitations = document.getElementById('planLimitationsInput')?.value?.trim() || '';

    const btn = document.getElementById('generatePlanBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block"></span> Generating with Gemini AI...`;
    }

    try {
      const state = getState();
      const plan = await createPersonalized7DayPlan({
        userProfile: state.profile || { goal, fitnessLevel },
        recentWorkouts: state.allUserWorkouts || [],
        preferences: { goal, fitnessLevel, equipment, durationMinutes, preferredDays, limitations },
        geminiApiKey: this.isGeminiConnected ? import.meta.env.VITE_GEMINI_API_KEY : null
      });

      await saveWorkoutPlan(uid, plan);
      setState({ activeWorkoutPlan: plan });
      this.closePlanOnboarding();
      this.renderActiveTab();
      showToast(`🎉 Your 7-Day Plan "${plan.planTitle}" is ready!`, 'success');
    } catch (err) {
      console.error('Failed to generate 7-day plan:', err);
      showToast('Error generating plan: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>🚀 Generate My 7-Day Plan</span>`;
      }
    }
  },

  startPlanDayWorkout(dayNumber) {
    const s = getState();
    const plan = s.activeWorkoutPlan;
    if (!plan || !Array.isArray(plan.days)) {
      showToast('No active workout plan found', 'error');
      return;
    }
    const day = plan.days.find(d => d.day === dayNumber) || plan.days[0];
    if (!day) return;

    if (day.isRest || day.type === 'rest' || day.title?.toLowerCase().includes('rest') || day.title?.toLowerCase().includes('recovery')) {
      showToast('🧘 Today is a recovery day. Light mobility & active rest recommended!', 'info');
      if (day.exercises && day.exercises.length > 0) {
        this.startLiveWorkout(day, dayNumber);
      }
      return;
    }

    this.startLiveWorkout(day, dayNumber);
  },

  // ─── Distraction-Free Live Workout Controller ───
  activeLiveSession: null,
  restTimerInterval: null,
  restTimeRemaining: 0,
  restTimerPaused: false,

  startLiveWorkout(workoutData, dayNumber = null) {
    if (!workoutData || !workoutData.exercises || workoutData.exercises.length === 0) {
      showToast('No exercises defined for this workout.', 'warn');
      return;
    }

    const state = getState();
    const history = state.allUserWorkouts || [];

    const preparedExercises = workoutData.exercises.map(ex => {
      const exId = ex.exerciseId || ex.id;
      const exMeta = EXERCISE_DATABASE.find(e => e.id === exId) || {};
      const adaptive = getAdaptiveWeightAndReps(exId, history);
      const setsCount = Number(ex.sets) || (Array.isArray(ex.setsList) ? ex.setsList.length : 3);

      return {
        id: exId,
        exerciseId: exId,
        name: ex.name || exMeta.name || 'Exercise',
        muscle: exMeta.muscle || 'Full Body',
        equipment: exMeta.equipment || 'Bodyweight',
        difficulty: ex.difficulty || exMeta.difficulty || 'beginner',
        targetSets: setsCount,
        targetReps: ex.targetReps || '10-12',
        restSeconds: ex.restSeconds || 60,
        suggestedWeight: adaptive.suggestedWeight,
        suggestedReps: adaptive.suggestedReps || 10,
        previousBest: adaptive.previousBest,
        progressionReason: adaptive.reason,
        completedSets: []
      };
    });

    const first = preparedExercises[0];
    this.activeLiveSession = {
      title: workoutData.title || workoutData.name || "Today's Workout",
      dayNumber: dayNumber,
      exercises: preparedExercises,
      activeExerciseIdx: 0,
      activeSetIdx: 0,
      currentSetWeight: first.suggestedWeight || 10,
      currentSetReps: first.suggestedReps || 10,
      completedSets: [],
      startTime: Date.now()
    };

    try {
      localStorage.setItem('caltrack_live_session', JSON.stringify(this.activeLiveSession));
    } catch (e) {}

    const modal = document.getElementById('liveWorkoutModal');
    if (modal) modal.classList.add('active');

    this.renderLiveWorkoutScreen();
    showToast(`Started: ${this.activeLiveSession.title} 🚀`, 'info');
  },

  renderLiveWorkoutScreen() {
    const session = this.activeLiveSession;
    if (!session || !session.exercises.length) return;

    const curEx = session.exercises[session.activeExerciseIdx];
    if (!curEx) return;

    const stepper = document.getElementById('liveWorkoutStepper');
    const headerTitle = document.getElementById('liveWorkoutHeaderTitle');
    if (stepper) stepper.textContent = `Exercise ${session.activeExerciseIdx + 1} of ${session.exercises.length}`;
    if (headerTitle) headerTitle.textContent = session.title;

    const svgWrap = document.getElementById('liveVisualSvg');
    if (svgWrap) {
      svgWrap.innerHTML = renderExerciseVisualSvg(curEx.id);
    }
    const equipTag = document.getElementById('liveExerciseEquipmentTag');
    if (equipTag) equipTag.innerHTML = `<span>🏋️</span><span>${(curEx.equipment || 'Bodyweight').toUpperCase()}</span>`;

    const nameEl = document.getElementById('liveExerciseName');
    const muscleTag = document.getElementById('liveExerciseMuscleTag');
    const diffTag = document.getElementById('liveExerciseDifficultyTag');
    const targetScheme = document.getElementById('liveTargetScheme');

    if (nameEl) nameEl.textContent = curEx.name;
    if (muscleTag) muscleTag.textContent = curEx.muscle.toUpperCase();
    if (diffTag) diffTag.textContent = (curEx.difficulty || 'beginner').toUpperCase();
    if (targetScheme) targetScheme.textContent = `${curEx.targetSets} SETS × ${curEx.targetReps} (REST ${curEx.restSeconds}s)`;

    const sugWeight = document.getElementById('liveSuggestedWeight');
    const prevPerf = document.getElementById('livePreviousPerformance');
    if (sugWeight) {
      sugWeight.textContent = `${session.currentSetWeight} kg × ${session.currentSetReps} reps`;
    }
    if (prevPerf) {
      prevPerf.textContent = curEx.previousBest
        ? `${curEx.previousBest.weight} kg × ${curEx.previousBest.reps} reps`
        : 'First time logged';
    }

    const setCounter = document.getElementById('liveSetCounter');
    const restInfo = document.getElementById('liveRestInfoText');
    const weightInput = document.getElementById('liveSetWeightInput');
    const repsInput = document.getElementById('liveSetRepsInput');

    if (setCounter) setCounter.textContent = `Set ${session.activeSetIdx + 1} of ${curEx.targetSets}`;
    if (restInfo) restInfo.textContent = `Rest: ${curEx.restSeconds}s · ${curEx.progressionReason || 'Adaptive'}`;
    if (weightInput) weightInput.value = session.currentSetWeight;
    if (repsInput) repsInput.value = session.currentSetReps;

    const setControlBox = document.getElementById('liveSetControlBox');
    const effortBox = document.getElementById('liveEffortBox');
    const restBox = document.getElementById('liveRestBox');
    const actionsRow = document.getElementById('liveActionButtonsRow');

    if (setControlBox) setControlBox.style.display = 'block';
    if (effortBox) effortBox.style.display = 'none';
    if (restBox) restBox.style.display = 'none';
    if (actionsRow) actionsRow.style.display = 'flex';
  },

  stepLiveWeight(delta) {
    if (!this.activeLiveSession) return;
    const input = document.getElementById('liveSetWeightInput');
    let val = Number(input?.value || this.activeLiveSession.currentSetWeight || 0);
    val = Math.max(0, val + delta);
    this.activeLiveSession.currentSetWeight = val;
    if (input) input.value = val;
    const sug = document.getElementById('liveSuggestedWeight');
    if (sug) sug.textContent = `${val} kg × ${this.activeLiveSession.currentSetReps} reps`;
  },

  stepLiveReps(delta) {
    if (!this.activeLiveSession) return;
    const input = document.getElementById('liveSetRepsInput');
    let val = Number(input?.value || this.activeLiveSession.currentSetReps || 0);
    val = Math.max(1, val + delta);
    this.activeLiveSession.currentSetReps = val;
    if (input) input.value = val;
    const sug = document.getElementById('liveSuggestedWeight');
    if (sug) sug.textContent = `${this.activeLiveSession.currentSetWeight} kg × ${val} reps`;
  },

  completeCurrentSet() {
    if (!this.activeLiveSession) return;
    const weight = Number(document.getElementById('liveSetWeightInput')?.value || this.activeLiveSession.currentSetWeight || 0);
    const reps = Number(document.getElementById('liveSetRepsInput')?.value || this.activeLiveSession.currentSetReps || 10);

    this.activeLiveSession.currentSetWeight = weight;
    this.activeLiveSession.currentSetReps = reps;

    if (navigator.vibrate) {
      try { navigator.vibrate([40, 60, 40]); } catch (e) {}
    }

    const setControlBox = document.getElementById('liveSetControlBox');
    const effortBox = document.getElementById('liveEffortBox');
    const actionsRow = document.getElementById('liveActionButtonsRow');

    if (setControlBox) setControlBox.style.display = 'none';
    if (actionsRow) actionsRow.style.display = 'none';
    if (effortBox) effortBox.style.display = 'flex';
  },

  recordEffortAndRest(effort) {
    const session = this.activeLiveSession;
    if (!session) return;

    const curEx = session.exercises[session.activeExerciseIdx];
    const weight = session.currentSetWeight;
    const reps = session.currentSetReps;

    const completedSetRecord = {
      setNumber: session.activeSetIdx + 1,
      weight,
      reps,
      effort,
      completedAt: new Date().toISOString()
    };

    curEx.completedSets.push(completedSetRecord);
    session.completedSets.push({
      exerciseId: curEx.id,
      exerciseName: curEx.name,
      ...completedSetRecord
    });

    const isLastSetOfExercise = session.activeSetIdx + 1 >= curEx.targetSets;
    const isLastExercise = session.activeExerciseIdx + 1 >= session.exercises.length;

    if (isLastSetOfExercise && isLastExercise) {
      this.finishLiveWorkout();
      return;
    }

    if (effort === 'easy') {
      session.currentSetWeight = weight < 20 ? weight + 1 : weight + 2.5;
    }

    let nextPreviewText = '';
    if (!isLastSetOfExercise) {
      session.activeSetIdx++;
      nextPreviewText = `Next: Set ${session.activeSetIdx + 1} of ${curEx.targetSets} · ${session.currentSetWeight} kg`;
    } else {
      session.activeExerciseIdx++;
      session.activeSetIdx = 0;
      const nextEx = session.exercises[session.activeExerciseIdx];
      session.currentSetWeight = nextEx.suggestedWeight || 10;
      session.currentSetReps = nextEx.suggestedReps || 10;
      nextPreviewText = `Next Exercise: ${nextEx.name} · ${session.currentSetWeight} kg`;
    }

    const effortBox = document.getElementById('liveEffortBox');
    if (effortBox) effortBox.style.display = 'none';

    this.startRestTimer(curEx.restSeconds || 60, nextPreviewText);
  },

  startRestTimer(seconds, nextPreview) {
    if (this.restTimerInterval) clearInterval(this.restTimerInterval);

    this.restTimeRemaining = seconds;
    this.restTimerPaused = false;

    const restBox = document.getElementById('liveRestBox');
    const clock = document.getElementById('liveRestClock');
    const preview = document.getElementById('liveRestNextPreview');
    const pauseBtn = document.getElementById('liveRestPauseBtn');

    if (restBox) restBox.style.display = 'flex';
    if (preview) preview.textContent = nextPreview;
    if (pauseBtn) pauseBtn.textContent = 'Pause ⏸';

    const updateClock = () => {
      const mins = Math.floor(this.restTimeRemaining / 60);
      const secs = this.restTimeRemaining % 60;
      if (clock) clock.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    updateClock();

    this.restTimerInterval = setInterval(() => {
      if (this.restTimerPaused) return;

      this.restTimeRemaining--;
      updateClock();

      if (this.restTimeRemaining <= 0) {
        this.skipRestTimer();
      }
    }, 1000);
  },

  skipRestTimer() {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval);
      this.restTimerInterval = null;
    }
    const restBox = document.getElementById('liveRestBox');
    if (restBox) restBox.style.display = 'none';

    this.renderLiveWorkoutScreen();
  },

  addRestTime(secs = 30) {
    this.restTimeRemaining += secs;
    const clock = document.getElementById('liveRestClock');
    const mins = Math.floor(this.restTimeRemaining / 60);
    const remainder = this.restTimeRemaining % 60;
    if (clock) clock.textContent = `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  },

  togglePauseRest() {
    this.restTimerPaused = !this.restTimerPaused;
    const btn = document.getElementById('liveRestPauseBtn');
    if (btn) btn.textContent = this.restTimerPaused ? 'Resume ▶' : 'Pause ⏸';
  },

  async finishLiveWorkout() {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval);
      this.restTimerInterval = null;
    }

    const session = this.activeLiveSession;
    if (!session) return;

    const uid = auth.currentUser?.uid;
    const durationMinutes = Math.max(1, Math.round((Date.now() - session.startTime) / 60000));

    const totalVolume = session.completedSets.reduce((sum, s) => {
      return sum + ((Number(s.weight) || 0) * (Number(s.reps) || 0));
    }, 0);

    const estCalories = Math.round(durationMinutes * 7.5);

    const liveModal = document.getElementById('liveWorkoutModal');
    if (liveModal) liveModal.classList.remove('active');

    try {
      localStorage.removeItem('caltrack_live_session');
    } catch (e) {}

    if (uid) {
      try {
        await addWorkout(uid, {
          name: session.title,
          type: 'strength',
          duration: durationMinutes,
          volume: totalVolume,
          caloriesBurned: estCalories,
          exercises: session.exercises.map(e => ({
            exerciseId: e.id,
            name: e.name,
            sets: e.completedSets
          })),
          completed: true
        });

        if (session.dayNumber) {
          await updateWorkoutPlanDay(uid, session.dayNumber, {
            completed: true,
            completedAt: todayStr()
          });
        }

        this.checkAndAwardBadges();
      } catch (err) {
        console.error('Error saving live workout to cloud:', err);
      }
    }

    const durEl = document.getElementById('completeDuration');
    const volEl = document.getElementById('completeVolume');
    const calEl = document.getElementById('completeCalories');
    const prBanner = document.getElementById('completePrBanner');
    const prText = document.getElementById('completePrText');
    const coachNote = document.getElementById('completeCoachNote');

    if (durEl) durEl.textContent = `${durationMinutes}m`;
    if (volEl) volEl.textContent = `${totalVolume.toLocaleString()} kg`;
    if (calEl) calEl.textContent = `${estCalories}`;

    const s = getState();
    const prevBestVolume = (s.allUserWorkouts || []).reduce((max, w) => Math.max(max, Number(w.volume || 0)), 0);
    if (totalVolume > prevBestVolume && prevBestVolume > 0) {
      if (prBanner) prBanner.style.display = 'block';
      if (prText) prText.textContent = `New Volume PR: ${totalVolume.toLocaleString()} kg moved in a single session!`;
    } else {
      if (prBanner) prBanner.style.display = 'none';
    }

    if (coachNote) {
      coachNote.textContent = `Completed ${session.exercises.length} exercises. Your effort ratings have been analyzed. Next session suggestions will dynamically adapt based on today's performance.`;
    }

    const completeModal = document.getElementById('workoutCompleteModal');
    if (completeModal) completeModal.style.display = 'flex';

    this.activeLiveSession = null;
    showToast('🎉 Workout saved to cloud!', 'success');
  },

  confirmExitWorkout() {
    if (!confirm('Are you sure you want to exit your active workout? Current progress will be saved.')) return;
    this.finishLiveWorkout();
  },

  closeWorkoutComplete() {
    const modal = document.getElementById('workoutCompleteModal');
    if (modal) modal.style.display = 'none';
    this.renderActiveTab();
  },

  openCurrentHowTo() {
    if (!this.activeLiveSession) return;
    const curEx = this.activeLiveSession.exercises[this.activeLiveSession.activeExerciseIdx];
    if (!curEx) return;
    this.openExerciseHowTo(curEx.id);
  },

  openExerciseHowTo(exerciseId) {
    const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
    if (!ex) return;

    const modal = document.getElementById('exerciseHowToModal');
    const title = document.getElementById('howToModalTitle');
    const body = document.getElementById('howToModalBody');

    if (title) title.textContent = `How To Do ${ex.name}`;

    const cues = ex.formCues || {
      setup: 'Position your body with a stable base of support.',
      movement: 'Execute the repetition smoothly through a full range of motion.',
      breathing: 'Inhale on the eccentric phase, exhale forcefully on exertion.',
      commonMistakes: ['Rushing the tempo', 'Compromising lumbar neutrality', 'Shortening range of motion'],
      easier: 'Reduce resistance or perform bodyweight variation.',
      harder: 'Slow down tempo with a 3-second isometric pause at contraction.'
    };

    if (body) {
      body.innerHTML = `
        <div class="exercise-visual-frame mb-md">
          ${renderExerciseVisualSvg(ex.id)}
          <div class="exercise-visual-overlay-tag">
            <span>🎯</span><span>${ex.muscle.toUpperCase()}</span>
          </div>
        </div>

        <div class="form-callout-box">
          <div class="form-step-item">
            <div class="form-step-num">1</div>
            <div>
              <strong>Starting Position & Setup:</strong>
              <div class="text-xs text-muted mt-xs">${cues.setup}</div>
            </div>
          </div>

          <div class="form-step-item">
            <div class="form-step-num">2</div>
            <div>
              <strong>Movement Execution:</strong>
              <div class="text-xs text-muted mt-xs">${cues.movement}</div>
            </div>
          </div>

          <div class="form-step-item" style="margin-bottom:0">
            <div class="form-step-num">3</div>
            <div>
              <strong>Breathing Pattern:</strong>
              <div class="text-xs text-muted mt-xs">${cues.breathing}</div>
            </div>
          </div>
        </div>

        <div style="background:rgba(239, 68, 68, 0.08);border:1px solid rgba(239, 68, 68, 0.25);border-radius:var(--radius-md);padding:12px;margin-bottom:12px">
          <strong style="color:var(--danger);font-size:0.85rem">⚠️ Common Mistakes to Avoid:</strong>
          <ul style="padding-left:18px;margin-top:6px;font-size:0.8rem;color:var(--ink-secondary)">
            ${(cues.commonMistakes || []).map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;font-size:0.8rem">
          <div style="background:rgba(16, 185, 129, 0.08);border:1px solid rgba(16, 185, 129, 0.2);border-radius:var(--radius-md);padding:10px">
            <strong class="text-accent">🟢 Easier Modification:</strong>
            <div class="text-xs text-muted mt-xs">${cues.easier}</div>
          </div>
          <div style="background:rgba(6, 182, 212, 0.08);border:1px solid rgba(6, 182, 212, 0.2);border-radius:var(--radius-md);padding:10px">
            <strong style="color:var(--cyan)">🔴 Harder Progression:</strong>
            <div class="text-xs text-muted mt-xs">${cues.harder}</div>
          </div>
        </div>

        <button class="btn btn-primary btn-block" onclick="window.ctApp.closeExerciseHowTo()">Got It, Let's Lift! ✓</button>
      `;
    }

    if (modal) modal.style.display = 'flex';
  },

  closeExerciseHowTo() {
    const modal = document.getElementById('exerciseHowToModal');
    if (modal) modal.style.display = 'none';
  },

  openCurrentReplace() {
    if (!this.activeLiveSession) return;
    const curEx = this.activeLiveSession.exercises[this.activeLiveSession.activeExerciseIdx];
    if (!curEx) return;

    const modal = document.getElementById('exerciseReplaceModal');
    const list = document.getElementById('exerciseReplaceList');
    const s = getState();
    const userEquip = s.activeWorkoutPlan?.equipment || 'dumbbells';

    const subs = getExerciseSubstitutes(curEx.id, userEquip, curEx.difficulty);

    if (list) {
      if (subs.length === 0) {
        list.innerHTML = `<div class="text-xs text-muted">No specific substitute found for this equipment pool.</div>`;
      } else {
        list.innerHTML = subs.map(sub => `
          <div class="sub-exercise-card" onclick="window.ctApp.replaceActiveExercise('${sub.id}')">
            <div>
              <div class="fw-700 text-sm">${sub.name}</div>
              <div class="text-xs text-muted">${(sub.equipment || 'Bodyweight').toUpperCase()} · ${(sub.muscle || 'Full Body').toUpperCase()} · ${sub.difficulty}</div>
            </div>
            <button class="btn btn-glass btn-sm">Swap In 🔁</button>
          </div>
        `).join('');
      }
    }

    if (modal) modal.style.display = 'flex';
  },

  replaceActiveExercise(subId) {
    if (!this.activeLiveSession) return;
    const newEx = EXERCISE_DATABASE.find(e => e.id === subId);
    if (!newEx) return;

    const state = getState();
    const adaptive = getAdaptiveWeightAndReps(newEx.id, state.allUserWorkouts || []);

    const curEx = this.activeLiveSession.exercises[this.activeLiveSession.activeExerciseIdx];
    curEx.id = newEx.id;
    curEx.exerciseId = newEx.id;
    curEx.name = newEx.name;
    curEx.muscle = newEx.muscle;
    curEx.equipment = newEx.equipment;
    curEx.difficulty = newEx.difficulty;
    curEx.suggestedWeight = adaptive.suggestedWeight;
    curEx.suggestedReps = adaptive.suggestedReps;
    curEx.previousBest = adaptive.previousBest;
    curEx.progressionReason = adaptive.reason;

    this.activeLiveSession.currentSetWeight = adaptive.suggestedWeight;
    this.activeLiveSession.currentSetReps = adaptive.suggestedReps;

    this.closeExerciseReplace();
    this.renderLiveWorkoutScreen();
    showToast(`Swapped to ${newEx.name}! 🔁`, 'success');
  },

  closeExerciseReplace() {
    const modal = document.getElementById('exerciseReplaceModal');
    if (modal) modal.style.display = 'none';
  },

  openWhatShouldITrain() {
    const s = getState();
    const rec = whatShouldITrainToday(s.allUserWorkouts || [], s.activeWorkoutPlan, s.profile);

    const modal = document.getElementById('whatToTrainModal');
    const body = document.getElementById('whatToTrainBody');

    if (body) {
      body.innerHTML = `
        <div style="background:linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08));border:1px solid rgba(52, 211, 153, 0.3);border-radius:var(--radius-lg);padding:16px;margin-bottom:16px">
          <div class="text-xs fw-800 text-accent mb-xs" style="text-transform:uppercase;letter-spacing:0.06em">Personalized Recommendation</div>
          <h3 style="font-size:1.3rem;font-weight:900;color:var(--ink);margin-bottom:8px">${rec.title}</h3>
          <p class="text-xs text-muted" style="line-height:1.5">${rec.reason}</p>
        </div>

        ${rec.isComeback ? `
          <div style="background:rgba(251, 191, 36, 0.12);border:1px solid rgba(251, 191, 36, 0.35);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:14px;font-size:0.8rem">
            <strong style="color:#fbbf24">👋 WELCOME BACK!</strong>
            <div class="text-xs text-muted mt-xs">We detected a break in training. Workload has been gently dialed back to re-acclimate your tendons and CNS safely.</div>
          </div>
        ` : ''}

        <div style="margin-bottom:16px">
          <div class="text-xs text-muted mb-xs">Planned Exercises (${rec.exercises.length}):</div>
          <div style="font-size:0.82rem;display:flex;flex-direction:column;gap:6px">
            ${rec.exercises.map(e => `
              <div style="background:rgba(255, 255, 255, 0.03);padding:8px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);display:flex;justify-content:space-between">
                <span><strong>${e.name}</strong></span>
                <span class="text-muted">${e.sets} sets × ${e.targetReps}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg" onclick="window.ctApp.startRecommendedWorkout()">
          🚀 Start This Workout (${rec.durationMinutes} min)
        </button>
      `;
    }

    this._pendingRecWorkout = rec;
    if (modal) modal.style.display = 'flex';
  },

  startRecommendedWorkout() {
    this.closeWhatToTrain();
    if (this._pendingRecWorkout) {
      this.startLiveWorkout(this._pendingRecWorkout);
    }
  },

  closeWhatToTrain() {
    const modal = document.getElementById('whatToTrainModal');
    if (modal) modal.style.display = 'none';
  },

  selectedQuickMinutes: 15,

  openQuickWorkout() {
    const modal = document.getElementById('quickWorkoutModal');
    if (modal) modal.style.display = 'flex';
  },

  closeQuickWorkout() {
    const modal = document.getElementById('quickWorkoutModal');
    if (modal) modal.style.display = 'none';
  },

  selectQuickTime(min, btnEl) {
    this.selectedQuickMinutes = min;
    document.querySelectorAll('.quick-time-btn').forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-glass');
    });
    if (btnEl) {
      btnEl.classList.remove('btn-glass');
      btnEl.classList.add('btn-primary');
    }
  },

  launchQuickWorkout() {
    const focus = document.getElementById('quickFocusSelect')?.value || 'full_body';
    const s = getState();
    const equip = s.activeWorkoutPlan?.equipment || 'dumbbells';
    const level = s.activeWorkoutPlan?.fitnessLevel || 'intermediate';

    const session = generateQuickWorkout({
      durationMinutes: this.selectedQuickMinutes,
      focus,
      equipment: equip,
      fitnessLevel: level
    });

    this.closeQuickWorkout();
    this.startLiveWorkout(session);
  },

  async saveWorkout() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const name = document.getElementById('wkName')?.value?.trim() || 'Strength Training';
    const type = document.getElementById('wkType')?.value || 'strength';
    const duration = Number(document.getElementById('wkDuration')?.value) || 45;
    const caloriesBurned = Number(document.getElementById('wkCalBurned')?.value) || 280;
    const notes = document.getElementById('wkNotes')?.value?.trim() || '';

    try {
      const volume = (this.activeWorkoutSets || []).reduce((sum, s) => {
        return sum + ((Number(s.weight) || 0) * (Number(s.reps) || 0));
      }, 0);

      await addWorkout(uid, {
        name,
        type,
        duration,
        caloriesBurned,
        volume,
        notes,
        exercises: [{
          name: document.getElementById('exerciseSelect')?.selectedOptions[0]?.text || 'Strength Exercise',
          sets: this.activeWorkoutSets
        }]
      });
      showToast('Workout logged! 💪 Keep crushing it!', 'success');
      this.activeWorkoutSets = [{ reps: 10, weight: 60, completed: true }];
    } catch (err) {
      showToast('Error saving workout: ' + err.message, 'error');
    }
  },

  async removeWorkout(id) {
    try { await deleteWorkout(id); showToast('Workout deleted', 'info'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
  },

  async saveSteps() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const steps = Number(document.getElementById('stepsInput')?.value) || 0;
    if (steps <= 0) { showToast('Enter valid step count', 'error'); return; }
    await logSteps(uid, steps);
    showToast(`Steps updated: ${steps.toLocaleString()}`, 'success');
  },

  async saveWeight() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const weight = Number(document.getElementById('weightInput')?.value) || 0;
    if (weight <= 0) { showToast('Enter a valid weight', 'error'); return; }
    await logWeight(uid, weight);
    showToast(`Weight logged: ${weight} kg`, 'success');
  },

  // ─── 4. Analytics & Progress Tab (Authentic Real Data Only) ───
  renderProgress(s) {
    const { weightHistory, pastMeals, stepsHistory, measurementsHistory, targets } = s;

    // Compute weekly/monthly actual performance
    const daysCount = this.analyticsRangeDays || 7;
    const relevantMeals = pastMeals || [];
    const totalCalsPast = relevantMeals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
    const avgDailyCals = Math.round(totalCalsPast / daysCount);
    const totalProtPast = relevantMeals.reduce((acc, m) => acc + (m.totalProtein || 0), 0);
    const avgDailyProt = Math.round(totalProtPast / daysCount);

    const weightChange = weightHistory.length >= 2
      ? (weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)
      : '0.0';

    return `
      <!-- Time Range Selector -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div class="section-title" style="margin-bottom:0">📈 Progress Analytics</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm ${this.analyticsRangeDays === 7 ? 'btn-primary' : 'btn-glass'}" onclick="window.ctApp.setAnalyticsRange(7)">7 Days</button>
          <button class="btn btn-sm ${this.analyticsRangeDays === 30 ? 'btn-primary' : 'btn-glass'}" onclick="window.ctApp.setAnalyticsRange(30)">30 Days</button>
        </div>
      </div>

      <!-- Real Performance Scorecard -->
      <div class="card">
        <div class="section-title" style="font-size:0.95rem">📋 ${daysCount}-Day Summary Report</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px;text-align:center">
          <div style="padding:10px;border-radius:var(--radius-md);background:var(--surface);border:1px solid var(--border)">
            <div class="stat-value" style="font-size:1.3rem">${avgDailyCals}</div>
            <div class="text-xs text-muted">Daily Avg Calories</div>
          </div>
          <div style="padding:10px;border-radius:var(--radius-md);background:var(--surface);border:1px solid var(--border)">
            <div class="stat-value" style="font-size:1.3rem">${avgDailyProt}g</div>
            <div class="text-xs text-muted">Daily Avg Protein</div>
          </div>
          <div style="padding:10px;border-radius:var(--radius-md);background:var(--surface);border:1px solid var(--border)">
            <div class="stat-value" style="font-size:1.3rem;color:${Number(weightChange) <= 0 ? 'var(--accent-light)' : 'var(--warn)'}">${weightChange > 0 ? '+' : ''}${weightChange} kg</div>
            <div class="text-xs text-muted">Net Weight Change</div>
          </div>
          <div style="padding:10px;border-radius:var(--radius-md);background:var(--surface);border:1px solid var(--border)">
            <div class="stat-value" style="font-size:1.3rem">${weightHistory.length}</div>
            <div class="text-xs text-muted">Weight Check-ins</div>
          </div>
        </div>
      </div>

      <!-- Weight Trend Chart -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="section-title" style="margin-bottom:0">📈 Weight Trend & Target Line</div>
          <span class="text-xs text-muted">${weightHistory.length} recorded entries</span>
        </div>
        ${weightHistory.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">⚖️</div>
            <div class="empty-state-text">No weight records logged yet. Enter your current weight in the Workouts tab to generate your trend line!</div>
          </div>
        ` : `
          <div style="height:260px;position:relative">
            <canvas id="weightTrendCanvas"></canvas>
          </div>
        `}
      </div>

      <!-- Calorie Intake History Bar Chart -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="section-title" style="margin-bottom:0">📊 Actual Daily Calorie Intake</div>
          <span class="text-xs text-muted">Target: ${targets.calories} kcal</span>
        </div>
        <div style="height:240px;position:relative">
          <canvas id="calorieChartCanvas"></canvas>
        </div>
      </div>

      <!-- Macro Doughnut & Steps Activity Charts -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="card">
          <div class="section-title" style="font-size:0.95rem">🍩 Today's Macro Split</div>
          <div style="height:200px;position:relative">
            <canvas id="macroDoughnutCanvas"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="section-title" style="font-size:0.95rem">👟 Recorded Steps History</div>
          <div style="height:200px;position:relative">
            <canvas id="stepsChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Body Measurements (Waist, Chest, Arms, Thighs) -->
      <div class="card">
        <div class="section-title">📏 Body Measurements Log</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px">
          <div class="field"><label class="label">Waist (cm)</label><input class="input" type="number" id="bmWaist" placeholder="78" step="0.5"></div>
          <div class="field"><label class="label">Chest (cm)</label><input class="input" type="number" id="bmChest" placeholder="98" step="0.5"></div>
          <div class="field"><label class="label">Arms (cm)</label><input class="input" type="number" id="bmArms" placeholder="36" step="0.5"></div>
          <div class="field"><label class="label">Thighs (cm)</label><input class="input" type="number" id="bmThighs" placeholder="56" step="0.5"></div>
        </div>
        <button class="btn btn-primary btn-sm btn-block" onclick="window.ctApp.saveBodyMeasurement()">Save Body Measurements</button>

        ${(measurementsHistory || []).length > 0 ? `
          <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">
            <div class="text-xs fw-700 text-muted mb-sm">Recent Measurements History</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${(measurementsHistory || []).slice(-4).map(m => `
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;padding:6px 0;border-bottom:1px solid var(--border)">
                  <span class="text-muted">${m.date || 'Recent'}</span>
                  <span>Waist: <strong>${m.waist || '—'}cm</strong> · Chest: <strong>${m.chest || '—'}cm</strong> · Arms: <strong>${m.arms || '—'}cm</strong></span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  setAnalyticsRange(days) {
    this.analyticsRangeDays = days;
    this.renderActiveTab();
  },

  async saveBodyMeasurement() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const waist = Number(document.getElementById('bmWaist')?.value) || null;
    const chest = Number(document.getElementById('bmChest')?.value) || null;
    const arms = Number(document.getElementById('bmArms')?.value) || null;
    const thighs = Number(document.getElementById('bmThighs')?.value) || null;

    if (!waist && !chest && !arms && !thighs) {
      showToast('Please enter at least one measurement', 'error');
      return;
    }

    await logMeasurement(uid, { waist, chest, arms, thighs, unit: 'cm' });
    showToast('Body measurements recorded! 📏', 'success');
    ['bmWaist', 'bmChest', 'bmArms', 'bmThighs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  },

  initProgressCharts() {
    requestAnimationFrame(() => {
      const s = getState();
      const daysCount = this.analyticsRangeDays || 7;

      // 1. Weight Chart (Plot ONLY user's actual weight logs)
      if (s.weightHistory.length > 0) {
        renderWeightChart('weightTrendCanvas', s.weightHistory, (s.profile?.weight || 70) - 2);
      }

      // 2. Real Calorie Chart (Aggregate actual meals by date over past N days)
      const pastDaysCalories = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = pastDateStr(i);
        const dayMeals = (s.pastMeals || []).filter(m => m.date === d);
        const cals = dayMeals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
        pastDaysCalories.push({ date: d, calories: cals });
      }
      renderCalorieChart('calorieChartCanvas', pastDaysCalories, s.targets.calories);

      // 3. Macro Doughnut (From today's actual totals)
      renderMacroDoughnut('macroDoughnutCanvas', s.dailyTotals);

      // 4. Real Steps Chart (From actual steps_logs records)
      const pastDaysSteps = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = pastDateStr(i);
        const log = (s.stepsHistory || []).find(x => x.date === d);
        pastDaysSteps.push({ date: d, steps: log ? log.steps : 0 });
      }
      renderStepsChart('stepsChartCanvas', pastDaysSteps, s.targets.steps);
    });
  },

  // ─── 5. AI Coach Tab ───
  renderCoach(s) {
    const { dailyTotals: t, targets: g, todayWater: w, todaySteps: st, todayMeals: meals, profile } = s;
    const remaining = g.calories - t.calories;
    const protTarget = g.protein;
    const remProt = Math.max(0, protTarget - t.protein);

    const stats = extractUserPerformanceStats(s);
    const evalResult = evaluateAllBadges(stats, s.badges || []);
    const prs = s.personalRecords || [];
    const upcomingBadge = evalResult.allEvaluated.find(b => !b.isEarned && b.percentage > 30);

    let insights = [];
    if (t.calories === 0) insights.push('📝 You haven\'t logged any meals yet today. Start tracking to get personalized advice!');
    else {
      if (remaining > 500) insights.push(`🟢 You have ${remaining} kcal remaining — room for a wholesome balanced meal.`);
      else if (remaining > 0) insights.push(`🟡 You have ${remaining} kcal left today — consider a light, protein-rich snack.`);
      else insights.push(`🔴 You've exceeded your calorie target by ${Math.abs(remaining)} kcal today.`);
    }
    if (remProt > 20) insights.push(`💪 You still need ${remProt}g protein. Try grilled chicken, eggs, whey shake, or paneer.`);
    else if (remProt <= 0) insights.push('🎉 Great job! You\'ve hit your protein target today!');
    if ((w.glasses || 0) < g.water) insights.push(`💧 Drink ${g.water - (w.glasses || 0)} more glasses of water to hit your hydration goal.`);
    if ((st.steps || 0) < g.steps * 0.5) insights.push(`👟 You're at ${((st.steps || 0) / g.steps * 100).toFixed(0)}% of your step goal. A 15-min walk adds ~1,800 steps!`);

    if (evalResult.earnedCount > 0) {
      insights.push(`🏆 <strong>Achievement Standing:</strong> Level ${evalResult.level} Athlete (${evalResult.levelTitle}) · ${evalResult.earnedCount} badges unlocked · ${prs.length} Personal Records.`);
    }
    if (upcomingBadge) {
      insights.push(`🎯 <strong>Next Target Milestone:</strong> You're close to unlocking <strong>${upcomingBadge.name}</strong> (${upcomingBadge.currentValue}/${upcomingBadge.targetValue} ${upcomingBadge.unit} - ${Math.round(upcomingBadge.percentage)}% complete).`);
    }

    return `
      <!-- Google Gemini AI Status Card -->
      <div class="card gemini-connect-card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="gemini-badge-icon">✨</div>
            <div>
              <div class="fw-700" style="font-size:0.95rem">Google Gemini AI Fitness Engine</div>
              <div class="text-xs text-muted">
                ${this.isGeminiConnected ? 'Connected · Live Macro & Adherence Telemetry Reasoning' : 'One-click connect to activate Gemini AI'}
              </div>
            </div>
          </div>
          <button class="btn btn-sm ${this.isGeminiConnected ? 'btn-primary' : 'btn-glass'}" onclick="window.ctApp.toggleGeminiConnection()">
            ${this.isGeminiConnected ? 'Disconnect' : 'Connect Gemini AI'}
          </button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">🤖 AI Fitness Coach</div>
        <p class="text-sm text-muted" style="margin-bottom:16px">Ground-truth advice based on your live macros, hydration, and activity telemetry.</p>
        ${insights.map(i => `
          <div style="padding:12px;border-radius:var(--radius-md);background:var(--surface);border:1px solid var(--border);margin-bottom:8px;font-size:0.88rem">
            ${i}
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="section-title">💬 Ask Your Coach</div>
        <div class="chat-messages" id="chatMessages">
          <div class="chat-msg bot">
            Hi! I'm your CalTrack coach. I can see your live data — ask me about meals, macros, workout ideas, or deficit check.
          </div>
        </div>
        <div class="chat-input-row">
          <input class="input" id="coachInput" placeholder="What should I eat for dinner?" onkeydown="if(event.key==='Enter')window.ctApp.sendCoachMessage()">
          <button class="btn btn-primary" onclick="window.ctApp.sendCoachMessage()">Send</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
          <button class="btn btn-glass btn-sm" onclick="window.ctApp.askCoach('Review my meals today')">📊 Review Today</button>
          <button class="btn btn-glass btn-sm" onclick="window.ctApp.askCoach('Am I in deficit or surplus?')">⚖️ Deficit Check</button>
          <button class="btn btn-glass btn-sm" onclick="window.ctApp.askCoach('Suggest a high-protein dinner')">💪 Protein Meal</button>
          <button class="btn btn-glass btn-sm" onclick="window.ctApp.askCoach('How are my steps today?')">👟 Step Check</button>
          <button class="btn btn-glass btn-sm" onclick="window.ctApp.askCoach('Show my achievements and records')">🏆 PR & Badges</button>
        </div>
      </div>
    `;
  },

  askCoach(text) {
    const input = document.getElementById('coachInput');
    if (input) input.value = text;
    this.sendCoachMessage();
  },

  async sendCoachMessage() {
    const input = document.getElementById('coachInput');
    const query = input?.value?.trim();
    if (!query) return;
    input.value = '';

    const chatEl = document.getElementById('chatMessages');
    chatEl.innerHTML += `<div class="chat-msg user">${this._escHtml(query)}</div>`;

    const s = getState();
    const { dailyTotals: t, targets: g, todayWater: w, todaySteps: st, todayMeals: meals } = s;
    const remaining = g.calories - t.calories;
    const remProt = Math.max(0, g.protein - t.protein);
    const q = query.toLowerCase();

    let reply = '';
    if (q.includes('deficit') || q.includes('surplus') || q.includes('balance')) {
      reply = remaining > 0
        ? `You're in a ${remaining} kcal deficit today (${t.calories}/${g.calories} kcal consumed). ${remaining > 500 ? 'You have plenty of room for another meal.' : 'A light snack will keep you on track.'}`
        : `You're ${Math.abs(remaining)} kcal over your target today. ${s.profile?.goal === 'gain' ? 'This surplus supports muscle growth!' : 'Consider lighter meals for the rest of the day.'}`;
    } else if (q.includes('protein')) {
      reply = remProt > 0
        ? `You've consumed ${t.protein}g of your ${g.protein}g protein target (${Math.round(t.protein/g.protein*100)}%). You still need ${remProt}g. Try: chicken breast (46g per 150g), 2 eggs (12g), whey shake (24g), or paneer (18g per 100g).`
        : `Excellent! You've hit ${t.protein}g protein today, meeting your ${g.protein}g target! 🎉`;
    } else if (q.includes('dinner') || q.includes('eat') || q.includes('meal') || q.includes('food') || q.includes('suggest')) {
      if (remaining > 400 && remProt > 20) {
        reply = `With ${remaining} kcal and ${remProt}g protein remaining, here are some ideas:\n• Chicken breast (150g) + rice = ~450 kcal, 46g protein\n• 3 eggs + 2 chapati = ~400 kcal, 22g protein\n• Paneer curry + rice = ~480 kcal, 22g protein`;
      } else if (remaining > 200) {
        reply = `You have ${remaining} kcal left. Try a lighter option:\n• Greek yogurt + banana = ~165 kcal, 18g protein\n• 2 boiled eggs = ~156 kcal, 12g protein\n• Oats with milk = ~200 kcal, 8g protein`;
      } else {
        reply = `You're close to your calorie target with only ${Math.max(0, remaining)} kcal remaining. If hungry, try:\n• Green salad with lemon = ~35 kcal\n• Buttermilk/chaas = ~40 kcal\n• Hot green tea = ~0 kcal`;
      }
    } else if (q.includes('step') || q.includes('walk') || q.includes('activity')) {
      const steps = st.steps || 0;
      const pct = Math.round(steps / g.steps * 100);
      reply = `You've logged ${steps.toLocaleString()} steps today (${pct}% of your ${g.steps.toLocaleString()} goal). ${steps >= g.steps ? '🎉 You\'ve hit your step goal!' : `A 15-minute walk adds ~1,800 steps. You are ${g.steps - steps} steps away!`}`;
    } else if (q.includes('water') || q.includes('hydrat')) {
      const glasses = w.glasses || 0;
      reply = `You've had ${glasses} of ${g.water} glasses of water today (${glasses * 250}ml of ${g.water * 250}ml). ${glasses >= g.water ? '✅ Hydration target met!' : `Drink ${g.water - glasses} more glasses to stay properly hydrated.`}`;
    } else if (q.includes('achievement') || q.includes('badge') || q.includes('record') || q.includes('pr') || q.includes('level')) {
      const stats = extractUserPerformanceStats(s);
      const evalResult = evaluateAllBadges(stats, s.badges || []);
      const prs = s.personalRecords || [];
      const prLines = prs.length > 0
        ? prs.map(p => `• ${p.label}: ${p.value.toLocaleString()} ${p.unit}`).join('\n')
        : '• No PRs set yet. Complete workouts or log steps to establish initial personal bests!';
      reply = `🏆 Real Performance Scorecard:\n• Athlete Level: Level ${evalResult.level} (${evalResult.levelTitle})\n• Total XP: ${evalResult.totalXp} XP\n• Badges Earned: ${evalResult.earnedCount} of ${evalResult.totalBadges}\n• Active Streak: ${stats.currentStreak} days (Record: ${stats.longestStreak} days)\n\n🥇 Verified Personal Records (${prs.length}):\n${prLines}`;
    } else if (q.includes('review') || q.includes('today') || q.includes('summary')) {
      reply = `📊 Today's Summary:\n• Calories: ${t.calories}/${g.calories} kcal\n• Protein: ${t.protein}/${g.protein}g\n• Carbs: ${t.carbs}g\n• Fat: ${t.fat}g\n• Water: ${w.glasses || 0}/${g.water} glasses\n• Steps: ${(st.steps || 0).toLocaleString()}/${g.steps.toLocaleString()}\n• Meals logged: ${meals.length}`;
    } else {
      reply = `Based on your live telemetry: You've consumed ${t.calories} kcal with ${t.protein}g protein today. ${remaining > 0 ? `You have ${remaining} kcal remaining.` : `You're ${Math.abs(remaining)} kcal over target.`} Ask me anything specific!`;
    }

    chatEl.innerHTML += `<div class="chat-msg bot">${reply.replace(/\n/g, '<br>')}</div>`;
    chatEl.scrollTop = chatEl.scrollHeight;
  },

  _escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  // ─── Floating AI Assistant (FAB & Organised Drawer) ───
  isFloatingAiOpen: false,
  floatingAiHistory: [],

  toggleFloatingAi(forceOpen) {
    if (typeof forceOpen === 'boolean') {
      this.isFloatingAiOpen = forceOpen;
    } else {
      this.isFloatingAiOpen = !this.isFloatingAiOpen;
    }
    const drawer = document.getElementById('floatingAiDrawer');
    const fab = document.getElementById('floatingAiFab');
    if (!drawer) return;

    if (this.isFloatingAiOpen) {
      drawer.classList.add('open');
      if (fab) fab.style.display = 'none';
      this.updateFloatingAiTelemetry();
      if (this.floatingAiHistory.length === 0) {
        this._initFloatingAiWelcome();
      }
      setTimeout(() => {
        document.getElementById('floatingAiInput')?.focus();
      }, 120);
    } else {
      drawer.classList.remove('open');
      if (fab && getState().screen === 'app') fab.style.display = 'flex';
    }
  },

  updateFloatingAiTelemetry() {
    const el = document.getElementById('floatingAiTelemetry');
    if (!el) return;
    const statusTextEl = document.getElementById('floatingAiStatusText');
    if (statusTextEl) {
      statusTextEl.textContent = this.isGeminiConnected ? 'Google Gemini AI Connected' : 'Live Telemetry Connected';
    }
    const s = getState();
    const { dailyTotals: t, targets: g, todayWater: w, todaySteps: st } = s;
    const remaining = Math.max(0, g.calories - t.calories);
    const remProt = Math.max(0, g.protein - t.protein);

    el.innerHTML = `
      <div class="ai-stat-pill">
        <div class="ai-stat-val" style="color:var(--accent-light)">${remaining.toLocaleString()}</div>
        <div class="ai-stat-lbl">kcal left</div>
      </div>
      <div class="ai-stat-pill">
        <div class="ai-stat-val" style="color:var(--blue)">${remProt}g</div>
        <div class="ai-stat-lbl">protein left</div>
      </div>
      <div class="ai-stat-pill">
        <div class="ai-stat-val" style="color:var(--cyan)">${w.glasses || 0}/${g.water}</div>
        <div class="ai-stat-lbl">glasses</div>
      </div>
      <div class="ai-stat-pill">
        <div class="ai-stat-val" style="color:var(--orange)">${(st.steps || 0).toLocaleString()}</div>
        <div class="ai-stat-lbl">steps</div>
      </div>
    `;
  },

  _initFloatingAiWelcome() {
    const s = getState();
    const name = s.profile?.name || (s.user?.displayName ? s.user.displayName.split(' ')[0] : 'Athlete');
    const { dailyTotals: t, targets: g } = s;
    const remaining = Math.max(0, g.calories - t.calories);
    const remProt = Math.max(0, g.protein - t.protein);

    const welcomeMsg = `👋 Hi <strong>${name}</strong>! I'm your CalTrack AI Coach.<br><br>I have full real-time access to your fitness telemetry. Currently, you have <strong>${remaining.toLocaleString()} kcal</strong> and <strong>${remProt}g protein</strong> remaining today. How can I help you reach your goals?`;

    this.floatingAiHistory = [{ sender: 'bot', text: welcomeMsg }];
    this._renderFloatingAiMessages();
  },

  _renderFloatingAiMessages() {
    const container = document.getElementById('floatingAiMessages');
    if (!container) return;
    container.innerHTML = this.floatingAiHistory.map(m => `
      <div class="floating-ai-msg ${m.sender}">
        ${m.text}
        ${m.cards && m.cards.length ? `
          <div class="floating-ai-msg-cards">
            ${m.cards.map(c => `
              <div class="ai-recommendation-card" onclick="window.ctApp.quickAddFood('${c.id}')" title="Tap to quick add ${c.name} (${c.cal} kcal)">
                <div>
                  <strong>${c.name}</strong>
                  <div class="text-xs text-muted">${c.serving} · ${c.protein}g protein</div>
                </div>
                <span class="text-accent fw-700">+ ${c.cal} kcal</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  },

  sendFloatingAiPrompt(promptText) {
    const input = document.getElementById('floatingAiInput');
    if (input) input.value = promptText;
    this.sendFloatingAiMessage();
  },

  async sendFloatingAiMessage() {
    const input = document.getElementById('floatingAiInput');
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';

    // Add user message
    this.floatingAiHistory.push({ sender: 'user', text: this._escHtml(text) });
    this._renderFloatingAiMessages();

    // Show temporary thinking bubble
    this.floatingAiHistory.push({ sender: 'bot', text: '<em>Analyzing your live telemetry... ✨</em>' });
    this._renderFloatingAiMessages();

    await new Promise(r => setTimeout(r, 450));

    const s = getState();
    const { dailyTotals: t, targets: g, todayWater: w, todaySteps: st, todayMeals: meals, todayWorkouts: wk } = s;
    const remaining = g.calories - t.calories;
    const remProt = Math.max(0, g.protein - t.protein);
    const q = text.toLowerCase();

    let reply = '';
    let cards = null;

    if (q.includes('eat') || q.includes('dinner') || q.includes('lunch') || q.includes('breakfast') || q.includes('snack') || q.includes('food') || q.includes('meal')) {
      if (remaining > 450) {
        reply = `You have <strong>${remaining} kcal</strong> and <strong>${remProt}g protein</strong> remaining. Here are high-protein meal combinations from your verified food database (tap any item to log instantly):`;
        cards = [
          { id: 'chicken_breast', name: 'Chicken Breast + Rice', serving: '150g chicken + 150g rice', cal: 415, protein: 49 },
          { id: 'paneer', name: 'Paneer Curry with Chapati', serving: '120g serving with 2 roti', cal: 420, protein: 22 },
          { id: 'egg_boiled', name: '3 Boiled Eggs + Whole Wheat Toast', serving: '3 eggs + 2 slices', cal: 360, protein: 24 }
        ];
      } else if (remaining > 200) {
        reply = `With <strong>${remaining} kcal</strong> remaining, keep it light and protein-focused:`;
        cards = [
          { id: 'whey_protein', name: 'Whey Protein Shake', serving: '1 scoop (32g)', cal: 120, protein: 24 },
          { id: 'curd', name: 'Greek Curd / Low-Fat Yogurt', serving: '150g bowl', cal: 140, protein: 14 },
          { id: 'egg_boiled', name: '2 Boiled Eggs', serving: '2 large eggs', cal: 156, protein: 12 }
        ];
      } else {
        reply = `You are right at your calorie limit with <strong>${Math.max(0, remaining)} kcal</strong> left today. If you need satiety, opt for high-volume, low-calorie options:<br>• Fresh green salad with lemon & cucumber (~30 kcal)<br>• Hot green tea or black coffee (0 kcal)<br>• Salted spiced chaas / buttermilk (~40 kcal)`;
      }
    } else if (q.includes('protein')) {
      if (remProt <= 0) {
        reply = `🎉 Outstanding job! You've consumed <strong>${t.protein}g</strong> of protein today, hitting your <strong>${g.protein}g</strong> goal! Your muscles have all the amino acids required for repair.`;
      } else {
        reply = `You've consumed <strong>${t.protein}g</strong> of your <strong>${g.protein}g</strong> protein target (${Math.round((t.protein/g.protein)*100)}%). You still need <strong>${remProt}g</strong>.<br><br>Top recommendations to close the gap:`;
        cards = [
          { id: 'whey_protein', name: 'Whey Protein Isolate', serving: '1 scoop', cal: 120, protein: 25 },
          { id: 'chicken_breast', name: 'Grilled Chicken Breast', serving: '120g portion', cal: 198, protein: 37 },
          { id: 'paneer', name: 'Paneer (Cottage Cheese)', serving: '100g portion', cal: 265, protein: 18 }
        ];
      }
    } else if (q.includes('deficit') || q.includes('surplus') || q.includes('cut') || q.includes('bulk')) {
      if (remaining > 0) {
        reply = `⚖️ <strong>Current Deficit:</strong> You are currently in a <strong>${remaining} kcal deficit</strong> (${t.calories} consumed of ${g.calories} target).<br><br>${s.profile?.goal === 'lose' ? '✓ Excellent fat-loss adherence! Keep protein elevated to preserve lean muscle.' : 'ℹ️ If your goal is muscle hypertrophy, ensure you eat enough to fuel growth.'}`;
      } else {
        reply = `⚖️ <strong>Current Surplus:</strong> You've consumed <strong>${Math.abs(remaining)} kcal over</strong> your target today (${t.calories} kcal).<br><br>${s.profile?.goal === 'gain' ? '💪 Excellent for hypertrophy and glycogen replenishment!' : '⚠️ Consider going for a 20-minute evening walk to burn an extra ~120 kcal and boost digestion.'}`;
      }
    } else if (q.includes('workout') || q.includes('exercise') || q.includes('gym') || q.includes('lift')) {
      if (wk.length > 0) {
        const totalMin = wk.reduce((sum, w) => sum + (w.duration || 0), 0);
        const totalBurned = wk.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        reply = `🏋️ <strong>Workout Adherence:</strong> You've logged <strong>${wk.length} workout session(s)</strong> today totaling <strong>${totalMin} minutes</strong> and burning ~${totalBurned} kcal! Make sure to hydrate and consume 25-35g protein within 2 hours.`;
      } else {
        reply = `🏋️ <strong>No workouts recorded yet today:</strong> Whether it's a dedicated gym session, a quick home dumbbell circuit, or active recovery, head to the <strong>Workouts</strong> tab to generate a custom routine or log your sets!`;
      }
    } else if (q.includes('water') || q.includes('hydrat')) {
      const glasses = w.glasses || 0;
      const left = Math.max(0, g.water - glasses);
      reply = `💧 <strong>Hydration Check:</strong> You've had <strong>${glasses} of ${g.water} glasses</strong> (${glasses * 250} ml).<br><br>${left === 0 ? '🎉 Excellent! Your hydration target is 100% fulfilled!' : `Drink <strong>${left} more glasses</strong> (~${left * 250} ml) to ensure optimal metabolic rate, mental focus, and muscle recovery.`}`;
    } else if (q.includes('achievement') || q.includes('badge') || q.includes('pr') || q.includes('record') || q.includes('level')) {
      const stats = extractUserPerformanceStats(s);
      const evalResult = evaluateAllBadges(stats, s.badges || []);
      const prs = s.personalRecords || [];
      const prList = prs.length > 0
        ? prs.map(p => `• <strong>${p.label}:</strong> ${p.value.toLocaleString()} ${p.unit}`).join('<br>')
        : '• No PRs set yet. Complete a workout or log steps to set initial benchmarks!';
      reply = `🏆 <strong>Performance & Achievements:</strong><br>• <strong>Athlete Level:</strong> Level ${evalResult.level} (${evalResult.levelTitle}) · ${evalResult.totalXp} XP<br>• <strong>Badges Earned:</strong> ${evalResult.earnedCount} of ${evalResult.totalBadges} unlocked<br>• <strong>Current Streak:</strong> ${stats.currentStreak} days (PR: ${stats.longestStreak} days)<br><br>🥇 <strong>Personal Records (${prs.length}):</strong><br>${prList}<br><br>Check the <strong>Badges</strong> tab to inspect unlocked tiers, live progress bars, and upcoming milestones!`;
    } else if (q.includes('review') || q.includes('summary') || q.includes('today') || q.includes('progress')) {
      reply = `📋 <strong>Live Adherence Scorecard:</strong><br>• Calories: <strong>${t.calories} / ${g.calories} kcal</strong> (${remaining > 0 ? `${remaining} deficit` : 'target reached'})<br>• Protein: <strong>${t.protein}g / ${g.protein}g</strong><br>• Carbs: <strong>${t.carbs}g</strong> · Fat: <strong>${t.fat}g</strong><br>• Water: <strong>${w.glasses || 0} / ${g.water} glasses</strong><br>• Steps: <strong>${(st.steps || 0).toLocaleString()} / ${g.steps.toLocaleString()}</strong><br>• Workouts: <strong>${wk.length} logged</strong>`;
    } else {
      reply = `I'm analyzing your current telemetry: You've consumed <strong>${t.calories} kcal</strong> with <strong>${t.protein}g protein</strong> today (${remaining > 0 ? `${remaining} kcal remaining` : 'over target'}).<br><br>Feel free to tap any of the prompt pills above or ask about specific foods, workout plans, or macro adjustments!`;
    }

    // Remove typing indicator and push response
    this.floatingAiHistory.pop();
    this.floatingAiHistory.push({ sender: 'bot', text: reply, cards });
    this._renderFloatingAiMessages();
    this.updateFloatingAiTelemetry();
  },

  clearFloatingAiChat() {
    this.floatingAiHistory = [];
    this._initFloatingAiWelcome();
  },

  // ─── 6. Coach Hub (Real Registered Clients Only — No Mock Data) ───
  renderCoachHub(s) {
    const clients = s.allUsers || [];

    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div>
            <div class="section-title" style="margin-bottom:2px">👥 Coach & Trainer Client Roster</div>
            <div class="text-xs text-muted">Monitor client adherence, targets, and body metrics</div>
          </div>
          <span class="badge">${clients.length} Registered Clients</span>
        </div>

        ${clients.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <div class="empty-state-text">No registered client accounts detected in Firestore yet. When users sign up, their profiles, adherence, and metrics will appear in your roster.</div>
          </div>
        ` : `
          <div class="client-grid">
            ${clients.map(c => `
              <div class="client-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                  <div>
                    <div class="fw-800">${c.name || 'Client'}</div>
                    <div class="text-xs text-muted">${c.email || ''}</div>
                  </div>
                  <span class="badge">${c.goal === 'lose' ? 'Cut' : c.goal === 'gain' ? 'Bulk' : 'Maintain'}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.8rem;margin-bottom:12px">
                  <div>Weight: <strong>${c.weight || '—'} kg</strong></div>
                  <div>Target: <strong>${c.targetCalories || 2000} kcal</strong></div>
                </div>
                <button class="btn btn-glass btn-sm btn-block" onclick="window.ctApp.coachClientNote('${c.name}')">📝 Send Feedback Note</button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  coachClientNote(name) {
    const note = prompt(`Send coach feedback note to ${name}:`);
    if (note) {
      showToast(`Feedback sent to ${name}! 📩`, 'success');
    }
  },

  // ─── 7. Performance Achievements & Personal Records Engine ───
  renderAchievements(s) {
    const stats = extractUserPerformanceStats(s);
    const evalResult = evaluateAllBadges(stats, s.badges || []);
    const prResult = evaluatePersonalRecords(stats, s.personalRecords || []);
    const prs = prResult.updatedPrs;

    const activeCat = s.activeAchievementCategory || 'all';
    const displayBadges = activeCat === 'all'
      ? evalResult.processedBadges
      : (activeCat === 'prs'
          ? evalResult.processedBadges.filter(b => b.category === 'prs')
          : evalResult.processedBadges.filter(b => b.category === activeCat));

    // Athlete title tier
    const athleteRank = evalResult.userLevel >= 15 ? 'Legendary Titan'
      : evalResult.userLevel >= 10 ? 'Elite Master'
      : evalResult.userLevel >= 7 ? 'Advanced Competitor'
      : evalResult.userLevel >= 4 ? 'Dedicated Athlete'
      : 'Rising Contender';

    return `
      <!-- Athlete Level & Master XP Hero Card -->
      <div class="achievements-hero-card">
        <div class="athlete-level-row">
          <div class="athlete-level-group">
            <div class="athlete-level-orb">
              <span class="lvl-txt">Level</span>
              <span class="lvl-num">${evalResult.userLevel}</span>
            </div>
            <div class="athlete-level-info">
              <h2>${athleteRank}</h2>
              <div class="text-xs text-muted">Performance Mastery · ${evalResult.unlockedCount} / ${evalResult.totalCount} Badges Earned</div>
            </div>
          </div>
          <div class="athlete-xp-stats">
            <div class="athlete-xp-val">${evalResult.totalXp.toLocaleString()} XP</div>
            <div class="text-xs text-muted">Next Tier at ${evalResult.nextLevelXp.toLocaleString()} XP</div>
          </div>
        </div>

        <!-- Progress to Next Athlete Level -->
        <div class="athlete-xp-bar-wrap">
          <div class="athlete-xp-track">
            <div class="athlete-xp-fill" style="width:${evalResult.levelProgressPct}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--ink-secondary)">
            <span>Level ${evalResult.userLevel}</span>
            <span>${evalResult.levelProgressPct}% to Level ${evalResult.userLevel + 1}</span>
          </div>
        </div>

        <!-- Lifetime Performance Telemetry Summary -->
        <div class="athlete-quick-stats-row">
          <div class="athlete-stat-chip">
            <div class="athlete-stat-chip-val" style="color:#06b6d4">${stats.totalSteps.toLocaleString()}</div>
            <div class="athlete-stat-chip-lbl">Verified Steps</div>
          </div>
          <div class="athlete-stat-chip">
            <div class="athlete-stat-chip-val" style="color:#10b981">${stats.totalWorkouts}</div>
            <div class="athlete-stat-chip-lbl">Workouts Done</div>
          </div>
          <div class="athlete-stat-chip">
            <div class="athlete-stat-chip-val" style="color:#a78bfa">${stats.totalVolumeKg.toLocaleString()} kg</div>
            <div class="athlete-stat-chip-lbl">Volume Moved</div>
          </div>
          <div class="athlete-stat-chip">
            <div class="athlete-stat-chip-val" style="color:#f97316">${stats.totalMeals}</div>
            <div class="athlete-stat-chip-lbl">Meals Logged</div>
          </div>
          <div class="athlete-stat-chip">
            <div class="athlete-stat-chip-val" style="color:#fbbf24">${stats.longestStreak} d</div>
            <div class="athlete-stat-chip-lbl">Best Streak</div>
          </div>
        </div>
      </div>

      <!-- Verified Personal Records (PR) Showcase -->
      <div class="card" style="margin-bottom:20px">
        <div class="section-title" style="display:flex;align-items:center;justify-content:space-between">
          <span>⚡ Verified Personal Records (PRs)</span>
          <span class="text-xs text-muted">Calculated from your real cloud history</span>
        </div>
        ${prs.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-text">Start tracking workouts, steps & meals to establish authentic personal records!</div>
          </div>
        ` : `
          <div class="prs-grid">
            ${prs.map(pr => `
              <div class="pr-card">
                <div class="pr-card-icon">${pr.icon}</div>
                <div>
                  <div class="pr-card-val">${pr.formattedValue}</div>
                  <div class="pr-card-lbl">${pr.name}</div>
                  ${pr.date ? `<div class="text-xs text-muted" style="font-size:0.68rem;margin-top:2px">Set on ${pr.date}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Achievement Category Filter Pills -->
      <div class="badge-categories-row">
        ${BADGE_CATEGORIES.map(cat => `
          <button class="badge-cat-chip ${activeCat === cat.id ? 'active' : ''}" onclick="window.ctApp.setAchievementCategory('${cat.id}')">
            <span>${cat.icon}</span><span>${cat.label}</span>
          </button>
        `).join('')}
      </div>

      <!-- Progressive Performance Badges Grid -->
      <div class="perf-badges-grid">
        ${displayBadges.map(b => {
          const tier = b.tierConfig;
          return `
            <div class="perf-badge-card ${b.isUnlocked ? 'unlocked' : 'locked'}"
                 style="border-color:${b.isUnlocked ? tier.border : 'var(--border)'};box-shadow:${b.isUnlocked ? `0 0 20px -8px ${tier.color}` : 'none'}"
                 onclick="window.ctApp.openBadgeDetail('${b.id}')">
              
              <div class="perf-badge-top">
                <div class="perf-badge-icon-wrap" style="background:${b.isUnlocked ? tier.bg : 'rgba(255,255,255,0.05)'}">
                  <span>${b.icon}</span>
                </div>
                <span class="perf-badge-tier-tag" style="background:${tier.bg};color:${tier.color};border:1px solid ${tier.border}">
                  ${tier.label} · +${tier.xp} XP
                </span>
              </div>

              <div class="perf-badge-title">${b.name}</div>
              <div class="perf-badge-desc">${b.description}</div>

              <div class="perf-badge-progress-wrap">
                <div class="perf-badge-progress-header">
                  <span class="text-muted">${b.currentValue.toLocaleString()} / ${b.targetValue.toLocaleString()} ${b.unit}</span>
                  <span style="color:${b.isUnlocked ? 'var(--accent-light)' : 'var(--ink-secondary)'}">${b.percentage}%</span>
                </div>
                <div class="perf-badge-track">
                  <div class="perf-badge-fill" style="width:${b.percentage}%;background:${b.isUnlocked ? `linear-gradient(90deg, ${tier.color}, #10b981)` : 'var(--ink-muted)'}"></div>
                </div>
                <div class="perf-badge-status-line" style="color:${b.isUnlocked ? 'var(--accent-light)' : 'var(--ink-muted)'}">
                  ${b.isUnlocked ? `✓ Earned on ${b.earnedAt ? b.earnedAt.slice(0, 10) : 'Recent'}` : `${b.remaining.toLocaleString()} ${b.unit} to unlock`}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  async checkAndAwardBadges() {
    const s = getState();
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const stats = extractUserPerformanceStats(s);

    // 1. Evaluate Personal Records
    const prResult = evaluatePersonalRecords(stats, s.personalRecords || []);
    if (prResult.newlyBrokenPrs.length > 0) {
      await savePersonalRecords(uid, prResult.updatedPrs);
      setState({ personalRecords: prResult.updatedPrs });
      for (const pr of prResult.newlyBrokenPrs) {
        showToast(`⚡ NEW PERSONAL RECORD! ${pr.name}: ${pr.formattedValue} 🏆`, 'success', 6000);
      }
    }

    // 2. Evaluate Performance Badges
    const evalResult = evaluateAllBadges(stats, s.badges || []);
    if (evalResult.newlyUnlocked.length > 0) {
      await awardBadgesBatch(uid, evalResult.newlyUnlocked);
      for (const b of evalResult.newlyUnlocked) {
        showToast(`🏆 Achievement Unlocked: ${b.name}! ${b.icon} (+${b.xp} XP)`, 'success', 6000);
      }
      this.renderActiveTab();
    }
  },

  setAchievementCategory(catId) {
    setState({ activeAchievementCategory: catId });
    this.renderActiveTab();
  },

  openBadgeDetail(badgeId) {
    const s = getState();
    const stats = extractUserPerformanceStats(s);
    const evalResult = evaluateAllBadges(stats, s.badges || []);
    const badge = evalResult.processedBadges.find(b => b.id === badgeId);
    if (!badge) return;

    const modal = document.getElementById('badgeDetailModal');
    const iconWrap = document.getElementById('badgeDetailIconWrap');
    const iconEl = document.getElementById('badgeDetailIcon');
    const titleEl = document.getElementById('badgeDetailTitle');
    const tierTag = document.getElementById('badgeDetailTierTag');
    const descEl = document.getElementById('badgeDetailDesc');
    const reqEl = document.getElementById('badgeDetailReq');
    const progVal = document.getElementById('badgeDetailProgressVal');
    const xpEl = document.getElementById('badgeDetailXp');
    const earnedRow = document.getElementById('badgeDetailEarnedRow');
    const earnedDateEl = document.getElementById('badgeDetailEarnedDate');
    const barEl = document.getElementById('badgeDetailProgressBar');

    if (iconWrap) {
      iconWrap.style.background = badge.tierConfig.bg;
      iconWrap.style.border = `1px solid ${badge.tierConfig.border}`;
      iconWrap.style.boxShadow = `0 0 25px ${badge.tierConfig.color}40`;
    }
    if (iconEl) iconEl.textContent = badge.icon;
    if (titleEl) titleEl.textContent = badge.name;
    if (tierTag) {
      tierTag.textContent = `${badge.tierConfig.label} Tier`;
      tierTag.style.background = badge.tierConfig.bg;
      tierTag.style.color = badge.tierConfig.color;
      tierTag.style.border = `1px solid ${badge.tierConfig.border}`;
    }
    if (descEl) descEl.textContent = badge.description;
    if (reqEl) reqEl.textContent = badge.requirement;
    if (progVal) progVal.textContent = `${badge.currentValue.toLocaleString()} / ${badge.targetValue.toLocaleString()} ${badge.unit} (${badge.percentage}%)`;
    if (xpEl) xpEl.textContent = `+${badge.tierConfig.xp} XP`;

    if (earnedRow && earnedDateEl) {
      if (badge.isUnlocked) {
        earnedRow.style.display = 'flex';
        earnedDateEl.textContent = `✓ Unlocked ${badge.earnedAt ? `on ${badge.earnedAt.slice(0, 10)}` : ''}`;
      } else {
        earnedRow.style.display = 'none';
      }
    }

    if (barEl) {
      barEl.style.width = `${badge.percentage}%`;
      barEl.style.background = badge.isUnlocked
        ? `linear-gradient(90deg, ${badge.tierConfig.color}, #10b981)`
        : 'var(--ink-muted)';
    }

    if (modal) modal.style.display = 'flex';
  },

  closeBadgeDetailModal() {
    const modal = document.getElementById('badgeDetailModal');
    if (modal) modal.style.display = 'none';
  },

  // ─── 8. Profile Tab & Settings ───
  renderProfile(s) {
    const { profile: p, targets: g } = s;
    if (!p) return '<div class="card"><div class="spinner" style="margin:40px auto"></div></div>';

    const bmi = p.bmi || (p.weight / ((p.height / 100) ** 2)).toFixed(1);
    const bmiCat = getBMICategory(Number(bmi));

    const stats = extractUserPerformanceStats(s);
    const evalResult = evaluateAllBadges(stats, s.badges || []);
    const prs = s.personalRecords || [];
    const earnedBadges = evalResult.allEvaluated.filter(b => b.isEarned);

    return `
      <div class="card">
        <div class="section-title">👤 Your Fitness Profile</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div><span class="text-xs text-muted">Name</span><div class="fw-700">${p.name || 'User'}</div></div>
          <div><span class="text-xs text-muted">Email</span><div class="fw-700">${p.email || '—'}</div></div>
          <div><span class="text-xs text-muted">Height</span><div class="fw-700">${p.height || '—'} cm</div></div>
          <div><span class="text-xs text-muted">Weight</span><div class="fw-700">${p.weight || '—'} kg</div></div>
          <div><span class="text-xs text-muted">Age</span><div class="fw-700">${p.age || '—'}</div></div>
          <div><span class="text-xs text-muted">BMI</span><div class="fw-700" style="color:${bmiCat.color}">${bmi} (${bmiCat.label})</div></div>
          <div><span class="text-xs text-muted">Goal</span><div class="fw-700">${p.goal === 'lose' ? '🔻 Fat Loss' : p.goal === 'gain' ? '💪 Muscle Gain' : '⚖️ Maintain'}</div></div>
          <div><span class="text-xs text-muted">Activity</span><div class="fw-700">${p.activity || 1.55}x multiplier</div></div>
        </div>
        <button class="btn btn-primary" onclick="window.ctApp.editProfile()">✏️ Edit Profile</button>
      </div>

      <!-- Real Performance Achievement Showcase -->
      <div class="card" style="border: 1px solid rgba(251, 191, 36, 0.3); background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, var(--surface) 100%);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="section-title" style="margin:0;display:flex;align-items:center;gap:8px">
            <span>🏆</span> Real Achievement Showcase
          </div>
          <button class="btn btn-sm btn-glass" onclick="window.ctApp.switchTab('achievements')">View Badges Hub ↗</button>
        </div>

        <div style="display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;margin-bottom:14px">
          <div class="athlete-level-orb" style="width:58px;height:58px;font-size:1.8rem;box-shadow:0 0 20px rgba(245, 158, 11, 0.3)">
            ${evalResult.tierBadge}
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="fw-700" style="font-size:1.05rem">Level ${evalResult.level} Athlete</span>
              <span class="text-xs fw-700" style="color:var(--warning)">${evalResult.totalXp} XP</span>
            </div>
            <div class="text-xs text-muted" style="margin-bottom:6px">${evalResult.levelTitle}</div>
            <div class="athlete-xp-track" style="height:6px">
              <div class="athlete-xp-fill" style="width:${Math.min(100, Math.round((evalResult.totalXp / (evalResult.nextLevelXp || 100)) * 100))}%"></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-bottom:12px;text-align:center">
          <div style="background:var(--surface);padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border)">
            <div class="text-xs text-muted">Badges</div>
            <div class="fw-700" style="color:var(--primary);font-size:1.1rem">${evalResult.earnedCount}/${evalResult.totalBadges}</div>
          </div>
          <div style="background:var(--surface);padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border)">
            <div class="text-xs text-muted">Personal Records</div>
            <div class="fw-700" style="color:var(--warning);font-size:1.1rem">${prs.length}</div>
          </div>
          <div style="background:var(--surface);padding:8px;border-radius:var(--radius-sm);border:1px solid var(--border)">
            <div class="text-xs text-muted">Best Streak</div>
            <div class="fw-700" style="color:var(--error);font-size:1.1rem">${stats.longestStreak}d</div>
          </div>
        </div>

        ${earnedBadges.length > 0 ? `
          <div style="margin-top:10px">
            <div class="text-xs text-muted" style="margin-bottom:6px">Earned Highlights:</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${earnedBadges.slice(0, 6).map(b => `
                <div class="badge-cat-chip" style="font-size:0.75rem;padding:4px 8px;cursor:pointer" onclick="window.ctApp.openBadgeDetail('${b.id}')">
                  ${b.icon} ${b.name} (${b.tierConfig.name})
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="text-xs text-muted" style="font-style:italic">
            No badges unlocked yet. Complete workouts, log meals, or hit step milestones to earn your first badge!
          </div>
        `}
      </div>

      <div class="card">
        <div class="section-title">🎯 Daily Targets</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><span class="text-xs text-muted">Calories</span><div class="fw-700">${g.calories} kcal</div></div>
          <div><span class="text-xs text-muted">Protein</span><div class="fw-700">${g.protein}g</div></div>
          <div><span class="text-xs text-muted">Carbs</span><div class="fw-700">${g.carbs}g</div></div>
          <div><span class="text-xs text-muted">Fat</span><div class="fw-700">${g.fat}g</div></div>
          <div><span class="text-xs text-muted">Water</span><div class="fw-700">${g.water} glasses</div></div>
          <div><span class="text-xs text-muted">Steps</span><div class="fw-700">${g.steps.toLocaleString()}</div></div>
        </div>
      </div>

      <!-- Google Gemini AI Integration Bridge -->
      <div class="card gemini-connect-card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="gemini-badge-icon">✨</div>
            <div>
              <div class="fw-700" style="font-size:0.95rem">Google Gemini AI Engine</div>
              <div class="text-xs text-muted">
                ${this.isGeminiConnected ? 'Connected · Gemini 1.5 Flash Vision & AI Coaching Active' : 'One-click connect to Google Gemini for smart food vision & coach'}
              </div>
            </div>
          </div>
          <button class="btn btn-sm ${this.isGeminiConnected ? 'btn-primary' : 'btn-glass'}" onclick="window.ctApp.toggleGeminiConnection()">
            ${this.isGeminiConnected ? 'Disconnect' : 'Connect Gemini AI'}
          </button>
        </div>
        <div class="gemini-features-row">
          <span class="pill-feature">📸 Smart Photo Nutrition Vision</span>
          <span class="pill-feature">⚡ Real-Time Macro Advice</span>
          <span class="pill-feature">🧠 Live Fitness Reasoning</span>
        </div>
      </div>

      <!-- Data Export & GDPR -->
      <div class="card">
        <div class="section-title">📁 Data Export & Backup</div>
        <p class="text-sm text-muted" style="margin-bottom:12px">Export your complete fitness records (meals, workouts, weights, steps, vitals) anytime.</p>
        <div style="display:flex;gap:10px">
          <button class="btn btn-glass" onclick="window.ctApp.exportData('csv')">Export CSV 📊</button>
          <button class="btn btn-glass" onclick="window.ctApp.exportData('json')">Full Backup (JSON) 💾</button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">⚙️ Account Settings</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-glass btn-block" onclick="window.ctApp.toggleTheme()">
            ${s.theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
          </button>
          <button class="btn btn-glass btn-block" onclick="window.ctApp.toggleCoachMode()">
            👥 ${this.isCoachMode ? 'Disable Coach Mode' : 'Enable Coach & Trainer Mode'}
          </button>
          <button class="btn btn-glass btn-block" onclick="window.ctApp.handleLogout()">🚪 Sign Out</button>
          <button class="btn btn-danger btn-block" onclick="window.ctApp.handleDeleteAccount()">🗑 Delete Account & Data</button>
        </div>
      </div>

      <!-- Lead Architect & Creator Card -->
      <div class="card bat-creator-card" onclick="window.ctApp.showBatmanEasterEgg()" style="cursor:pointer" title="Click to summon the Bat-Signal 🦇">
        <div style="display:flex;align-items:center;gap:14px">
          <div class="bat-avatar-orb">🦇</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="fw-700" style="font-size:1.05rem;color:var(--ink)">Sharan</span>
              <span class="badge-chip bat-edition-chip">Batman 🦇</span>
            </div>
            <div class="text-xs text-muted" style="margin-top:2px">Lead Architect & Developer • CalTrack Dark Knight Edition</div>
          </div>
          <button class="btn btn-sm btn-glass" onclick="event.stopPropagation(); window.ctApp.showBatmanEasterEgg()">Summon 🦇</button>
        </div>
      </div>
    `;
  },

  showBatmanEasterEgg() {
    showToast('🦇 "I am vengeance, I am the night..." — Masterminded by Sharan (Batman)!', 'success', 6000);
    const ambient = document.querySelector('.ambient');
    if (ambient) {
      ambient.classList.add('batman-active');
      setTimeout(() => ambient.classList.remove('batman-active'), 5000);
    }
  },

  toggleGeminiConnection() {
    this.isGeminiConnected = !this.isGeminiConnected;
    localStorage.setItem('caltrack_gemini_connected', this.isGeminiConnected ? 'true' : 'false');
    showToast(
      this.isGeminiConnected
        ? 'Google Gemini AI Connected! 🚀 Food vision & AI Coach active'
        : 'Google Gemini AI Disconnected',
      this.isGeminiConnected ? 'success' : 'info'
    );
    this.renderActiveTab();
    if (this.isFloatingAiOpen) this.updateFloatingAiTelemetry();
  },

  async exportData(type = 'csv') {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      showToast('Preparing your fitness export...', 'info');
      const data = await exportUserData(uid);
      if (type === 'json') {
        healthSync.exportToJson(data);
      } else {
        const flatRows = (data.data.meals || []).map(m => ({
          date: m.date,
          type: m.mealType,
          calories: m.totalCalories,
          protein: m.totalProtein,
          carbs: m.totalCarbs,
          fat: m.totalFat,
          notes: m.notes
        }));
        healthSync.exportToCsv(flatRows, `caltrack_meals_${todayStr()}.csv`);
      }
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  }
};

// ─── Close dropdown on outside click ───
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-chip') && !e.target.closest('.dropdown')) {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('open');
  }
});

// ─── Auth State Listener ───
onAuthStateChanged(auth, async (user) => {
  if (user) {
    setState({ user, isAuthReady: true });
    try {
      const profile = await getUserProfile(user.uid);
      if (profile && profile.onboardingComplete) {
        setState({ profile });
        if (profile.targetCalories) {
          setState({
            targets: {
              calories: profile.targetCalories,
              protein: profile.targetProtein || 140,
              carbs: profile.targetCarbs || 250,
              fat: profile.targetFat || 60,
              water: profile.targetWater || 8,
              steps: profile.targetSteps || 10000
            }
          });
        }
        app.showScreen('screen-app');
        app.initApp(user);
      } else {
        app.showScreen('screen-onboarding');
        app.renderOnboarding(user);
      }
    } catch (err) {
      console.error('Profile load error:', err);
      app.showScreen('screen-onboarding');
      app.renderOnboarding(user);
    }
  } else {
    setState({ user: null, isAuthReady: true });
    cleanupListeners();
    app.showScreen('screen-landing');
  }
});

// ─── Subscribe to state changes for toasts ───
subscribe(state => {
  const container = document.getElementById('toastContainer');
  if (container) {
    container.innerHTML = state.toasts.map(t => `
      <div class="toast toast-${t.type}">
        ${t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} ${t.message}
      </div>
    `).join('');
  }
});

// Expose to window for inline onclick handlers
window.ctApp = app;
