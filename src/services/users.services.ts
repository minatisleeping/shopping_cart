import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { env } from '~/environments/environments'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import { USERS_MESSAGES } from '~/constants/messages'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: env.ACCESS_TOKEN_LIFE }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: env.REFRESH_TOKEN_LIFE }
    })
  }

  private async signTokens(user_id: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return { accessToken, refreshToken }
  }

  async checkEmailExist(email: string): Promise<boolean> {
    const user = await databaseService.users.findOne({ email })
    return !!user
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

    return await this.signTokens(user_id)
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

    return await this.signTokens(user_id)
  }
}

const usersService = new UsersService()
export default usersService
