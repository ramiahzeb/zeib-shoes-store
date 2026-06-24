import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  hasAnyConfig: boolean;
  isComplete: boolean;
  missing: string[];
  apiKeyPrefix: string;
};

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

let firebaseServices: FirebaseServices | null | undefined;

function getApiKeyPrefix(value: string) {
  return value ? `${value.slice(0, 8)}...` : "";
}

export function getFirebaseClientConfig(): FirebaseClientConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "";
  const entries = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", projectId],
    ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", storageBucket],
    ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", messagingSenderId],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", appId]
  ] as const;
  const missing = entries.filter(([, value]) => !value).map(([name]) => name);

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    hasAnyConfig: entries.some(([, value]) => Boolean(value)),
    isComplete: missing.length === 0,
    missing,
    apiKeyPrefix: getApiKeyPrefix(apiKey)
  };
}

export function hasFirebaseConfig() {
  return getFirebaseClientConfig().isComplete;
}

export function shouldUseFirebaseAuth() {
  return getFirebaseClientConfig().hasAnyConfig;
}

export function getFirebaseConfigError() {
  const config = getFirebaseClientConfig();
  if (config.isComplete || !config.hasAnyConfig) return "";
  return `Firebase is partially configured. Missing: ${config.missing.join(", ")}.`;
}

export function getAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getFirebaseServices() {
  const config = getFirebaseClientConfig();

  if (!config.hasAnyConfig) {
    firebaseServices = null;
    return null;
  }

  if (!config.isComplete) {
    throw new Error(getFirebaseConfigError());
  }

  if (firebaseServices !== undefined) {
    return firebaseServices;
  }

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId
        });

  firebaseServices = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app)
  };
  return firebaseServices;
}
