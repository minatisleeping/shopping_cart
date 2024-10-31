import jwt from 'jsonwebtoken'
import { env } from '~/environments/environments'

// file này lưu hàm dùng để tạo ra 1 token
export const signToken = ({
  payload,
  secretKey = env.JWT_SECRET,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object,
  secretKey?: string,
  options?: jwt.SignOptions
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretKey, options, (err, token) => {
      if (err) throw reject(err)
      else resolve(token as string)
    })
  })
}
