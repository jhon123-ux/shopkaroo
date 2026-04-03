import { Request, Response } from 'express'

export const getCategories = async (req: Request, res: Response) => {
  res.json({ data: [] })
}
