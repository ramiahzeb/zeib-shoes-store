"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Container, Section } from "@/components/ui/section";
import { reviews } from "@/data/demo-products";
import { getProductById } from "@/lib/store";

export default function ReviewsPage() {
  const { customer } = useAuth();

  return (
    <Section>
      <Container>
        <h1 className="font-serif text-4xl font-bold">Reviews</h1>
        <p className="mt-3 text-white/65">
          Approved reviews are public. New customer reviews are held for admin approval.
        </p>
        <div className="mt-8 grid gap-4">
          {reviews.map((review) => {
            const product = getProductById(review.productId);
            return (
              <article key={review.id} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="font-semibold">{review.customerName}</p>
                    {product ? (
                      <Link href={`/products/${product.slug}`} className="text-sm text-zeib-soft-gold">
                        {product.name}
                      </Link>
                    ) : null}
                  </div>
                  <p className={review.approved ? "text-green-300" : "text-yellow-300"}>
                    {review.approved ? "Approved" : "Pending"} | {review.rating}/5
                  </p>
                </div>
                <p className="mt-3 text-sm text-white/65">{review.comment}</p>
              </article>
            );
          })}
        </div>
        {!customer ? <p className="mt-6 text-sm text-white/55">Login and open a product page to write a review.</p> : null}
      </Container>
    </Section>
  );
}
