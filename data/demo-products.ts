import type { Category, Order, Product, Review } from "@/lib/types";

export const categories: Category[] = ["Slippers", "Slides", "Sandals", "Shoes"];

export const products: Product[] = [
  {
    id: "prd-001",
    slug: "zeib-crown-leather-shoes",
    name: "ZEIB Crown Leather Shoes",
    category: "Shoes",
    price: 6990,
    oldPrice: 8490,
    rating: 4.8,
    reviewCount: 34,
    description:
      "A polished premium shoe with cushioned support for work, gatherings, and confident everyday wear.",
    features: ["Soft inner lining", "Durable outsole", "Premium stitched finish"],
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["Black", "Brown"],
    stock: 18,
    isNew: true,
    images: ["/images/zeib-hero.png"],
    createdAt: "2026-06-01"
  },
  {
    id: "prd-002",
    slug: "zeib-urban-slides",
    name: "ZEIB Urban Slides",
    category: "Slides",
    price: 2490,
    oldPrice: 2990,
    rating: 4.6,
    reviewCount: 21,
    description:
      "Clean, comfortable slides built for daily use, quick errands, and relaxed weekend styling.",
    features: ["Lightweight sole", "Water-friendly upper", "Easy slip-on shape"],
    sizes: ["39", "40", "41", "42", "43"],
    colors: ["Black", "White", "Gold"],
    stock: 42,
    isNew: true,
    images: ["/images/zeib-hero.png"],
    createdAt: "2026-05-24"
  },
  {
    id: "prd-003",
    slug: "zeib-comfort-slippers",
    name: "ZEIB Comfort Slippers",
    category: "Slippers",
    price: 1890,
    rating: 4.4,
    reviewCount: 18,
    description:
      "Soft daily slippers with a supportive footbed and refined ZEIB finish for home and casual wear.",
    features: ["Padded footbed", "Anti-slip grip", "Flexible movement"],
    sizes: ["38", "39", "40", "41", "42"],
    colors: ["Black", "Tan"],
    stock: 30,
    isNew: false,
    images: ["/images/zeib-hero.png"],
    createdAt: "2026-04-30"
  },
  {
    id: "prd-004",
    slug: "zeib-horizon-sandals",
    name: "ZEIB Horizon Sandals",
    category: "Sandals",
    price: 3290,
    oldPrice: 3790,
    rating: 4.7,
    reviewCount: 27,
    description:
      "Premium everyday sandals with adjustable straps, breathable comfort, and a confident profile.",
    features: ["Adjustable fit", "Breathable open design", "Grip-focused sole"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Black", "Camel"],
    stock: 25,
    isNew: false,
    images: ["/images/zeib-hero.png"],
    createdAt: "2026-05-12"
  },
  {
    id: "prd-005",
    slug: "zeib-elite-formal-shoes",
    name: "ZEIB Elite Formal Shoes",
    category: "Shoes",
    price: 7990,
    rating: 4.9,
    reviewCount: 42,
    description:
      "A sharp formal pair for meetings, weddings, and occasions where detail makes the difference.",
    features: ["Sleek toe shape", "Long-wear comfort", "Hand-finished shine"],
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["Black"],
    stock: 12,
    isNew: true,
    images: ["/images/zeib-hero.png"],
    createdAt: "2026-06-10"
  },
  {
    id: "prd-006",
    slug: "zeib-ease-daily-slides",
    name: "ZEIB Ease Daily Slides",
    category: "Slides",
    price: 2190,
    rating: 4.3,
    reviewCount: 15,
    description:
      "A soft, dependable slide made for repeat wear with a clean black-and-gold ZEIB look.",
    features: ["Soft strap", "Shock-absorbing base", "Daily comfort"],
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Black", "Charcoal"],
    stock: 35,
    isNew: false,
    images: ["/images/zeib-hero.png"],
    createdAt: "2026-03-19"
  }
];

export const reviews: Review[] = [
  {
    id: "rev-001",
    productId: "prd-001",
    customerName: "Hamza Ali",
    rating: 5,
    comment: "Excellent finish and comfortable for office wear.",
    approved: true,
    createdAt: "2026-06-12"
  },
  {
    id: "rev-002",
    productId: "prd-004",
    customerName: "Danish Khan",
    rating: 4,
    comment: "Good grip and premium packaging. Size guide helped.",
    approved: true,
    createdAt: "2026-06-15"
  },
  {
    id: "rev-003",
    productId: "prd-002",
    customerName: "Usman Raza",
    rating: 5,
    comment: "Slides feel light and look clean.",
    approved: false,
    createdAt: "2026-06-17"
  }
];

export const demoOrders: Order[] = [
  {
    id: "ZS-1001",
    customer: {
      id: "cust-demo",
      name: "Demo Customer",
      email: "customer@example.com",
      phone: "+92 300 1234567",
      address: "Karachi, Pakistan",
      role: "customer"
    },
    items: [{ productId: "prd-001", quantity: 1, size: "42", color: "Black" }],
    total: 6990,
    status: "Confirmed",
    createdAt: "2026-06-18"
  }
];
