import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/Users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
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

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )

    const user_id = result.insertedId.toString()
    const tokens =  await this.signTokens(user_id)

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
}

const usersService = new UsersService()
export default usersService
