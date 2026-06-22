import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminGuard } from "@/components/commerce/admin-guard";
import { LinkButton } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { products } from "@/data/demo-products";
import { formatPrice } from "@/lib/format";

export default function ManageProductsPage() {
  return (
    <Section>
      <Container>
        <AdminGuard>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="font-serif text-4xl font-bold">Manage products</h1>
            <LinkButton href="/admin/products/add">
              <Plus className="h-4 w-4" /> Add product
            </LinkButton>
          </div>
          <div className="mt-8 overflow-hidden rounded-md border border-white/10">
            {products.map((product) => (
              <div key={product.id} className="grid gap-4 border-b border-white/10 bg-white/[0.04] p-4 last:border-0 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-white/55">
                    {product.category} | {formatPrice(product.price)} | Stock {product.stock}
                  </p>
                </div>
                <Link href={`/admin/products/edit/${product.id}`} className="inline-flex items-center gap-2 text-sm text-zeib-soft-gold">
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
                <button className="inline-flex items-center gap-2 text-sm text-red-300">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            ))}
          </div>
        </AdminGuard>
      </Container>
    </Section>
  );
}
