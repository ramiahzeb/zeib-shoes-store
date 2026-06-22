import { notFound } from "next/navigation";
import { AdminGuard } from "@/components/commerce/admin-guard";
import { ProductAdminForm } from "@/components/commerce/product-admin-form";
import { Container, Section } from "@/components/ui/section";
import { getProductById } from "@/lib/store";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <Section>
      <Container className="max-w-4xl">
        <AdminGuard>
          <h1 className="font-serif text-4xl font-bold">Edit product</h1>
          <p className="mt-3 text-white/60">Update product data and media references.</p>
          <div className="mt-8">
            <ProductAdminForm product={product} />
          </div>
        </AdminGuard>
      </Container>
    </Section>
  );
}
