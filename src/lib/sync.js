// Activity Sync & Health Integration Bridge
// Production Google OAuth Fitness API Architecture + Hardware Pedometer + CSV/JSON Export
// Strictly no fake or fabricated data — authentic integration or transparent fallback.

import { auth } from './firebase.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { logSteps } from './database.js';
import { showToast } from './state.js';

export class HealthSyncBridge {
  constructor() {
    this.accessToken = sessionStorage.getItem('caltrack_fit_token') || null;
    this.isConnected = Boolean(this.accessToken);
    this.lastSyncTime = localStorage.getItem('caltrack_last_sync') || null;
    this.syncError = null;
    this.pedometerActive = false;
    this.liveStepCount = 0;
  }

  // Connect Google Fit using actual OAuth 2.0 with Fitness Scopes
  async connectGoogleFit(userId) {
    if (this.isConnected) {
      this.disconnect();
      return { success: false, connected: false };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.body.read');
      provider.setCustomParameters({ prompt: 'consent' });

      showToast('Opening Google Fitness OAuth authorization...', 'info');
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (credential && credential.accessToken) {
        this.accessToken = credential.accessToken;
        this.isConnected = true;
        this.syncError = null;
        sessionStorage.setItem('caltrack_fit_token', this.accessToken);
        showToast('Google Fit authorization granted! Fetching live telemetry...', 'success');
        await this.syncActivity(userId);
        return { success: true, connected: true };
      } else {
        throw new Error('Google did not return an OAuth access token for Fitness scopes.');
      }
    } catch (err) {
      this.isConnected = false;
      this.accessToken = null;
      sessionStorage.removeItem('caltrack_fit_token');

      if (err.code === 'auth/popup-closed-by-user') {
        this.syncError = 'Authorization popup was closed by user.';
      } else {
        this.syncError = err.message || 'Fitness authorization failed.';
      }
      showToast(`Google Fit: ${this.syncError}`, 'error', 5000);
      return { success: false, connected: false, error: this.syncError };
    }
  }

  disconnect() {
    this.accessToken = null;
    this.isConnected = false;
    this.syncError = null;
    sessionStorage.removeItem('caltrack_fit_token');
    localStorage.removeItem('caltrack_last_sync');
    showToast('Disconnected from Google Fit', 'info');
  }

  // Fetch real telemetry from Google Fitness REST API
  async syncActivity(userId) {
    if (!this.accessToken) {
      showToast('Please connect your Google Account with Fitness permissions first.', 'error');
      return null;
    }
    if (!userId) return null;

    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
      // Query Google Fit REST API for all aggregated step count delta data
      const response = await fetch('https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: 'com.google.step_count.delta'
            }
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startOfDay.getTime(),
          endTimeMillis: now
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;
        if (response.status === 401) {
          this.disconnect();
          throw new Error('Google Fit token expired. Please reconnect.');
        } else if (response.status === 403) {
          throw new Error('Google Fitness API requires permission consent or is not enabled for this OAuth client.');
        }
        throw new Error(msg);
      }

      const data = await response.json();
      let totalSteps = 0;

      // Parse aggregate dataset (handles both intVal and fpVal across all phone/watch sources)
      if (data.bucket && data.bucket.length > 0) {
        for (const bucket of data.bucket) {
          for (const dataset of bucket.dataset || []) {
            for (const point of dataset.point || []) {
              for (const value of point.value || []) {
                if (typeof value.intVal === 'number') {
                  totalSteps += value.intVal;
                } else if (typeof value.fpVal === 'number') {
                  totalSteps += Math.round(value.fpVal);
                }
              }
            }
          }
        }
      }

      // Write authentic step count to Firestore
      await logSteps(userId, totalSteps, 'google_fitness_api');

      this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('caltrack_last_sync', this.lastSyncTime);
      this.syncError = null;

      showToast(`Synced ${totalSteps.toLocaleString()} verified steps from Google Fit! 👟`, 'success');
      return { steps: totalSteps, syncedAt: this.lastSyncTime };
    } catch (err) {
      this.syncError = err.message;
      showToast(`Google Fit sync error: ${err.message}`, 'error', 5000);
      return null;
    }
  }

  // Background auto-sync when Google Fit is connected
  startAutoSync(userId) {
    if (this._autoSyncTimer) clearInterval(this._autoSyncTimer);
    if (!userId) return;

    // Sync on tab visibility return
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isConnected) {
          this.syncActivity(userId);
        }
      });
    }

    // Periodic sync every 2 minutes
    this._autoSyncTimer = setInterval(() => {
      if (this.isConnected) {
        this.syncActivity(userId);
      }
    }, 120000);
  }

  // Hardware Pedometer: reads true acceleration peaks if device supports sensors
  async startHardwarePedometer(userId, onStepDetected) {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      showToast('Motion sensors not supported on this browser/device', 'warn');
      return false;
    }

    // Handle iOS 13+ permission requirement
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== 'granted') {
          showToast('Motion sensor permission denied', 'error');
          return false;
        }
      } catch (e) {
        console.warn('Motion permission error:', e);
      }
    }

    if (this.pedometerActive) {
      showToast('Live phone pedometer is already active! 👟', 'info');
      return true;
    }

    let lastAcc = null;
    const threshold = 11.8; // true acceleration peak for human walking stride
    let pendingSteps = 0;
    let syncThrottleTimeout = null;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

      if (lastAcc && mag > threshold && lastAcc <= threshold) {
        this.liveStepCount++;
        pendingSteps++;
        if (onStepDetected) onStepDetected(this.liveStepCount);

        // Throttle write to Firestore so database isn't flooded while walking
        if (!syncThrottleTimeout && userId) {
          syncThrottleTimeout = setTimeout(async () => {
            try {
              await logSteps(userId, this.liveStepCount, 'hardware_pedometer');
              pendingSteps = 0;
            } catch (err) {
              console.warn('Pedometer sync warning:', err);
            } finally {
              syncThrottleTimeout = null;
            }
          }, 8000);
        }
      }
      lastAcc = mag;
    };

    window.addEventListener('devicemotion', handleMotion);
    this.pedometerActive = true;
    showToast('Live phone step sensor active! 👟 Walk with your phone to track steps.', 'success');
    return true;
  }

  // Export full data to CSV
  exportToCsv(data, filename = 'caltrack_fitness_data.csv') {
    if (!data || !Array.isArray(data) || data.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(field => {
          let val = row[field];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
          return `"${val}"`;
        }).join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export downloaded successfully! 📁', 'success');
  }

  // Export full JSON backup
  exportToJson(data, filename = 'caltrack_backup.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Backup JSON downloaded! 📁', 'success');
  }
}

export const healthSync = new HealthSyncBridge();
