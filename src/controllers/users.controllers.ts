import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LoginReqBody, RegisterReqBody } from '~/models/requests/users.request';
import usersService from '~/services/users.services';
import { ParamsDictionary } from 'express-serve-static-core';
import { ErrorWithStatus } from '~/models/Errors';
import { USERS_MESSAGES } from '~/constants/messages';

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body as LoginReqBody
  
  const result = await usersService.login({ email, password })

  res.status(StatusCodes.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response
) => {
  const { email } = req.body as RegisterReqBody
  
  const isEmailExist = await usersService.checkEmailExist(email)

  if (isEmailExist) {
    throw new ErrorWithStatus({
      status: StatusCodes.UNPROCESSABLE_ENTITY,
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
  }
          
  const result = await usersService.register(req.body)

  res.status(StatusCodes.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
