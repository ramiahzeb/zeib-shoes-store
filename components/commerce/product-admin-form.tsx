"use client";

import { useState } from "react";
import { categories } from "@/data/demo-products";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function ProductAdminForm({ product }: { product?: Product }) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="rounded-md border border-white/10 bg-white/[0.04] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Product name</span>
          <input defaultValue={product?.name} className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" required />
        </label>
        <label>
          <span className="text-sm font-medium">Category</span>
          <select defaultValue={product?.category ?? "Shoes"} className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3">
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Price</span>
          <input type="number" defaultValue={product?.price} className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" required />
        </label>
        <label>
          <span className="text-sm font-medium">Old price</span>
          <input type="number" defaultValue={product?.oldPrice} className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" />
        </label>
        <label>
          <span className="text-sm font-medium">Sizes</span>
          <input defaultValue={product?.sizes.join(", ")} placeholder="40, 41, 42" className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" required />
        </label>
        <label>
          <span className="text-sm font-medium">Colors</span>
          <input defaultValue={product?.colors.join(", ")} placeholder="Black, Brown" className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" required />
        </label>
        <label>
          <span className="text-sm font-medium">Stock</span>
          <input type="number" defaultValue={product?.stock ?? 0} className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" required />
        </label>
        <label>
          <span className="text-sm font-medium">Product image</span>
          <input type="file" accept="image/*" className="focus-ring mt-2 block w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm" />
          <span className="mt-2 block text-xs text-white/45">
            TODO: Upload to Supabase Storage or Cloudinary and save URL in product_images.
          </span>
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Description</span>
          <textarea defaultValue={product?.description} className="focus-ring mt-2 min-h-32 w-full rounded-md border border-white/10 bg-black/50 p-3" required />
        </label>
      </div>
      <Button className="mt-5">{product ? "Save product" : "Add product"}</Button>
      {saved ? <p className="mt-3 text-sm text-green-300">Demo product saved locally. Connect Supabase to persist changes.</p> : null}
    </form>
  );
}
