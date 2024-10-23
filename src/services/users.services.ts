import User from '~/models/schemas/User.schema'
import databaseService from './database.services'

class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload

    return await databaseService.users.insertOne(new User({ email, password }))
  }
}

const usersService = new UsersService()
export default usersService
