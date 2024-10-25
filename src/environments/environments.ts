import 'dotenv/config'

export const env = {
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_USERS_COLLECTION: process.env.DB_USERS_COLLECTION,

  PASSWORD_SECRET: process.env.PASSWORD_SECRET,

  PORT: process.env.PORT,
} as const
