export type Category = "Slippers" | "Slides" | "Sandals" | "Shoes";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  isNew: boolean;
  images: string[];
  createdAt: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  size: string;
  color: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "customer" | "admin";
};

export type Review = {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
};

export type Order = {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: "Pending" | "Confirmed" | "Dispatched" | "Delivered";
  createdAt: string;
};
