// controller cũng chỉ là handler có nhiệm vụ tập kết dữ liệu từ user và phân phát các service 
// đúng chỗ
// controller là nơi tập kết và xử lý logic cho các dữ liệu nhận được trong
// controller các dữ liệu đều phải clean

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RegisterReqBody } from '~/models/requests/users.request';
import usersService from '~/services/users.services';
import { ParamsDictionary } from 'express-serve-static-core';

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
  
  try {
    // check email đã tồn tại chưa
    const isEmailExist = await usersService.checkEmailExist(email)

    if (isEmailExist) {
      // throw new Error('Email already exists!')
      const customError = new Error('Email already exists!')
      // chỉnh bộ cờ của 1 object - descriptor properties
      Object.defineProperty(customError, 'message', {
        enumerable: true,
      })
      throw customError
    }

    const result = await usersService.register(req.body)

    res.status(StatusCodes.CREATED).json({
      message: 'Register success!',
      result
    })
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Register failed!',
      error
    })
  }
}
