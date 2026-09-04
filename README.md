This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash

yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Authentication

The calculator can be used anonymously. To enable saving estimates, create a
Supabase project and enable Google in **Authentication > Providers** using a
Google OAuth client ID and secret.

In Google Cloud, add Supabase's callback as an **Authorized redirect URI**:

- `https://<project-ref>.supabase.co/auth/v1/callback`

In Supabase **Authentication > URL Configuration**, add the application URLs
to the redirect allow list:

- `http://localhost:3000/auth/callback`
- `https://bem-feitinho.vercel.app/auth/callback`

Configure the Google OAuth client in Supabase rather than in this repository.
The OAuth client secret must never be committed or exposed in browser code. If
a secret has been shared publicly, revoke it and create a replacement first.

Copy `.env.example` to `.env.local` and fill in the Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Set the same variables in the Vercel project environment settings for Preview
and Production deployments.

### Database migration

Apply `supabase/migrations/202609030001_create_calculations.sql` in the Supabase
SQL editor before enabling saves. It creates the profile and calculation tables,
adds per-user Row Level Security policies, and creates profiles for new users.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
