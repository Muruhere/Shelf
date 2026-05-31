# Shelf — Setup Guide

## Prerequisites

- Node.js 20+ (use `nvm use 20`)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

## 1. Install dependencies

```bash
nvm use 20
npm install
```

## 2. Configure environment variables

Copy `.env.local` and fill in your values:

```
GEMINI_API_KEY=your_api_key_from_aistudio.google.com
APP_PASSWORD=choose_a_password
SESSION_SECRET=generate_with__openssl_rand_hex_32
```

To generate a SESSION_SECRET:
```bash
openssl rand -hex 32
```

## 3. Set up the database

```bash
npx prisma db push
npx prisma studio
```
prisma studio to view the SQLite data in UI

## 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be asked for your `APP_PASSWORD`.


## Migrating to Supabase (TODO)

1. Create a Supabase project, get the connection string
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`
3. Set `DATABASE_URL` to your Supabase Postgres connection string
4. Run `npx prisma migrate deploy`
