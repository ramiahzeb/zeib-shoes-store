import { products, reviews } from "@/data/demo-products";
import type { Product } from "@/lib/types";

export function getProducts() {
  return products;
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(product: Product) {
  return products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);
}

export function getApprovedReviews(productId?: string) {
  return reviews.filter((review) => review.approved && (!productId || review.productId === productId));
}

export function getAverageRating(productId: string) {
  const productReviews = getApprovedReviews(productId);
  if (!productReviews.length) return 0;
  return productReviews.reduce((total, review) => total + review.rating, 0) / productReviews.length;
}
