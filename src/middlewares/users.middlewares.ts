import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { validate } from '~/utils/validation'

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

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: { errorMessage: 'Name is required!' },
      isString: { errorMessage: 'Name must be a string!' },
      trim: true,
      isLength: {
        options: { min: 6, max: 100 },
        errorMessage: 'Name must be between 6 and 100 characters!'
      }
    },
    email: {
      notEmpty: { errorMessage: 'Email is required!' },
      isEmail:  { errorMessage: 'Email is invalid!' },
      trim: true,
    },
    password: {
      notEmpty: { errorMessage: 'Password is required!' },
      isString: { errorMessage: 'Password must be a string!' },
      isLength: {
        options: { min: 8, max: 50 },
        errorMessage: 'Password must be between 6 and 100 characters!'
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          returnScore: true,
        },
        errorMessage: 'Password is too weak hehe!'
      }
    },
    confirm_password: {
      notEmpty: { errorMessage: 'Confirm_password is required!' },
      isString: { errorMessage: 'Confirm_password must be a string!' },
      isLength: {
        options: { min: 8, max: 50 },
        errorMessage: 'Confirm_password must be between 6 and 100 characters!'
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          returnScore: true,
        },
        errorMessage: 'Confirm_password is too weak hehe!'
      },
      custom: {
        options: (value, { req }) => { // value chỗ này là confirm_password lun nha Việt Đức =)))
          if (value !== req.body.password) throw new Error('Confirm_password does not match password!')
          
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: { // kiểm tra xem ngày tháng năm có đúng định dạng không
        options: {
          strict: true, // strict = true thì phải đúng định dạng ngày tháng năm
          strictSeparator: true // strictSeparator = true thì phải có T giữa ngày và giờ
        }
      }
    }
  }, ['body']) // ['body']: ưu tiên check reqBody trước => tối ưu hơn vì mình truyền data qua body
)