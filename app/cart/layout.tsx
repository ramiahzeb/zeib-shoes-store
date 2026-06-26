import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default function CartLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
