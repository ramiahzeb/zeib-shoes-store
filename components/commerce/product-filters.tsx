"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/commerce/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { categories } from "@/data/demo-products";
import type { Category, Product } from "@/lib/types";

type SortOption = "newest" | "price-low" | "price-high" | "rating";

export function ProductFilters({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [maxPrice, setMaxPrice] = useState(9000);
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    return products
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
      .filter((product) => category === "All" || product.category === category)
      .filter((product) => product.price <= maxPrice)
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [category, maxPrice, products, query, sort]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-md border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-zeib-gold" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        <label className="block text-sm font-medium text-white/75" htmlFor="search">
          Search
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3">
          <Search className="h-4 w-4 text-white/45" />
          <input
            id="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search footwear"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/35"
          />
        </div>

        <label className="mt-5 block text-sm font-medium text-white/75" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as Category | "All")}
          className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/60 px-3 text-sm"
        >
          <option>All</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <label className="mt-5 block text-sm font-medium text-white/75" htmlFor="price">
          Max price: PKR {maxPrice}
        </label>
        <input
          id="price"
          type="range"
          min="1500"
          max="9000"
          step="250"
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="mt-3 w-full accent-zeib-gold"
        />

        <label className="mt-5 block text-sm font-medium text-white/75" htmlFor="sort">
          Sort
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/60 px-3 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="rating">Rating</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-white/60">{filtered.length} products found</p>
        </div>
        {filtered.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState title="No matching footwear" body="Adjust your search, category, or price filter." />
        )}
      </div>
    </div>
  );
}
