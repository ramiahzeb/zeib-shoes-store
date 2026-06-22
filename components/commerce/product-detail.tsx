"use client";

import Image from "next/image";
import { GitCompare, Heart, Share2, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Product, Review } from "@/lib/types";

export function ProductDetail({ product, reviews }: { product: Product; reviews: Review[] }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const { addItem, toggleWishlist, isWishlisted, toggleCompare, isCompared } = useCart();
  const { customer } = useAuth();

  function flashStatus(message: string) {
    setActionStatus(message);
    window.setTimeout(() => setActionStatus(""), 1800);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-white/5">
          <Image src={product.images[0]} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {product.images.map((image) => (
            <div key={image} className="relative aspect-square overflow-hidden rounded-md border border-white/10 bg-white/5">
              <Image src={image} alt={`${product.name} gallery`} fill sizes="120px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-zeib-soft-gold">{product.category}</p>
        <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{product.name}</h1>
        <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <Star className="h-5 w-5 fill-zeib-gold text-zeib-gold" />
          <span>{product.rating}</span>
          <span>{product.reviewCount} reviews</span>
          <span className={product.stock > 0 ? "text-green-300" : "text-red-300"}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
        <div className="mt-5 flex items-end gap-3">
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
          {product.oldPrice ? <span className="text-lg text-white/45 line-through">{formatPrice(product.oldPrice)}</span> : null}
        </div>
        <p className="mt-5 leading-7 text-white/68">{product.description}</p>

        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  className={`focus-ring h-10 min-w-12 rounded-md border px-3 text-sm ${size === item ? "border-zeib-gold bg-zeib-gold text-black" : "border-white/10 bg-white/[0.04]"}`}
                  onClick={() => setSize(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((item) => (
                <button
                  key={item}
                  className={`focus-ring rounded-md border px-4 py-2 text-sm ${color === item ? "border-zeib-gold bg-zeib-gold text-black" : "border-white/10 bg-white/[0.04]"}`}
                  onClick={() => setColor(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="quantity" className="mb-2 block text-sm font-semibold">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              className="focus-ring h-11 w-24 rounded-md border border-white/10 bg-black/50 px-3"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            disabled={product.stock < 1}
            onClick={() => {
              addItem({ productId: product.id, quantity, size, color });
              flashStatus("Added to cart.");
            }}
          >
            Add to cart
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toggleWishlist(product.id);
              flashStatus(isWishlisted(product.id) ? "Removed from wishlist." : "Added to wishlist.");
            }}
          >
            <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-zeib-gold" : ""}`} /> Wishlist
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toggleCompare(product.id);
              flashStatus(isCompared(product.id) ? "Removed from compare." : "Added to compare.");
            }}
          >
            <GitCompare className="h-4 w-4" /> Compare
          </Button>
          <Button variant="secondary" onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
        {actionStatus ? <p className="mt-3 text-sm text-green-300">{actionStatus}</p> : null}

        <div className="mt-8 rounded-md border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Product details</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/68">
            {product.features.map((feature) => (
              <li key={feature}>- {feature}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-md border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Customer reviews</h2>
          <div className="mt-4 space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.customerName}</p>
                    <p className="text-sm text-zeib-soft-gold">{review.rating}/5</p>
                  </div>
                  <p className="mt-2 text-sm text-white/65">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No approved reviews yet.</p>
            )}
          </div>

          {customer ? (
            <form
              className="mt-5 border-t border-white/10 pt-5"
              onSubmit={(event) => {
                event.preventDefault();
                const storedReviews = JSON.parse(window.localStorage.getItem("reviews:submitted") || "[]") as unknown[];
                window.localStorage.setItem(
                  "reviews:submitted",
                  JSON.stringify([
                    {
                      id: crypto.randomUUID(),
                      productId: product.id,
                      customerName: customer.name,
                      customerEmail: customer.email,
                      rating,
                      comment,
                      approved: false,
                      createdAt: new Date().toISOString()
                    },
                    ...storedReviews
                  ])
                );
                setSubmitted(true);
                setComment("");
              }}
            >
              <label className="block text-sm font-medium" htmlFor="rating">
                Rating
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/60 px-3"
              >
                {[5, 4, 3, 2, 1].map((item) => (
                  <option key={item} value={item}>
                    {item} stars
                  </option>
                ))}
              </select>
              <label className="mt-4 block text-sm font-medium" htmlFor="review">
                Review
              </label>
              <textarea
                id="review"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="focus-ring mt-2 min-h-28 w-full rounded-md border border-white/10 bg-black/60 p-3"
                required
              />
              <Button className="mt-3" type="submit">
                Submit review
              </Button>
              {submitted ? <p className="mt-3 text-sm text-green-300">Review submitted for admin approval.</p> : null}
            </form>
          ) : (
            <p className="mt-5 border-t border-white/10 pt-5 text-sm text-white/60">Login to write a review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
