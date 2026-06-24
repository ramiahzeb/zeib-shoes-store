import { AdminGuard } from "@/components/commerce/admin-guard";
import { ProductAdminForm } from "@/components/commerce/product-admin-form";
import { Container, Section } from "@/components/ui/section";

export default function AddProductPage() {
  return (
    <Section>
      <Container className="max-w-4xl">
        <AdminGuard>
          <h1 className="font-serif text-4xl font-bold">Add product</h1>
          <p className="mt-3 text-white/60">Create a product in the Firebase Firestore products collection.</p>
          <div className="mt-8">
            <ProductAdminForm />
          </div>
        </AdminGuard>
      </Container>
    </Section>
  );
}
