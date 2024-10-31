// viết hàm validate nhận vào checkSchema và trả ra middleware xử lý lỗi
// vì bản chất checkSchema không trả ra lỗi

import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';
import { StatusCodes } from 'http-status-codes';
import { EntityError, ErrorWithStatus } from '~/models/Errors';

export const validate = (checkSchema : RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await checkSchema.run(req)
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      return next()
    } else {
      const errObject = errors.mapped()
      const entityError = new EntityError({ errors: {}})
      for (const key in errObject) {
        const { msg } = errObject[key]
        if (msg instanceof ErrorWithStatus && msg.status !== StatusCodes.UNPROCESSABLE_ENTITY) {
          return next(msg)
        }

        entityError.errors[key] = msg
      }
      next(entityError)
    }
  }
}