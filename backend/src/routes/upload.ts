import { Router, Request, Response } from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const router = Router()

// Configure multer for memory storage (we will stream the buffer directly to Supabase)
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only specific image types
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'))
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
router.post('/product', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' })
      return
    }

    const file = req.file
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `products/${Date.now()}_${originalName}`

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

    res.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Server upload error:', error)
    res.status(500).json({ error: 'Internal server error during upload.' })
  }
})

export default router
