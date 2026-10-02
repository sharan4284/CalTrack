// Authentication Service
// Handles Google Sign-In, email/password, session persistence, logout, account deletion

import { auth, db, storage } from './firebase.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithPopup
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, deleteDoc, collection,
  getDocs, query, where, serverTimestamp, writeBatch
} from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// ─── State ───
let currentUser = null;
let authReadyResolve;
const authReadyPromise = new Promise(r => { authReadyResolve = r; });
const authListeners = new Set();

// ─── Public API ───

export function onAuthChange(callback) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

export function getCurrentUser() {
  return currentUser;
}

export function waitForAuth() {
  return authReadyPromise;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Upsert user profile
    await setDoc(doc(db, 'users', user.uid), {
      name: user.displayName || 'Google User',
      email: user.email,
      photoURL: user.photoURL || '',
      lastLogin: serverTimestamp(),
      provider: 'google.com'
    }, { merge: true });
    return { success: true, user };
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in popup was closed.' };
    }
    if (err.code === 'auth/popup-blocked') {
      return { success: false, error: 'Pop-up was blocked by browser. Please allow pop-ups or use Email sign-in.' };
    }
    if (err.code === 'auth/unauthorized-domain') {
      return { success: false, error: 'Domain not authorized for Google Sign-in. Please use Email sign-in.' };
    }
    if (err.code === 'auth/operation-not-allowed') {
      return { success: false, error: 'Google sign-in is not enabled in Firebase Console. Please use Email sign-in.' };
    }
    return { success: false, error: err.message };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (err) {
    const errorMap = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-email': 'Invalid email format.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.'
    };
    return { success: false, error: errorMap[err.code] || err.message };
  }
}

export async function signUpWithEmail(name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
      provider: 'email'
    });
    return { success: true, user: cred.user };
  } catch (err) {
    const errorMap = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email format.',
      'auth/weak-password': 'Password is too weak (min 6 characters).'
    };
    return { success: false, error: errorMap[err.code] || err.message };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function logOut() {
  await signOut(auth);
}

export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  const uid = user.uid;
  const batch = writeBatch(db);

  // Clean up user entries & vitals
  const queries = [
    query(collection(db, 'entries'), where('uid', '==', uid)),
    query(collection(db, 'vitals'), where('uid', '==', uid))
  ];

  for (const q of queries) {
    try {
      const snap = await getDocs(q);
      snap.docs.forEach(d => batch.delete(d.ref));
    } catch (e) {
      console.warn('Could not batch delete docs:', e);
    }
  }
  
  // Delete user profile
  try {
    batch.delete(doc(db, 'users', uid));
    await batch.commit();
  } catch (e) {
    console.warn('Could not delete user profile doc:', e);
  }
  
  // Delete auth account
  try {
    await deleteUser(user);
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      await reauthenticateWithPopup(user, googleProvider);
      await deleteUser(user);
    } else {
      throw err;
    }
  }
}

export async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) return;
  
  if (data.name) {
    try {
      await updateProfile(user, { displayName: data.name });
    } catch (e) {
      console.warn('updateProfile warning:', e);
    }
  }
  
  await setDoc(doc(db, 'users', user.uid), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid || auth.currentUser?.uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn('getUserProfile warning:', err);
    return null;
  }
}

// ─── Auth State Observer ───
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (authReadyResolve) authReadyResolve(user);
  authListeners.forEach(cb => cb(user));
});
