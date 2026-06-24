# ZEIB SHOES

Production-ready Next.js e-commerce app for **ZEIB SHOES** with local demo data first, Firebase-ready architecture, WhatsApp checkout, and Vercel deployment support.

## Stack

- Next.js 16.2.9 App Router
- React 19.2.7
- Tailwind CSS 4
- Firebase Authentication and Firestore-ready customers, products, reviews, wishlist, cart, and orders
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

- Add Firebase web app variables: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID`
- Add `NEXT_PUBLIC_ADMIN_EMAILS`
- Add `RESEND_API_KEY` or `SENDGRID_API_KEY`
- Add `NEXT_PUBLIC_WHATSAPP_NUMBER`

Secrets must stay in server env vars only. Do not expose email API keys in frontend code.

## Firebase

1. Create a Firebase project.
2. Add a Web App and copy its config values into `.env.local`.
3. Enable Authentication with the Email/Password provider.
4. Create Firestore Database.
5. Use these collections: `customers`, `products`, `reviews`, `wishlist`, `carts`, and `orders`.
6. Orders store `order_items` as a nested array for now.
7. Add admin emails to `NEXT_PUBLIC_ADMIN_EMAILS`.
8. Keep product images local in `public/images` until Firebase Storage or Cloudinary is connected.

See `docs/firebase-firestore-structure.md` for the prepared collection shape.

The app currently runs without Firebase keys using local demo products, auth, cart, wishlist, orders, and reviews.

Visit `http://localhost:3000/debug-firebase` to verify Firebase public config is loaded in the browser.

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
- Demo mode is intentionally local-first so the storefront works before Firebase keys are added.
