"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/compare", label: "Compare" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount, wishlist } = useCart();
  const { customer, welcomeMessage } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur">
        {welcomeMessage ? (
          <div className="bg-zeib-gold px-4 py-2 text-center text-sm font-semibold text-black">{welcomeMessage}</div>
        ) : null}
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl font-bold tracking-wide text-white">ZEIB SHOES</span>
            <span className="mt-1 text-xs uppercase tracking-[0.26em] text-zeib-soft-gold">Walk With Confidence</span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/75 transition hover:text-white">
                {link.label}
              </Link>
            ))}
            {customer?.role === "admin" ? (
              <Link href="/admin" className="text-sm text-zeib-soft-gold transition hover:text-white">
                Admin
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <Link href="/products" className="focus-ring rounded-md p-2 text-white/80 hover:bg-white/10" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/wishlist" className="focus-ring relative rounded-md p-2 text-white/80 hover:bg-white/10" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlist.length ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-zeib-gold" />
              ) : null}
            </Link>
            <Link href={customer ? "/account" : "/login"} className="focus-ring rounded-md p-2 text-white/80 hover:bg-white/10" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              className="relative h-10 w-10 p-0"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-zeib-gold px-1 text-xs text-black">
                  {cartCount}
                </span>
              ) : null}
            </Button>
            <Button
              variant="ghost"
              className="h-10 w-10 p-0 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>
        {menuOpen ? (
          <div className="border-t border-white/10 px-4 py-4 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-white/75 hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {customer?.role === "admin" ? (
                <Link href="/admin" className="rounded-md px-3 py-2 text-zeib-soft-gold" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
