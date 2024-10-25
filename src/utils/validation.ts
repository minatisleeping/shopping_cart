// viết hàm validate nhận vào checkSchema và trả ra middleware xử lý lỗi
// vì bản chất checkSchema không trả ra lỗi

import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';
import { StatusCodes } from 'http-status-codes';

export const validate = (checkSchema : RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await checkSchema.run(req) // chạy checkSchema
    const errors = validationResult(req) // lấy ra các lỗi từ req

    if (errors.isEmpty()) {
      return next()
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message: 'Validation errors!',
        errors: errors.mapped()
      })
    }
  }
}