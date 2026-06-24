import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  type DocumentData
} from "firebase/firestore";
import { getFirebaseServices, isAdminEmail } from "@/lib/firebase/client";
import type { Category, Product } from "@/lib/types";

export type ProductWriteInput = Pick<
  Product,
  "slug" | "name" | "category" | "price" | "oldPrice" | "sizes" | "colors" | "stock" | "description" | "images"
> &
  Partial<Pick<Product, "rating" | "reviewCount" | "features" | "isNew">>;

const validCategories: Category[] = ["Slippers", "Slides", "Sandals", "Shoes"];
const fallbackImage = "/images/zeib-hero.png";

function timestampToIso(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return new Date(0).toISOString();
}

function stringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function productFromDocument(id: string, data: DocumentData): Product {
  const category = validCategories.includes(data.category as Category) ? (data.category as Category) : "Shoes";
  const oldPrice = numberValue(data.oldPrice);
  const images = stringArray(data.images);
  const sizes = stringArray(data.sizes);
  const colors = stringArray(data.colors);

  return {
    id,
    slug: String(data.slug || id),
    name: String(data.name || "Untitled product"),
    category,
    price: Math.max(0, numberValue(data.price)),
    ...(oldPrice > 0 ? { oldPrice } : {}),
    rating: Math.max(0, numberValue(data.rating)),
    reviewCount: Math.max(0, numberValue(data.reviewCount)),
    description: String(data.description || ""),
    features: stringArray(data.features),
    sizes: sizes.length ? sizes : ["One Size"],
    colors: colors.length ? colors : ["Black"],
    stock: Math.max(0, numberValue(data.stock)),
    isNew: Boolean(data.isNew),
    images: images.length ? images : [fallbackImage],
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt)
  };
}

function requireAdminServices() {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error("Firebase is not configured. Add the Firebase environment variables before saving products.");
  }

  const email = services.auth.currentUser?.email;
  if (!email || !isAdminEmail(email)) {
    throw new Error("Your Firebase account is not authorized to manage products.");
  }

  return services;
}

function productFields(input: ProductWriteInput) {
  return {
    slug: input.slug.trim(),
    name: input.name.trim(),
    category: input.category,
    price: Math.max(0, input.price),
    oldPrice: input.oldPrice && input.oldPrice > 0 ? input.oldPrice : null,
    sizes: input.sizes,
    colors: input.colors,
    stock: Math.max(0, input.stock),
    description: input.description.trim(),
    images: input.images.length ? input.images : [fallbackImage],
    rating: Math.max(0, input.rating ?? 0),
    reviewCount: Math.max(0, input.reviewCount ?? 0),
    features: input.features ?? [],
    isNew: input.isNew ?? true
  };
}

export async function readFirebaseProducts() {
  const services = getFirebaseServices();
  if (!services) return [];

  const snapshot = await getDocs(collection(services.db, "products"));
  return snapshot.docs
    .map((item) => productFromDocument(item.id, item.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function readFirebaseProduct(id: string) {
  const services = getFirebaseServices();
  if (!services) return null;

  const snapshot = await getDoc(doc(services.db, "products", id));
  return snapshot.exists() ? productFromDocument(snapshot.id, snapshot.data()) : null;
}

export async function createFirebaseProduct(input: ProductWriteInput) {
  const services = requireAdminServices();
  const reference = doc(collection(services.db, "products"));

  await setDoc(reference, {
    id: reference.id,
    ...productFields(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return reference.id;
}

export async function updateFirebaseProduct(id: string, input: ProductWriteInput) {
  const services = requireAdminServices();
  const reference = doc(services.db, "products", id);
  const existing = await getDoc(reference);

  await setDoc(
    reference,
    {
      id,
      ...productFields(input),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function deleteFirebaseProduct(id: string) {
  const services = requireAdminServices();
  await deleteDoc(doc(services.db, "products", id));
}
