"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { getFirebaseServices, isAdminEmail, shouldUseFirebaseAuth } from "@/lib/firebase/client";
import { readFirebaseCustomerProfile, saveFirebaseCustomerProfile } from "@/lib/firebase/customer-data";
import type { Customer } from "@/lib/types";

type SignupResult = {
  customer: Customer | null;
  needsEmailConfirmation: boolean;
  message: string;
};

type AuthContextValue = {
  customer: Customer | null;
  loading: boolean;
  authMode: "firebase" | "demo";
  welcomeMessage: string;
  lastAuthAction: "login" | "signup" | "logout" | null;
  login: (email: string, password: string) => Promise<Customer>;
  signup: (payload: Omit<Customer, "id" | "role" | "address"> & { password: string }) => Promise<SignupResult>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const storageKey = "zeib_customer";
const usersStorageKey = "zeib_demo_users";
const resetEmailStorageKey = "zeib_password_reset_email";

const demoAdmin: Customer = {
  id: "admin-demo",
  name: "ZEIB Admin",
  email: "admin@zeibshoes.my.id",
  phone: "+92 300 0000000",
  address: "ZEIB SHOES Office, Pakistan",
  role: "admin"
};

type DemoUser = Customer & {
  password: string | null;
};

const demoUser: DemoUser = {
  id: "user-demo",
  name: "ZEIB Demo User",
  email: "user@zeibshoes.my.id",
  phone: "+92 300 1111111",
  address: "Lahore, Pakistan",
  role: "customer",
  password: "123456"
};

const seededUsers: DemoUser[] = [
  {
    ...demoAdmin,
    password: null
  },
  demoUser
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readUsers() {
  if (typeof window === "undefined") return seededUsers;

  const stored = window.localStorage.getItem(usersStorageKey);
  let storedUsers: DemoUser[] = [];
  try {
    storedUsers = stored ? (JSON.parse(stored) as DemoUser[]) : [];
  } catch {
    storedUsers = [];
  }
  const usersByEmail = new Map<string, DemoUser>();
  [...seededUsers, ...storedUsers].forEach((user) => {
    const email = normalizeEmail(user.email);
    usersByEmail.set(email, { ...user, email });
  });
  const merged = Array.from(usersByEmail.values());
  window.localStorage.setItem(usersStorageKey, JSON.stringify(merged));
  return merged;
}

function writeUsers(users: DemoUser[]) {
  window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function toCustomer(user: DemoUser): Customer {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role
  };
}

function formatFirebaseError(caught: unknown, action: string) {
  const error = caught as {
    code?: string;
    message?: string;
    name?: string;
  };
  const message = error?.message || String(caught);
  const details = [error?.code ? `code ${error.code}` : "", error?.name && error.name !== "Error" ? `name ${error.name}` : ""]
    .filter(Boolean)
    .join(", ");
  return `Firebase ${action} failed: ${message}${details ? ` (${details})` : ""}`;
}

async function customerFromFirebaseUser(user: User): Promise<Customer> {
  const email = normalizeEmail(user.email ?? "");
  const profile = await readFirebaseCustomerProfile(user.uid).catch(() => null);

  return {
    id: user.uid,
    name: profile?.name || user.displayName || email.split("@")[0] || "ZEIB Customer",
    email,
    phone: profile?.phone || "",
    address: profile?.address || "",
    role: isAdminEmail(email) ? "admin" : "customer"
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseState = useMemo(() => {
    try {
      return {
        services: getFirebaseServices(),
        shouldUseFirebase: shouldUseFirebaseAuth(),
        configError: ""
      };
    } catch (caught) {
      return {
        services: null,
        shouldUseFirebase: true,
        configError: caught instanceof Error ? caught.message : "Firebase authentication is not configured correctly."
      };
    }
  }, []);
  const services = firebaseState.services;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [lastAuthAction, setLastAuthAction] = useState<"login" | "signup" | "logout" | null>(null);
  const authMode = firebaseState.shouldUseFirebase ? "firebase" : "demo";

  useEffect(() => {
    let mounted = true;

    if (firebaseState.configError) {
      queueMicrotask(() => {
        if (mounted) setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }

    if (!services) {
      queueMicrotask(() => {
        const stored = window.localStorage.getItem(storageKey);
        readUsers();
        try {
          if (!mounted) return;
          setCustomer(stored ? (JSON.parse(stored) as Customer) : null);
        } catch {
          window.localStorage.removeItem(storageKey);
          if (mounted) setCustomer(null);
        } finally {
          if (mounted) setLoading(false);
        }
      });
      return () => {
        mounted = false;
      };
    }

    void setPersistence(services.auth, browserLocalPersistence).catch((caught) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[ZEIB Firebase auth] persistence error", caught);
      }
    });

    const unsubscribe = onAuthStateChanged(services.auth, (user) => {
      if (!mounted) return;
      if (!user) {
        setCustomer(null);
        setLoading(false);
        window.localStorage.removeItem(storageKey);
        return;
      }

      void customerFromFirebaseUser(user)
        .then((nextCustomer) => {
          if (!mounted) return;
          setCustomer(nextCustomer);
          window.localStorage.setItem(storageKey, JSON.stringify(nextCustomer));
          setLoading(false);
        })
        .catch(() => {
          if (!mounted) return;
          setCustomer(null);
          setLoading(false);
          window.localStorage.removeItem(storageKey);
        });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [firebaseState.configError, services]);

  const persist = useCallback((nextCustomer: Customer, action: "login" | "signup") => {
    setCustomer(nextCustomer);
    setLastAuthAction(action);
    window.localStorage.setItem(storageKey, JSON.stringify(nextCustomer));
    setWelcomeMessage(`Welcome to ZEIB SHOES Store, ${nextCustomer.name}!`);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      loading,
      authMode,
      welcomeMessage,
      lastAuthAction,
      async login(email: string, password: string) {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password.trim()) throw new Error("Email and password are required.");

        if (firebaseState.configError) throw new Error(firebaseState.configError);

        if (services) {
          const credential = await signInWithEmailAndPassword(services.auth, normalizedEmail, password).catch((caught) => {
            throw new Error(formatFirebaseError(caught, "login"));
          });
          const nextCustomer = await customerFromFirebaseUser(credential.user);
          persist(nextCustomer, "login");
          return nextCustomer;
        }

        if (normalizedEmail === demoAdmin.email) {
          persist(demoAdmin, "login");
          return demoAdmin;
        }

        const user = readUsers().find((item) => normalizeEmail(item.email) === normalizedEmail);
        if (!user) throw new Error("No demo account found for this email.");
        if (normalizedEmail === demoUser.email && password === demoUser.password) {
          const nextCustomer = toCustomer({ ...demoUser, ...user, role: "customer", password: demoUser.password });
          persist(nextCustomer, "login");
          return nextCustomer;
        }
        if (user.role !== "admin" && user.password !== password) {
          throw new Error("Wrong email or password.");
        }
        if (user.role === "admin" && !password.trim()) {
          throw new Error("Admin demo requires any non-empty password.");
        }

        const nextCustomer = toCustomer(user);
        persist(nextCustomer, "login");
        return nextCustomer;
      },
      async signup(payload) {
        const normalizedEmail = normalizeEmail(payload.email);
        if (!payload.name.trim() || !normalizedEmail || !payload.phone.trim() || !payload.password) {
          throw new Error("All signup fields are required.");
        }
        if (payload.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        if (firebaseState.configError) throw new Error(firebaseState.configError);

        if (services) {
          const credential = await createUserWithEmailAndPassword(services.auth, normalizedEmail, payload.password).catch(
            (caught) => {
              throw new Error(formatFirebaseError(caught, "signup"));
            }
          );
          await updateProfile(credential.user, { displayName: payload.name.trim() }).catch((caught) => {
            throw new Error(formatFirebaseError(caught, "profile update"));
          });

          const nextCustomer: Customer = {
            id: credential.user.uid,
            name: payload.name.trim(),
            email: normalizedEmail,
            phone: payload.phone.trim(),
            address: "",
            role: isAdminEmail(normalizedEmail) ? "admin" : "customer"
          };

          await saveFirebaseCustomerProfile({
            uid: nextCustomer.id,
            name: nextCustomer.name,
            email: nextCustomer.email,
            phone: nextCustomer.phone,
            address: nextCustomer.address
          }).catch((caught) => {
            throw new Error(formatFirebaseError(caught, "customer profile save"));
          });

          persist(nextCustomer, "signup");
          void fetch("/api/welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: payload.name, email: normalizedEmail })
          }).catch(() => undefined);

          return {
            customer: nextCustomer,
            needsEmailConfirmation: false,
            message: "Account created successfully. Welcome to ZEIB SHOES."
          };
        }

        const users = readUsers();
        if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
          throw new Error("An account with this email already exists.");
        }

        const nextCustomer: Customer = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          email: normalizedEmail,
          phone: payload.phone,
          address: "",
          role: "customer"
        };
        writeUsers([...users, { ...nextCustomer, password: payload.password }]);
        persist(nextCustomer, "signup");

        void fetch("/api/welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: payload.name, email: payload.email })
        }).catch(() => undefined);

        return {
          customer: nextCustomer,
          needsEmailConfirmation: false,
          message: "Account created successfully. Welcome to ZEIB SHOES."
        };
      },
      async requestPasswordReset(email: string) {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail) throw new Error("Email is required.");

        if (firebaseState.configError) throw new Error(firebaseState.configError);

        if (services) {
          await sendPasswordResetEmail(services.auth, normalizedEmail, {
            url: `${window.location.origin}/reset-password`
          }).catch((caught) => {
            const error = caught as { code?: string };
            if (error.code === "auth/user-not-found") return;
            throw new Error(formatFirebaseError(caught, "password reset email"));
          });
          return;
        }

        const user = readUsers().find((item) => normalizeEmail(item.email) === normalizedEmail);
        if (!user) throw new Error("No demo account found for this email.");
        if (user.role === "admin") throw new Error("Admin demo password can be any non-empty value.");
        window.localStorage.setItem(resetEmailStorageKey, normalizedEmail);
      },
      async resetPassword(email: string, password: string) {
        const normalizedEmail = normalizeEmail(email || window.localStorage.getItem(resetEmailStorageKey) || "");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        if (firebaseState.configError) throw new Error(firebaseState.configError);

        if (services) {
          const code = new URLSearchParams(window.location.search).get("oobCode");
          if (!code) throw new Error("Open the Firebase password reset link from your email before setting a new password.");
          await confirmPasswordReset(services.auth, code, password).catch((caught) => {
            throw new Error(formatFirebaseError(caught, "password update"));
          });
          return;
        }

        if (!normalizedEmail) throw new Error("Enter the email for the account you want to reset.");
        const users = readUsers();
        const user = users.find((item) => normalizeEmail(item.email) === normalizedEmail);
        if (!user) throw new Error("No demo account found for this email.");
        if (user.role === "admin") throw new Error("Admin demo password cannot be reset.");

        writeUsers(users.map((item) => (normalizeEmail(item.email) === normalizedEmail ? { ...item, password } : item)));
        window.localStorage.removeItem(resetEmailStorageKey);
      },
      async logout() {
        if (firebaseState.configError) throw new Error(firebaseState.configError);

        if (services) {
          await signOut(services.auth).catch((caught) => {
            throw new Error(formatFirebaseError(caught, "logout"));
          });
        }
        setCustomer(null);
        setLastAuthAction("logout");
        setWelcomeMessage("");
        window.localStorage.removeItem(storageKey);
      },
      async updateCustomer(nextCustomer) {
        if (firebaseState.configError) throw new Error(firebaseState.configError);

        if (services) {
          if (services.auth.currentUser) {
            await updateProfile(services.auth.currentUser, { displayName: nextCustomer.name }).catch((caught) => {
              throw new Error(formatFirebaseError(caught, "profile update"));
            });
          }
          await saveFirebaseCustomerProfile({
            uid: nextCustomer.id,
            name: nextCustomer.name,
            email: normalizeEmail(nextCustomer.email),
            phone: nextCustomer.phone,
            address: nextCustomer.address
          }).catch((caught) => {
            throw new Error(formatFirebaseError(caught, "customer profile save"));
          });
          setCustomer(nextCustomer);
          window.localStorage.setItem(storageKey, JSON.stringify(nextCustomer));
          return;
        }

        const users = readUsers();
        writeUsers(
          users.map((user) =>
            normalizeEmail(user.email) === normalizeEmail(customer?.email ?? nextCustomer.email)
              ? { ...user, ...nextCustomer, password: user.password }
              : user
          )
        );
        setCustomer(nextCustomer);
        window.localStorage.setItem(storageKey, JSON.stringify(nextCustomer));
      }
    }),
    [authMode, customer, firebaseState.configError, lastAuthAction, loading, persist, services, welcomeMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
