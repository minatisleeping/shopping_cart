import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { omit } from 'lodash';
import { ErrorWithStatus } from '~/models/Errors';

export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    // những lôi khác thì có nhiều thuộc tính mình k biết, nhưng có thể sẽ có stack và k có status
    // chỉnh hết các key trong Object về enumberable: true
    Object.getOwnPropertyNames(error).forEach(key => {
      Object.defineProperty(error, key, { enumerable: true })
    })

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
      omit(error, ['stack'])
    )
  }
}
