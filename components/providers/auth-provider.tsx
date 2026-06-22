"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Customer } from "@/lib/types";

type AuthContextValue = {
  customer: Customer | null;
  loading: boolean;
  welcomeMessage: string;
  lastAuthAction: "login" | "signup" | "logout" | null;
  login: (email: string, password: string) => Promise<Customer>;
  signup: (payload: Omit<Customer, "id" | "role" | "address"> & { password: string }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCustomer: (customer: Customer) => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [lastAuthAction, setLastAuthAction] = useState<"login" | "signup" | "logout" | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem(storageKey);
      readUsers();
      try {
        setCustomer(stored ? (JSON.parse(stored) as Customer) : null);
      } catch {
        window.localStorage.removeItem(storageKey);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  function persist(nextCustomer: Customer, action: "login" | "signup") {
    setCustomer(nextCustomer);
    setLastAuthAction(action);
    window.localStorage.setItem(storageKey, JSON.stringify(nextCustomer));
    setWelcomeMessage(`Welcome to ZEIB SHOES Store, ${nextCustomer.name}!`);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      loading,
      welcomeMessage,
      lastAuthAction,
      async login(email: string, password: string) {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password.trim()) throw new Error("Email and password are required.");

        if (process.env.NODE_ENV === "development") {
          console.log("[ZEIB demo auth] login attempt", normalizedEmail);
        }

        // TODO: Replace demo login with Supabase auth.signInWithPassword once keys are added.
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

        // TODO: Replace demo signup with Supabase auth.signUp and customers table insert.
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
      },
      async requestPasswordReset(email: string) {
        const normalizedEmail = normalizeEmail(email);
        const user = readUsers().find((item) => normalizeEmail(item.email) === normalizedEmail);
        if (!user) throw new Error("No demo account found for this email.");
        if (user.role === "admin") throw new Error("Admin demo password can be any non-empty value.");
        window.localStorage.setItem(resetEmailStorageKey, normalizedEmail);
      },
      async resetPassword(email: string, password: string) {
        const normalizedEmail = normalizeEmail(email || window.localStorage.getItem(resetEmailStorageKey) || "");
        if (!normalizedEmail) throw new Error("Enter the email for the account you want to reset.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const users = readUsers();
        const user = users.find((item) => normalizeEmail(item.email) === normalizedEmail);
        if (!user) throw new Error("No demo account found for this email.");
        if (user.role === "admin") throw new Error("Admin demo password cannot be reset.");

        writeUsers(users.map((item) => (normalizeEmail(item.email) === normalizedEmail ? { ...item, password } : item)));
        window.localStorage.removeItem(resetEmailStorageKey);
      },
      logout() {
        setCustomer(null);
        setLastAuthAction("logout");
        setWelcomeMessage("");
        window.localStorage.removeItem(storageKey);
      },
      updateCustomer(nextCustomer) {
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
    [customer, lastAuthAction, loading, welcomeMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
