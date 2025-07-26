// background.js (after npm install firebase)
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: 'G-SFXMXB2938',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Functions to interact with Firestore ---

// Fetch rewrite suggestions
async function fetchRewriteSuggestionsFromFirestore() {
  const suggestions = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'rewrite_suggestions'));
    querySnapshot.forEach((document) => {
      suggestions.push(document.data());
    });
    console.log(
      'Fetched rewrite suggestions from Firebase:',
      suggestions.length,
      'items.'
    );
    return { success: true, data: suggestions };
  } catch (error) {
    console.error('Error fetching rewrite suggestions from Firebase:', error);
    return { success: false, error: error.message };
  }
}

// Save user settings
async function saveUserSettingToFirestore(settingKey, value) {
  const userId = 'defaultUser';
  try {
    await setDoc(
      doc(db, 'user_settings', userId),
      {
        [settingKey]: value,
      },
      { merge: true }
    );
    console.log(`Setting "${settingKey}" saved:`, value);
    return { success: true };
  } catch (error) {
    console.error(`Error saving setting "${settingKey}" to Firebase:`, error);
    return { success: false, error: error.message };
  }
}

// Get user settings
async function getUserSettingFromFirestore(settingKey) {
  const userId = 'defaultUser';
  try {
    const documentSnapshot = await getDoc(doc(db, 'user_settings', userId));
    if (documentSnapshot.exists()) {
      console.log(
        `Setting "${settingKey}" retrieved:`,
        documentSnapshot.data()[settingKey]
      );
      return { success: true, value: documentSnapshot.data()[settingKey] };
    } else {
      console.log(`No setting found for "${settingKey}".`);
      return { success: true, value: undefined };
    }
  } catch (error) {
    console.error(
      `Error getting setting "${settingKey}" from Firebase:`,
      error
    );
    return { success: false, error: error.message };
  }
}

// --- Message Listener for communication ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background script:', request.action);
  if (request.action === 'getRewriteSuggestions') {
    fetchRewriteSuggestionsFromFirestore().then(sendResponse);
    return true;
  } else if (request.action === 'saveSetting') {
    saveUserSettingToFirestore(request.key, request.value).then(sendResponse);
    return true;
  } else if (request.action === 'getSetting') {
    getUserSettingFromFirestore(request.key).then(sendResponse);
    return true;
  }
});

// Optional: Keep the service worker alive
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'keep-alive') {
    port.onDisconnect.addListener(function () {
      console.log('Keep-alive port disconnected.');
    });
  }
});
