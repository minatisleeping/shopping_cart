import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '../utils/handlers';

const userRoute = express.Router()

userRoute.post('/login', loginValidator, loginController)

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



export default userRoute
