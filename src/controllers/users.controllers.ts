// controller cũng chỉ là handler có nhiệm vụ tập kết dữ liệu từ user và phân phát các service 
// đúng chỗ
// controller là nơi tập kết và xử lý logic cho các dữ liệu nhận được trong
// controller các dữ liệu đều phải clean

import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RegisterReqBody } from '~/models/requests/users.request';
import usersService from '~/services/users.services';
import { ParamsDictionary } from 'express-serve-static-core';
import { ErrorWithStatus } from '~/models/Errors';

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  //mình xà lơ, vì mình chưa có database
  //nếu có thì mình phải tách nhỏ xuống 1 tầng nữa là service thay vì viết ở đây

  if (email === 'minat@gmail.com' && password === 'minat123') {
    res.status(StatusCodes.OK).json({
      message: 'Login success!'
    })
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid email or password!'
    })
  }
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response
) => {
  const { email } = req.body as RegisterReqBody
  
  // check email đã tồn tại chưa
  const isEmailExist = await usersService.checkEmailExist(email)

  if (isEmailExist) {
    throw new ErrorWithStatus({
      status: StatusCodes.UNPROCESSABLE_ENTITY,
      message: 'Email already exists!'
    })
  }
          
  const result = await usersService.register(req.body)

  res.status(StatusCodes.CREATED).json({
    message: 'Register success!',
    result
  })
}
