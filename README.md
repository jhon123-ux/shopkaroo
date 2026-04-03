# Shopkaroo
Pakistan furniture e-commerce — shopkaroo.com

## Structure
- /frontend — Next.js 16.1 app
- /backend — Node.js + Express API

## Quick Start
cd frontend && npm install && npm run dev    → http://localhost:3000
cd backend && npm install && npm run dev     → http://localhost:5000

## API Docs
http://localhost:5000/api-docs

## Tech Stack
Frontend: Next.js 16.1, Tailwind CSS v4, TypeScript
Backend: Node.js, Express, TypeScript
Database: Supabase (PostgreSQL)
Hosting: Vercel (frontend), Railway or Render (backend)
Brand: Shopkaroo — shopkaroo.com

## Supabase Storage Setup (Required for CMS):
1. Go to Supabase Dashboard → Storage
2. Create two new buckets named: "banners" and "products"
3. Set both buckets to PUBLIC
4. Under bucket policies for BOTH buckets add:
   - Allow public read: SELECT for all
   - Allow service role write: INSERT, UPDATE, DELETE
