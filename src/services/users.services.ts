import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/users.request'
import { hashPassword } from '~/utils/crypto'

class UsersService {
  async checkEmailExist(email: string): Promise<boolean> {
    const user = await databaseService.users.findOne({ email })
    return !!user // return Boolean(user)
  }

  async register(payload: RegisterReqBody) {
    return await databaseService.users.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
  }
}

const usersService = new UsersService()
export default usersService
