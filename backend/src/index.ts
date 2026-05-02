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

// Flexible CORS support for multiple origins (comma-separated FRONTEND_URL)
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000']
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.error(`CORS blocked for origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
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

// Swagger
swaggerSetup(app)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'Shopkaroo API', version: '1.0.0' })
})

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
