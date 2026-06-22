import type { CartItem, Customer, Order } from "@/lib/types";

export const currentUserKey = "zeib_customer";
export const legacyCartKeys = ["cart", "zeib_cart"];
export const legacyWishlistKeys = ["wishlist", "zeib_wishlist"];
export const legacyOrdersKeys = ["orders", "zeib_orders"];
export const legacyCompareKeys = ["compare", "zeib_compare"];

export function normalizeStorageId(value?: string | null) {
  return value?.trim().toLowerCase() || "guest";
}

export function getCurrentUser(): Customer | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(currentUserKey);
    return stored ? (JSON.parse(stored) as Customer) : null;
  } catch {
    window.localStorage.removeItem(currentUserKey);
    return null;
  }
}

export function getUserNamespace(user: Customer | null = getCurrentUser()) {
  return normalizeStorageId(user?.email);
}

export function getCartKey(user: Customer | null = getCurrentUser()) {
  return `cart:${getUserNamespace(user)}`;
}

export function getWishlistKey(user: Customer | null = getCurrentUser()) {
  return `wishlist:${getUserNamespace(user)}`;
}

export function getOrdersKey(user: Customer | null = getCurrentUser()) {
  return `orders:${getUserNamespace(user)}`;
}

export function getCompareKey(user: Customer | null = getCurrentUser()) {
  return `compare:${getUserNamespace(user)}`;
}

export function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function mergeCartItems(existing: CartItem[], incoming: CartItem[]) {
  return incoming.reduce<CartItem[]>((merged, item) => {
    const found = merged.find(
      (current) =>
        current.productId === item.productId &&
        current.size === item.size &&
        current.color === item.color
    );
    if (!found) return [...merged, item];
    return merged.map((current) => (current === found ? { ...current, quantity: current.quantity + item.quantity } : current));
  }, existing);
}

function migrateFirstFound<T>(legacyKeys: string[], destinationKey: string, fallback: T) {
  if (typeof window === "undefined") return;
  const destinationHasValue = window.localStorage.getItem(destinationKey) !== null;
  if (!destinationHasValue) {
    const legacyValue = legacyKeys
      .map((key) => window.localStorage.getItem(key))
      .find((value) => value !== null);
    if (legacyValue !== undefined) {
      try {
        JSON.parse(legacyValue);
        window.localStorage.setItem(destinationKey, legacyValue);
      } catch {
        writeStoredValue(destinationKey, fallback);
      }
    }
  }
  legacyKeys.forEach((key) => window.localStorage.removeItem(key));
}

export function migrateLegacyDemoStorage() {
  migrateFirstFound<CartItem[]>(legacyCartKeys, getCartKey(null), []);
  migrateFirstFound<string[]>(legacyWishlistKeys, getWishlistKey(null), []);
  migrateFirstFound<Order[]>(legacyOrdersKeys, getOrdersKey(null), []);
  migrateFirstFound<string[]>(legacyCompareKeys, getCompareKey(null), []);
}

export function readAllDemoOrders() {
  if (typeof window === "undefined") return [];
  const orders: Order[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("orders:")) continue;
    orders.push(...readStoredValue<Order[]>(key, []));
  }
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
