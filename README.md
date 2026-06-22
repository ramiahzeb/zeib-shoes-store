# ZEIB SHOES

Production-ready Next.js e-commerce app for **ZEIB SHOES** with local demo data first, Supabase-ready architecture, WhatsApp checkout, and Vercel deployment support.

## Stack

- Next.js 16.2.9 App Router
- React 19.2.7
- Tailwind CSS 4
- Supabase-ready auth, database, storage, reviews, wishlist, cart, and orders
- Resend/SendGrid-ready server email route
- Vercel-ready environment configuration

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo admin login:

```text
admin@zeibshoes.my.id
any password
```

## Environment

Copy `.env.example` to `.env.local` and fill values when ready.

Important TODOs:

- Add `NEXT_PUBLIC_SUPABASE_URL`
- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Add server-only `SUPABASE_SERVICE_ROLE_KEY`
- Add `RESEND_API_KEY` or `SENDGRID_API_KEY`
- Add `NEXT_PUBLIC_WHATSAPP_NUMBER`

Secrets must stay in server env vars only. Do not expose service role or email API keys in frontend code.

## Supabase

1. Create a Supabase project.
2. Run `sql/supabase-schema.sql` in the Supabase SQL Editor.
3. Enable email/password auth.
4. Create a `product-images` storage bucket or configure Cloudinary.
5. Add admin users to `public.admin_users`.
6. Replace demo localStorage flows in `components/providers` with Supabase calls.

The app currently runs without keys using local demo products, auth, cart, wishlist, orders, and reviews.

## Email

The welcome email route is `app/api/welcome-email/route.ts`.

Subject:

```text
Welcome to ZEIB SHOES
```

Body:

```text
Thank you for joining ZEIB SHOES. Walk With Confidence.
```

Add Resend or SendGrid provider code in `lib/email/welcome.ts` after API keys are configured.

## Vercel Deployment

1. Import this local project into Vercel when you are ready.
2. Add all variables from `.env.example`.
3. Set production domain to `zeibshoes.my.id`.
4. Add future domain `zeibshoes.com` when available.
5. Run the production build:

```bash
npm run build
```

## Commands

```bash
npm install
npm run lint
npm run build
npm run dev
```

## Notes

- GitHub push has not been configured or performed.
- Product imagery is local in `public/images`.
- Sensitive work is prepared for server actions/API routes.
- Demo mode is intentionally local-first so the storefront works before Supabase keys are added.
