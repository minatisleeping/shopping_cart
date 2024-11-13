import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ForgotPasswordReqBody, LoginReqBody, LogoutReqBody, RegisterReqBody, ResetPasswordReqBody, TokenPayload, VerifyEmailReqQuery, VerifyForgotPasswordTokenReqBody } from '~/models/requests/Users.request';
import usersService from '~/services/users.services';
import { ParamsDictionary } from 'express-serve-static-core';
import { ErrorWithStatus } from '~/models/Errors';
import { USERS_MESSAGES } from '~/constants/messages';
import { UserVerifyStatus } from '~/constants/enums';
import exp from 'constants';

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

export const verifyEmailTokenController = async (
  req: Request<ParamsDictionary, any, any, VerifyEmailReqQuery>,
  res: Response
) => {
  // khi họ bấm vào link thì họ sẽ gửi email_verify_token lên thông qua req.query
  // kiểm tra xem trong database có user nào sở hữu là user_id trong payload và email_verify_token
  const email_verify_token = req.query.email_verify_token as string
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  
  // kiểm tra xem user tìm được bị banned chưa, chưa thì mới cho verify
  const user = await usersService.checkEmailVerifyToken({ user_id, email_verify_token })
  
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      status: StatusCodes.UNAUTHORIZED,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    const result = await usersService.verifyEmail(user_id)

    res.status(StatusCodes.OK).json({
      message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
      ...result
    })
  }
}

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, any, any>,
  res: Response
) => {
  // dùng user_id để tìm user đó
  const { user_id } = req.decoded_authorization as TokenPayload
  // check user đó có verify hay bị banned ko? ko thì mới resend
  const user = await usersService.findUserById(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      status: StatusCodes.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: StatusCodes.OK,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  }

  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      status: StatusCodes.OK,
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  }

  await usersService.resendVerifyEmail(user_id)
  res.status(StatusCodes.OK).json({ message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS })
} 

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody, any>,
  res: Response
) => {
  const { email } = req.body as ForgotPasswordReqBody
  const hasUser = await usersService.checkEmailExist(email)
  
  if (!hasUser) {
    throw new ErrorWithStatus({
      status: StatusCodes.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  await usersService.forgotPassword(email)
  res.status(StatusCodes.OK).json({ message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response
) => {
  const { forgot_password_token } = req.body as VerifyForgotPasswordTokenReqBody
  const { user_id } = req.decoded_forgot_password_token as TokenPayload

  await usersService.verifyForgotPasswordToken({ user_id, forgot_password_token })

  res.status(StatusCodes.OK).json({ message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { forgot_password_token, password } = req.body

  await usersService.verifyForgotPasswordToken({ user_id, forgot_password_token })

  await usersService.resetPassword({ user_id, password })

  res.status(StatusCodes.OK).json({ message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS })
}
