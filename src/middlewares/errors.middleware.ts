import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { omit } from 'lodash';

export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json(
    omit(error, 'status')
  )
}
