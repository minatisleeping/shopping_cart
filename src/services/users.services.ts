import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/Users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { env } from '~/environments/environments'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import { USERS_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema.ts'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      secretKey: env.JWT_SECRET_ACCESS_TOKEN,
      options: { expiresIn: env.ACCESS_TOKEN_LIFE }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      secretKey: env.JWT_SECRET_REFRESH_TOKEN,
      options: { expiresIn: env.REFRESH_TOKEN_LIFE }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      secretKey: env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: { expiresIn: env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      secretKey: env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: { expiresIn: env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }

  private async signTokens(user_id: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return { access_token, refresh_token }
  }

  async checkEmailExist(email: string): Promise<boolean> {
    const user = await databaseService.users.findOne({ email })
    return !!user
  }

  async checkRefreshToken({ user_id, refresh_token }: { user_id: string, refresh_token: string }) {
    const refreshToken = await databaseService.refreshTokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })

    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: StatusCodes.UNAUTHORIZED,
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    } 

    return refreshToken
  }

  async checkEmailVerifyToken({ user_id, email_verify_token }: { user_id: string, email_verify_token: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      email_verify_token
    })

    if (!user) {
      throw new ErrorWithStatus({
        status: StatusCodes.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    return user
  }

  async checkEmailVerified(user_id: string): Promise<boolean> {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    return user?.verify === UserVerifyStatus.Verified
  }

  async findUserById(user_id: string) {
    return await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  }

  async findUserByEmail(email: string) {
    return await databaseService.users.findOne({ email })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    
    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    
    const tokens =  await this.signTokens(user_id.toString())
    console.log(`
      🚀 ~ Nội dung Email xác thực bao gôm:
        http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
    `)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: tokens.refresh_token
      })
    )

    return tokens
  }

  async login({ email, password }: { email: string, password: string }) {
    const user = await databaseService.users.findOne({
      email,
      password: hashPassword(password)
    })

    if (!user) {
      throw new ErrorWithStatus({
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INVALID
      })
    }
    
    const user_id = user._id.toString()

    const tokens =  await this.signTokens(user_id)

    // lưu refresh token vào db
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: tokens.refresh_token
      })
    )

    return tokens
  }

  async logout(refresh_token: string) {
    return await databaseService.refreshTokens.deleteOne({ token: refresh_token })
  }

  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      [{
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified,
          updated_at: '$$NOW'
        }
      }],
    )

    const tokens =  await this.signTokens(user_id)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: tokens.refresh_token
      })
    )

    return tokens
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      [{ $set: { email_verify_token, updated_at: '$$NOW' } }],
    )

    console.log(`
      🚀 ~ Nội dung Email xác thực bao gôm:
        http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
    `)
  }

  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })
    
    if (user) {
      const user_id = user._id
      const forgot_password_token = await this.signForgotPasswordToken(user_id.toString())

      await databaseService.users.updateOne(
        { _id: user_id },
        [{ $set: { forgot_password_token, updated_at: '$$NOW' } }],
      )

      console.log(`🚀 ~ Mô phỏng gửi link qua mail để đổi mật khẩu: http://localhost:8000/reset-password/?forgot_password_token=${forgot_password_token}`)
    }
  }

  async verifyForgotPasswordToken({ user_id, forgot_password_token }: { user_id: string, forgot_password_token: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      forgot_password_token
    })

    if (!user) {
      throw new ErrorWithStatus({
        status: StatusCodes.UNAUTHORIZED,
        message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
      })
    }

    return user
  }

  async resetPassword({ user_id, password }: { user_id: string, password: string }) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      [{ $set: {
        password: hashPassword(password),
        forgot_password_token: '',
        updated_at: '$$NOW'
      } }],
    )
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    if (!user) {
      throw new ErrorWithStatus({
        status: StatusCodes.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    return user
  }

  async updateMe({ user_id, payload }: { user_id: string, payload: UpdateMeReqBody }) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload

    if (_payload.username) {
      const user = await databaseService.users.findOne({ username: _payload.username })

      if (user) {
        throw new ErrorWithStatus({
          status: StatusCodes.UNPROCESSABLE_ENTITY,
          message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS
        })
      }
    }

    return await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [{ $set: {
        ..._payload,
        updated_at: '$$NOW'
      } }],
      { returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }

  async changePassword({ user_id, old_password, password }: { user_id: string, old_password: string, password: string }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      password: hashPassword(old_password)
    })

    if (!user) {
      throw new ErrorWithStatus({
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS
      })
    }

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      [{ $set: {
        password: hashPassword(password),
        updated_at: '$$NOW'
      } }]
    )
  }
}

const usersService = new UsersService()
export default usersService
