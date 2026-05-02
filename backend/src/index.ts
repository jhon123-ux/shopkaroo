import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import swaggerSetup from './swagger'

import productRoutes from './routes/products'
import orderRoutes from './routes/orders'
import categoryRoutes from './routes/categories'
import reviewRoutes from './routes/reviews'
import bannerRoutes from './routes/banners'
import uploadRoutes from './routes/upload'
import offerBannerRoutes from './routes/offerBanner'
import wishlistRoutes from './routes/wishlist.routes'
import authRoutes from './routes/auth'
import teamRoutes from './routes/team'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// 1. Core Middlewares
app.use(helmet())
app.use(cors({
  origin: true, // Temporarily allow all for diagnosis
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-admin-auth'],
}))
app.options('*', cors())

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// 2. Critical Diagnostic Routes (Must be before others)
app.get('/', (req, res) => {
  res.send('Shopkaroo API is live and stable.')
})

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Shopkaroo',
    env: process.env.NODE_ENV || 'production'
  })
})

// 3. Application Routes
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/offer-banner', offerBannerRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/admin/auth', authRoutes)
app.use('/api/admin/team', teamRoutes)

// 4. Swagger & Error Handling
swaggerSetup(app)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({ 
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Shopkaroo API running on port ${PORT}`)
})

export default app
