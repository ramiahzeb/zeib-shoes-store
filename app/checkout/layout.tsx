import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
