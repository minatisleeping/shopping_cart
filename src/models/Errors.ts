import { StatusCodes } from 'http-status-codes'
import { USERS_MESSAGES } from '~/constants/messages'

// file này lưu định nghĩa của các loại lỗi 
export class ErrorWithStatus {
  status: number
  message: string

  constructor({ status, message }: { status: number, message: string }) {
    this.status = status
    this.message = message
  }
}

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any //này nghĩa ra ngoài ra muốn thêm vào gì thì thêm
  }
>

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  //truyển message mặt định
  constructor({
    message = USERS_MESSAGES.VALIDATION_ERROR,
    errors
  }: {
    message?: string
    errors: ErrorsType
  }) {
    super({ message, status: StatusCodes.UNPROCESSABLE_ENTITY }) //tạo lỗi có status 422
    this.errors = errors
  }
}

