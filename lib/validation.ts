import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

export const customerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(7),
  address: z.string().min(5)
});

export const productSchema = z.object({
  name: z.string().min(2),
  category: z.enum(["Slippers", "Slides", "Sandals", "Shoes"]),
  price: z.coerce.number().positive(),
  oldPrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative(),
  description: z.string().min(10)
});
