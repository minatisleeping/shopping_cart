import { createHash } from 'crypto'
import { env } from '~/environments/environments'

function sha256(data: string) {
  return createHash('sha256').update(data).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + env.PASSWORD_SECRET)
}
