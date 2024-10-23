// middlewares là handler có nhiệm vư kiểm tra các dữ liệu mà user gửi lên thông qua request
// middleware đảm nhận vai trò kiểm trả dữ liệu dủ và đúng kiểu
///import các interface để định dạng kiểu cho para của middlewares
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// 1 req của client gữi lên server sẽ có body(chứa các thứ cẫn gữi)
export const loginValidator = (req: Request, res: Response, next: NextFunction ) => {
  // lấy thử email và password trong req.body mà user gửi
  const { email, password } = req.body

  // kiểm tra xem email và pasword có được gửi lên không
  if (!email || !password) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Missing email or password!'
    })
  } else {
    next()
  }
}

