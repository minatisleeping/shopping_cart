import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'path'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({
    maxFiles: 1,
    maxFileSize: 300 * 1024, // 300KB
    keepExtensions: true,
    uploadDir: path.resolve('uploads')
  })
  
  form.parse(req, (err, fields, files) => {
    if (err) throw err

    res.json({ message: 'Upload image successfully' })
  })
}
