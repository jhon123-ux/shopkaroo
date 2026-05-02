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

app.use(helmet())

// Robust CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://shopkarro.com',
  'https://www.shopkarro.com'
]

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow no origin (server-to-server)
    if (!origin) return callback(null, true)
    
    // 2. Allow explicit list
    if (allowedOrigins.includes(origin)) return callback(null, true)
    
    // 3. Allow Vercel preview deployments
    if (/https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true)
    
    console.error(`CORS blocked for origin: ${origin}`)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-auth']
}))

// Handle preflight OPTIONS requests for all routes
app.options('*', cors())

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Health check (MUST be before routes)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    service: 'Shopkaroo Backend API'
  })
})

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
