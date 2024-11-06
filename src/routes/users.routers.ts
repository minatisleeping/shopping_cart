import express, { Request } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, loginValidator, refreshTokenValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '../utils/handlers';

const userRoute = express.Router()

/**
 ** Description: Login
 * Route: /login
 * Method: POST
 * Body: {
    email: string,
    password: string
   }
 */
userRoute.post('/login', loginValidator, wrapAsync(loginController))

/**
 ** Description: Register new user
 * Route: /register
 * Method: POST
 * Body: {
    name: string,
    email: string,
    password: string,
    confirm_password: string,
    date_of_birth: string // string nhưng có dạng ISO8601
   }
 */
userRoute.post('/register', registerValidator, wrapAsync(registerController))

/**
 ** Description: Logout user
 * Route: /logout
 * Method: POST
 * Headers: { Authorization: Bearer {token} }
 * Body: { refresh_token: string }
 */
userRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

export default userRoute
