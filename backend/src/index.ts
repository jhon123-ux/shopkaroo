import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
const listEndpoints = require('express-list-endpoints')
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

app.use(helmet())

// FIX 2 — CORS COMPLETELY
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://shopkarro.com',
  'https://www.shopkarro.com',
  'https://shopkaroo.com',
  'https://www.shopkaroo.com',
]

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    
    // Allow any Vercel preview deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    
    // Allow listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true)
    
    console.log('CORS blocked origin:', origin)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie'],
}))

// Handle preflight for ALL routes — must be before all other routes
app.options('*', cors())

// FIX 3 — ADD HEALTH CHECK ROUTE
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  })
})

// FIX 4 — ADD REQUEST LOGGING
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — Origin: ${req.headers.origin || 'none'}`)
  next()
})

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Routes
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

// STEP 5 — VERIFY ROUTE IS REGISTERED
console.log('Registered routes:', JSON.stringify(listEndpoints(app), null, 2))

// Swagger
swaggerSetup(app)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: 'File upload error', details: err.message });
  }
  
  const status = err.status || 500;
  res.status(status).json({ 
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Shopkaroo API running on http://localhost:${PORT}`)
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`)
})

export default app
