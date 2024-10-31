// file này nahn65 vào hàm wrapAsync
// wrapAsunc nhận vào reqHandlerA
// sau đó trả về reqHandlerB có cấu trúc try|catch|next
// và chạy reqHandlerA trong try
import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapAsync = (func: RequestHandler<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
