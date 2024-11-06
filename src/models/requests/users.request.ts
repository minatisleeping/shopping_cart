// file lưu các định nghĩa về request

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

// kiểu register thì ngta phải gửi lên cái gì(giống DTO)
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface LogoutReqBody {
  refresh_token: string
}
