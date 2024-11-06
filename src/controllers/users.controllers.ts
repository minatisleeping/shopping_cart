import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LoginReqBody, LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/Users.request';
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

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id: user_id_at } = req.decoded_authorization as TokenPayload
  const { user_id: user_id_rt } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body as LogoutReqBody
  // check nếu user_id từ access token và refresh token không giống nhau
  if (user_id_at !== user_id_rt) {
    throw new ErrorWithStatus({
      status: StatusCodes.UNAUTHORIZED,
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
    })
  }

  // nó gửi 1 cái refresh_token cũ và không còn tồn tại trong db
  // vào db tìm xem có row nào có user_id và token giống với refresh_token gửi lên không
  await usersService.checkRefreshToken({ user_id: user_id_rt, refresh_token })

  await usersService.logout(refresh_token)

  res.status(StatusCodes.OK).json({ message: USERS_MESSAGES.LOGOUT_SUCCESS})
}
