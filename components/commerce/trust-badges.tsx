import { BadgeCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

const badges = [
  { icon: BadgeCheck, label: "Cash on Delivery" },
  { icon: RefreshCcw, label: "Easy Exchange" },
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: Truck, label: "Delivery Across Pakistan" }
];

export function TrustBadges() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => (
        <div key={badge.label} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4">
          <badge.icon className="h-5 w-5 text-zeib-gold" />
          <span className="text-sm font-semibold">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
