/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { categories } from "@/data/demo-products";
import { useProducts } from "@/components/providers/product-provider";
import { Button } from "@/components/ui/button";
import {
  createFirebaseProduct,
  updateFirebaseProduct,
  type ProductWriteInput
} from "@/lib/firebase/products";
import type { Product } from "@/lib/types";

export function ProductAdminForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { refreshProducts } = useProducts();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState(product?.images.join(", ") ?? "");
  const previewImages = useMemo(() => splitValues(imageUrls), [imageUrls]);

  function removeImage(url: string) {
    setImageUrls((current) => joinUniqueValues(splitValues(current).filter((item) => item !== url)));
  }

  return (
    <form
      className="rounded-md border border-white/10 bg-white/[0.04] p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setStatus("");
        setError("");

        const form = new FormData(event.currentTarget);
        const oldPrice = Number(form.get("oldPrice") || 0);
        const input: ProductWriteInput = {
          name: String(form.get("name") || "").trim(),
          slug: String(form.get("slug") || "").trim(),
          category: String(form.get("category") || "Shoes") as Product["category"],
          price: Number(form.get("price") || 0),
          ...(oldPrice > 0 ? { oldPrice } : {}),
          sizes: splitValues(form.get("sizes")),
          colors: splitValues(form.get("colors")),
          stock: Number(form.get("stock") || 0),
          description: String(form.get("description") || "").trim(),
          images: splitValues(imageUrls),
          rating: product?.rating ?? 0,
          reviewCount: product?.reviewCount ?? 0,
          features: product?.features ?? [],
          isNew: product?.isNew ?? true
        };

        try {
          if (product) {
            await updateFirebaseProduct(product.id, input);
            setStatus("Product updated successfully in Firestore.");
          } else {
            const id = await createFirebaseProduct(input);
            setStatus("Product added successfully to Firestore.");
            await refreshProducts();
            router.replace(`/admin/products/edit/${id}`);
            return;
          }
          await refreshProducts();
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Could not save the product.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Product name</span>
          <input
            name="name"
            defaultValue={product?.name}
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
            required
          />
        </label>
        <label>
          <span className="text-sm font-medium">Slug</span>
          <input
            name="slug"
            defaultValue={product?.slug}
            placeholder="zeib-premium-shoes"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
            required
          />
        </label>
        <label>
          <span className="text-sm font-medium">Category</span>
          <select
            name="category"
            defaultValue={product?.category ?? "Shoes"}
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Price</span>
          <input
            name="price"
            type="number"
            min="0"
            defaultValue={product?.price}
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
            required
          />
        </label>
        <label>
          <span className="text-sm font-medium">Old price</span>
          <input
            name="oldPrice"
            type="number"
            min="0"
            defaultValue={product?.oldPrice}
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
          />
        </label>
        <label>
          <span className="text-sm font-medium">Sizes</span>
          <input
            name="sizes"
            defaultValue={product?.sizes.join(", ")}
            placeholder="40, 41, 42"
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
            required
          />
        </label>
        <label>
          <span className="text-sm font-medium">Colors</span>
          <input
            name="colors"
            defaultValue={product?.colors.join(", ")}
            placeholder="Black, Brown"
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
            required
          />
        </label>
        <label>
          <span className="text-sm font-medium">Stock</span>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
            required
          />
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Image URLs</span>
          <input
            name="images"
            value={imageUrls}
            onChange={(event) => setImageUrls(event.target.value)}
            placeholder="/images/product.jpg, https://..."
            className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
          />
          <span className="mt-2 block text-xs text-white/45">
            Enter comma-separated URLs. Upload images to public/images and use paths like /images/product.jpg, or use hosted image URLs.
          </span>
        </label>
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-zeib-gold" />
            <span className="text-sm font-medium">Image preview</span>
          </div>
          {previewImages.length ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {previewImages.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-black/40">
                  <img src={url} alt="Product preview" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-2 top-2 h-9 w-9 bg-black/75 p-0 text-red-200 hover:bg-black"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-md border border-dashed border-white/15 p-5 text-sm text-white/45">
              Enter a local public image path or hosted image URL to preview it here.
            </p>
          )}
        </div>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Description</span>
          <textarea
            name="description"
            defaultValue={product?.description}
            className="focus-ring mt-2 min-h-32 w-full rounded-md border border-white/10 bg-black/50 p-3"
            required
          />
        </label>
      </div>
      <Button className="mt-5" disabled={saving}>
        {saving ? "Saving..." : product ? "Save product" : "Add product"}
      </Button>
      {status ? <p className="mt-3 text-sm text-green-300">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}

function splitValues(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinUniqueValues(values: string[]) {
  return Array.from(new Set(values)).join(", ");
}
