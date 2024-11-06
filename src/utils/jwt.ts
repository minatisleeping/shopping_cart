import jwt, {} from 'jsonwebtoken'
import { env } from '~/environments/environments'
import { TokenPayload } from '~/models/requests/Users.request'

// file này lưu hàm dùng để tạo ra 1 token
export const signToken = ({
  payload,
  secretKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object,
  secretKey: string,
  options?: jwt.SignOptions
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretKey, options, (err, token) => {
      if (err) throw reject(err)
      else resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey
}: {
  token: string,
  secretOrPublicKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded as TokenPayload)
    })
  })
}
