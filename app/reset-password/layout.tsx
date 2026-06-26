import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
