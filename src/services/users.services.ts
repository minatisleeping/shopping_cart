import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/users.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { env } from '~/environments/environments'

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
}

const usersService = new UsersService()
export default usersService
