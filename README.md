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
   - Allow public read: SELECT for all
   - Allow service role write: INSERT, UPDATE, DELETE

## Email System (Resend + Cloudflare)
### Verify shopkarro.com on Resend:
1. Go to [resend.com](https://resend.com) → Domains → Add Domain
2. Enter: `shopkarro.com`
3. Add the precise DNS records provided by Resend to your Cloudflare control panel:
   - **TXT record** for SPF authentication
   - **CNAME records** for DKIM signatures
4. Click **Verify** in the Resend dashboard.
5. Once verified (Status: ✅ Active), update the sender in `backend/src/controllers/orders.controller.ts`:
   - Change `SENDER_EMAIL` from `onboarding@resend.dev` to `orders@shopkarro.com`.
   - You can then remove the `cc: [ADMIN_CC]` field once testing is complete.
