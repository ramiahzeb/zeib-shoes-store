import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import type { CartItem, Customer, Order } from "@/lib/types";

export type FirebaseCustomerProfile = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export async function saveFirebaseCustomerProfile(profile: FirebaseCustomerProfile) {
  const services = getFirebaseServices();
  if (!services) return;
  const reference = doc(services.db, "customers", profile.uid);
  const existing = await getDoc(reference).catch(() => null);

  await setDoc(
    reference,
    {
      ...profile,
      updatedAt: serverTimestamp(),
      ...(existing?.exists() ? {} : { createdAt: serverTimestamp() })
    },
    { merge: true }
  );
}

export async function readFirebaseCustomerProfile(uid: string) {
  const services = getFirebaseServices();
  if (!services) return null;

  const snapshot = await getDoc(doc(services.db, "customers", uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as Partial<FirebaseCustomerProfile>;
}

export async function saveFirebaseCart(customer: Customer | null, items: CartItem[]) {
  const services = getFirebaseServices();
  if (!services || !customer || customer.role === "admin") return;

  await setDoc(
    doc(services.db, "carts", customer.id),
    {
      uid: customer.id,
      email: customer.email,
      items,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function saveFirebaseWishlist(customer: Customer | null, productIds: string[]) {
  const services = getFirebaseServices();
  if (!services || !customer || customer.role === "admin") return;

  await setDoc(
    doc(services.db, "wishlist", customer.id),
    {
      uid: customer.id,
      email: customer.email,
      productIds,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function saveFirebaseOrder(order: Order) {
  const services = getFirebaseServices();
  if (!services) return;

  await setDoc(doc(services.db, "orders", order.id), {
    id: order.id,
    customerUid: order.customer.id,
    customerEmail: order.customer.email,
    customer: order.customer,
    items: order.items,
    order_items: order.items,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: serverTimestamp()
  });
}
