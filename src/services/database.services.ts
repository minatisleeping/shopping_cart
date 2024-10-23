
import { Collection, Db, MongoClient } from 'mongodb'
import { env } from '~/environments/environments'
import User from '~/models/schemas/User.schema'


const uri = `mongodb+srv://${env.DB_USERNAME}:${env.DB_PASSWORD}@shoppingcartprojectclus.az1dm.mongodb.net/?retryWrites=true&w=majority&appName=shoppingCartProjectCluster`

class DatabaseServices {
  private client: MongoClient
  private db: Db
  
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${env.DB_NAME}`)
  }
  
  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log('🚀 ~ Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      console.log('🚀 ~ error:', error)
      throw error
    }
  }

  get users(): Collection<User> { //accessor property
    return this.db.collection(env.DB_USERS_COLLECTION as string)
    //vào db lấy ra collection users, và vì chuỗi truyền vào có thể là undefined nên mình phải rằng buộc nó là string 'thử xóa as string để thấy lỗi'
  }
}

const databaseService = new DatabaseServices()
export default databaseService
