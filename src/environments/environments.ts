import 'dotenv/config'

export const env = {
  DB_USERNAME                  : process.env.DB_USERNAME         as string,
  DB_PASSWORD                  : process.env.DB_PASSWORD         as string,
  DB_NAME                      : process.env.DB_NAME             as string,
  DB_USERS_COLLECTION          : process.env.DB_USERS_COLLECTION as string,
  DB_REFRESH_TOKENS_COLLECTION : process.env.DB_REFRESH_TOKENS_COLLECTION as string,

  // JWT
  PASSWORD_SECRET     : process.env.PASSWORD_SECRET     as string,
  JWT_SECRET          : process.env.JWT_SECRET          as string,
  ACCESS_TOKEN_LIFE   : process.env.ACCESS_TOKEN_LIFE   as string,
  REFRESH_TOKEN_LIFE  : process.env.REFRESH_TOKEN_LIFE  as string,

  PORT                : process.env.PORT                as string,
} as const
