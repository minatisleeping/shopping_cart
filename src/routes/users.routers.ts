import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'

// tạo userRoute
const userRoute = express.Router()

// http://localhost:3000/users/login
userRoute.post('/login', loginValidator, loginController)

// http://localhost:3000/users/register
userRoute.post('/register', registerController)


export default userRoute
