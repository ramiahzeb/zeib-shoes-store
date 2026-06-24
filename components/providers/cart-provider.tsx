"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useProducts } from "@/components/providers/product-provider";
import { saveFirebaseCart, saveFirebaseOrder, saveFirebaseWishlist } from "@/lib/firebase/customer-data";
import {
  getCartKey,
  getCompareKey,
  getOrdersKey,
  getWishlistKey,
  mergeCartItems,
  migrateLegacyDemoStorage,
  readStoredValue,
  writeStoredValue
} from "@/lib/demo-storage";
import type { CartItem, Customer, Order } from "@/lib/types";

type CheckoutCustomer = Pick<Customer, "name" | "email" | "phone" | "address">;

type CartContextValue = {
  items: CartItem[];
  wishlist: string[];
  compare: string[];
  orders: Order[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size: string, color: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toggleCompare: (productId: string) => void;
  isCompared: (productId: string) => boolean;
  clearCompare: () => void;
  saveOrder: (customer: CheckoutCustomer) => Promise<Order>;
  subtotal: number;
  cartCount: number;
  buildWhatsAppUrl: (customer: CheckoutCustomer) => string;
};

const CartContext = createContext<CartContextValue | null>(null);

function makeStorageUser(customer: Customer | null) {
  return customer?.role === "admin" ? null : customer;
}

function loadUserData(customer: Customer | null) {
  if (customer?.role === "admin") {
    return {
      items: [],
      wishlist: [],
      compare: [],
      orders: []
    };
  }

  return {
    items: readStoredValue<CartItem[]>(getCartKey(customer), []),
    wishlist: readStoredValue<string[]>(getWishlistKey(customer), []),
    compare: readStoredValue<string[]>(getCompareKey(customer), []),
    orders: readStoredValue<Order[]>(getOrdersKey(customer), [])
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { customer, lastAuthAction } = useAuth();
  const { getProductById } = useProducts();
  const storageUser = makeStorageUser(customer);
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    migrateLegacyDemoStorage();

    if (customer?.role === "admin") {
      queueMicrotask(() => {
        setItems([]);
        setWishlist([]);
        setCompare([]);
        setOrders([]);
      });
      return;
    }

    if (customer && lastAuthAction === "login") {
      const guestItems = readStoredValue<CartItem[]>(getCartKey(null), []);
      const userItems = readStoredValue<CartItem[]>(getCartKey(customer), []);
      const mergedItems = mergeCartItems(userItems, guestItems);
      writeStoredValue(getCartKey(customer), mergedItems);
      writeStoredValue(getCartKey(null), []);
    }

    if (customer && lastAuthAction === "signup") {
      writeStoredValue(getCartKey(customer), []);
      writeStoredValue(getWishlistKey(customer), []);
      writeStoredValue(getCompareKey(customer), []);
      writeStoredValue(getOrdersKey(customer), []);
    }

    const nextData = loadUserData(customer);
    queueMicrotask(() => {
      setItems(nextData.items);
      setWishlist(nextData.wishlist);
      setCompare(nextData.compare);
      setOrders(nextData.orders);
    });
  }, [customer, lastAuthAction]);

  const subtotal = items.reduce((total, item) => {
    const product = getProductById(item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  function updateItems(updater: (current: CartItem[]) => CartItem[]) {
    setItems((current) => {
      const next = updater(current);
      writeStoredValue(getCartKey(storageUser), next);
      void saveFirebaseCart(storageUser, next).catch((caught) => {
        if (process.env.NODE_ENV === "development") console.log("[ZEIB Firebase] cart save failed", caught);
      });
      return next;
    });
  }

  function updateWishlist(updater: (current: string[]) => string[]) {
    setWishlist((current) => {
      const next = updater(current);
      writeStoredValue(getWishlistKey(storageUser), next);
      void saveFirebaseWishlist(storageUser, next).catch((caught) => {
        if (process.env.NODE_ENV === "development") console.log("[ZEIB Firebase] wishlist save failed", caught);
      });
      return next;
    });
  }

  function updateCompare(updater: (current: string[]) => string[]) {
    setCompare((current) => {
      const next = updater(current);
      writeStoredValue(getCompareKey(storageUser), next);
      return next;
    });
  }

  const value: CartContextValue = {
      items,
      wishlist,
      compare,
      orders,
      addItem(nextItem) {
        if (customer?.role === "admin") return;
        updateItems((current) => {
          const existing = current.find(
            (item) =>
              item.productId === nextItem.productId &&
              item.size === nextItem.size &&
              item.color === nextItem.color
          );
          if (!existing) return [...current, nextItem];
          return current.map((item) =>
            item === existing ? { ...item, quantity: item.quantity + nextItem.quantity } : item
          );
        });
      },
      removeItem(productId, size, color) {
        updateItems((current) =>
          current.filter(
            (item) => !(item.productId === productId && (!size || item.size === size) && (!color || item.color === color))
          )
        );
      },
      updateQuantity(productId, quantity, size, color) {
        updateItems((current) =>
          quantity < 1
            ? current.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
            : current.map((item) =>
                item.productId === productId && item.size === size && item.color === color
                  ? { ...item, quantity }
                  : item
              )
        );
      },
      clearCart() {
        updateItems(() => []);
      },
      toggleWishlist(productId) {
        if (customer?.role === "admin") return;
        updateWishlist((current) =>
          current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
        );
      },
      isWishlisted(productId) {
        return wishlist.includes(productId);
      },
      toggleCompare(productId) {
        if (customer?.role === "admin") return;
        updateCompare((current) => {
          if (current.includes(productId)) return current.filter((id) => id !== productId);
          return [...current, productId].slice(-3);
        });
      },
      isCompared(productId) {
        return compare.includes(productId);
      },
      clearCompare() {
        updateCompare(() => []);
      },
      async saveOrder(checkoutCustomer) {
        const orderCustomer: Customer = {
          id: customer?.id ?? checkoutCustomer.email,
          name: checkoutCustomer.name,
          email: checkoutCustomer.email,
          phone: checkoutCustomer.phone,
          address: checkoutCustomer.address,
          role: "customer"
        };
        const order: Order = {
          id: `ZS-${Date.now()}`,
          customer: orderCustomer,
          items,
          total: subtotal,
          status: "Pending",
          createdAt: new Date().toISOString()
        };
        const orderUser = customer?.role === "customer" ? customer : orderCustomer;
        const existingOrders = readStoredValue<Order[]>(getOrdersKey(orderUser), []);
        const nextOrders = [order, ...existingOrders];
        writeStoredValue(getOrdersKey(orderUser), nextOrders);
        if (storageUser?.email === orderUser.email) {
          setOrders(nextOrders);
        }
        await saveFirebaseOrder(order);
        return order;
      },
      subtotal,
      cartCount: customer?.role === "admin" ? 0 : items.reduce((total, item) => total + item.quantity, 0),
      buildWhatsAppUrl(checkoutCustomer) {
        const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
        const lines = [
          "ZEIB SHOES Order",
          `Name: ${checkoutCustomer.name}`,
          `Email: ${checkoutCustomer.email}`,
          `Phone: ${checkoutCustomer.phone}`,
          `Address: ${checkoutCustomer.address}`,
          "",
          "Items:",
          ...items.map((item) => {
            const product = getProductById(item.productId);
            return `- ${product?.name ?? item.productId} | Size ${item.size} | ${item.color} | Qty ${item.quantity} | PKR ${(product?.price ?? 0) * item.quantity}`;
          }),
          "",
          `Total: PKR ${subtotal}`
        ];
        return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
      }
    };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
