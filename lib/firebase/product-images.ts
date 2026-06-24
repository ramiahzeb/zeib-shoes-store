import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseServices, isAdminEmail } from "@/lib/firebase/client";

const maxImageSize = 8 * 1024 * 1024;

function safeFileName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "product-image";
}

export async function uploadFirebaseProductImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Select a valid image file.");
  }
  if (file.size > maxImageSize) {
    throw new Error("Product images must be 8 MB or smaller.");
  }

  const services = getFirebaseServices();
  if (!services) {
    throw new Error("Firebase is not configured. Add the Firebase environment variables before uploading images.");
  }

  const email = services.auth.currentUser?.email;
  if (!email || !isAdminEmail(email)) {
    throw new Error("Your Firebase account is not authorized to upload product images.");
  }

  const storagePath = `product-images/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const snapshot = await uploadBytes(ref(services.storage, storagePath), file, {
    contentType: file.type,
    customMetadata: {
      uploadedBy: email
    }
  });

  return getDownloadURL(snapshot.ref);
}
