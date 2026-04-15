import { Router, Request, Response } from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import { adminAuth } from '../middleware/auth.middleware'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const router = Router()

// Configure multer for memory storage (we will stream the buffer directly to Supabase)
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true)
    } else {
      console.log('Rejected file type:', file.mimetype)
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`))
    }
  }
})

/**
 * @swagger
 * /api/upload/banner:
 *   post:
 *     summary: Upload a banner image to Supabase storage
 *     tags: [Configuration]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Public URL of the uploaded image
 *       400:
 *         description: Bad request / Upload error
 */
router.post('/banner', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' })
      return
    }

    const file = req.file
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `banners/${Date.now()}_${originalName}`

    // Upload using Supabase Admin client
    const { data, error } = await supabaseAdmin.storage
      .from('banners')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      console.log('Supabase upload error:', error)
      res.status(500).json({ 
        error: 'Upload failed', 
        details: error.message 
      })
      return
    }

    // Get public URL of the uploaded asset
    const { data: urlData } = supabaseAdmin.storage
      .from('banners')
      .getPublicUrl(data.path)

    res.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Server upload error:', error)
    res.status(500).json({ error: 'Internal server error during upload.' })
  }
})

/**
 * @swagger
 * /api/upload/product:
 *   post:
 *     summary: Upload a product image to Supabase storage
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: Bad request / Upload error
 */
router.post('/product', adminAuth, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Product upload request received')
    console.log('Content-Type:', req.headers['content-type'])
    console.log('File received:', req.file ? `${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)` : 'NONE')

    if (!req.file) {
      console.log('No file in request. Body keys:', Object.keys(req.body || {}))
      res.status(400).json({ error: 'No image file provided. Make sure you are sending a file with field name "image".' })
      return
    }

    const file = req.file
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `products/${Date.now()}_${originalName}`

    console.log('Uploading to Supabase storage:', fileName)

    // Upload using Supabase Admin client
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      console.log('Supabase upload error:', error)
      res.status(500).json({ 
        error: 'Upload failed', 
        details: error.message 
      })
      return
    }

    // Get public URL of the uploaded asset
    const { data: urlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(data.path)

    console.log('Upload successful:', urlData.publicUrl)
    res.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Server upload error:', error)
    res.status(500).json({ error: 'Internal server error during upload.' })
  }
})

/**
 * @swagger
 * /api/upload/category:
 *   post:
 *     summary: Upload a category image to Supabase storage
 *     tags: [Configuration]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 */
router.post('/category', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' })
      return
    }

    const file = req.file
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `categories/${Date.now()}_${originalName}`

    // Upload using Supabase Admin client
    const { data, error } = await supabaseAdmin.storage
      .from('categories')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      console.log('Supabase upload error:', error)
      res.status(500).json({ 
        error: 'Upload failed', 
        details: error.message 
      })
      return
    }

    // Get public URL of the uploaded asset
    const { data: urlData } = supabaseAdmin.storage
      .from('categories')
      .getPublicUrl(data.path)

    res.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Server upload error:', error)
    res.status(500).json({ error: 'Internal server error during upload.' })
  }
})

export default router
