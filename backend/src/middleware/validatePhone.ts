import { Request, Response, NextFunction } from 'express'

export const validatePhone = (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone is required' })
  }

  const phoneRegex = /^03[0-9]{9}$/
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: "Invalid phone",
      message: "Use format 03XXXXXXXXX"
    })
  }

  next()
}
