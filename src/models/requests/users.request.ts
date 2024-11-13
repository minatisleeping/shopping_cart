import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { ParsedQs } from 'qs'

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

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordTokenReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface VerifyEmailReqQuery extends ParsedQs {
  email_verify_token: string
}

export interface UpdateMeReqBody {
  name?: string;
  date_of_birth?: string; //vì ngta truyền lên string dạng ISO8601, k phải date
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}

export interface ChangePasswordReqBody {
  old_password: string;
  password: string;
  confirm_password: string;
}
