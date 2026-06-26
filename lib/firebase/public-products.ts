import { products as demoProducts } from "@/data/demo-products";
import type { Category, Product } from "@/lib/types";

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
};

const categories: Category[] = ["Slippers", "Slides", "Sandals", "Shoes"];
const fallbackImage = "/images/zeib-hero.png";

function fieldValue(value?: FirestoreValue): unknown {
  if (!value) return undefined;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.nullValue !== undefined) return null;
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(fieldValue);
  if (value.mapValue) {
    return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, item]) => [key, fieldValue(item)]));
  }
  return undefined;
}

function getString(fields: Record<string, FirestoreValue>, name: string, fallback = "") {
  const value = fieldValue(fields[name]);
  return typeof value === "string" ? value : fallback;
}

function getNumber(fields: Record<string, FirestoreValue>, name: string, fallback = 0) {
  const value = Number(fieldValue(fields[name]));
  return Number.isFinite(value) ? value : fallback;
}

function getStrings(fields: Record<string, FirestoreValue>, name: string) {
  const value = fieldValue(fields[name]);
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function productFromFirestore(document: FirestoreDocument): Product | null {
  const fields = document.fields ?? {};
  const id = getString(fields, "id") || document.name?.split("/").pop();
  const slug = getString(fields, "slug");
  if (!id || !slug) return null;

  const requestedCategory = getString(fields, "category", "Shoes") as Category;
  const images = getStrings(fields, "images");
  const sizes = getStrings(fields, "sizes");
  const colors = getStrings(fields, "colors");
  const oldPrice = getNumber(fields, "oldPrice");

  return {
    id,
    slug,
    name: getString(fields, "name", "ZEIB SHOES"),
    category: categories.includes(requestedCategory) ? requestedCategory : "Shoes",
    price: Math.max(0, getNumber(fields, "price")),
    ...(oldPrice > 0 ? { oldPrice } : {}),
    rating: Math.max(0, getNumber(fields, "rating")),
    reviewCount: Math.max(0, getNumber(fields, "reviewCount")),
    description: getString(fields, "description"),
    features: getStrings(fields, "features"),
    sizes: sizes.length ? sizes : ["One Size"],
    colors: colors.length ? colors : ["Black"],
    stock: Math.max(0, getNumber(fields, "stock")),
    isNew: Boolean(fieldValue(fields.isNew)),
    images: images.length ? images : [fallbackImage],
    createdAt: getString(fields, "createdAt", new Date(0).toISOString()),
    updatedAt: getString(fields, "updatedAt") || undefined
  };
}

async function getPublicFirestoreProducts() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!projectId || !apiKey) return [];

  try {
    const endpoint = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`);
    endpoint.searchParams.set("key", apiKey);
    endpoint.searchParams.set("pageSize", "100");

    const response = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!response.ok) return [];

    const payload = (await response.json()) as { documents?: FirestoreDocument[] };
    return (payload.documents ?? [])
      .map(productFromFirestore)
      .filter((product): product is Product => Boolean(product))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function getSeoProducts() {
  const firestoreProducts = await getPublicFirestoreProducts();
  return firestoreProducts.length ? firestoreProducts : demoProducts;
}

export async function getSeoProductBySlug(slug: string) {
  const products = await getSeoProducts();
  return products.find((product) => product.slug === slug);
}
