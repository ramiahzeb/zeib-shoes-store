import { clsx } from "clsx";

export function Section({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={clsx("px-4 py-14 sm:px-6 lg:px-8", className)}>{children}</section>;
}

export function Container({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("mx-auto w-full max-w-7xl", className)}>{children}</div>;
}
