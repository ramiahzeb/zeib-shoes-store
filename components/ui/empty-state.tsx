import { PackageOpen } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-8 text-center">
      <PackageOpen className="mx-auto mb-4 h-10 w-10 text-zeib-gold" aria-hidden />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/65">{body}</p>
    </div>
  );
}
