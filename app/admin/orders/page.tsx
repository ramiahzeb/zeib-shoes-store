import { AdminGuard } from "@/components/commerce/admin-guard";
import { AdminOrdersList } from "@/components/commerce/admin-orders-list";
import { Container, Section } from "@/components/ui/section";

export default function ManageOrdersPage() {
  return (
    <Section>
      <Container>
        <AdminGuard>
          <h1 className="font-serif text-4xl font-bold">Manage orders</h1>
          <AdminOrdersList />
        </AdminGuard>
      </Container>
    </Section>
  );
}
