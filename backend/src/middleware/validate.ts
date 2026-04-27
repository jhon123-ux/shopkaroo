import { Request, Response, NextFunction } from 'express'
import { z, ZodError, ZodTypeAny } from 'zod'

/**
 * 🛡️ Schema Validation Middleware
 * ----------------------------
 * Validates the request body patterns against a Zod schema.
 * Rejects with 422 Unprocessable Entity if validation fails.
 */
export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          error: 'Validation failed',
          details: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        })
      }
      res.status(500).json({ error: 'Internal validation error' })
    }
  }
}
