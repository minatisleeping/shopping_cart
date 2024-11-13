import express, { Request } from 'express'
import { changePasswordController, forgotPasswordController, getMeController, loginController, logoutController, registerController, resendVerifyEmailController, resetPasswordController, updateMeController, verifyEmailTokenController, verifyForgotPasswordTokenController } from '~/controllers/users.controllers'
import { accessTokenValidator, changePasswordValidator, emailVerifyTokenValidator, forgotPasswordTokenValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidator, updateMeValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '../utils/handlers';
import { filterMiddleware } from './common.middleware';
import { UpdateMeReqBody } from '~/models/requests/Users.request';

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

/**
 ** Description: Verify email
 *  Khi user nhấn vào link có trong email của họ thì email_verify_token sẽ được
 * được gửi lên server thông qua req.query 
 *  Route: /verify-email/?email_verify_token={email_verify_token}
 *  Method: GET
 */
userRoute.get('/verify-email', emailVerifyTokenValidator, wrapAsync(verifyEmailTokenController))

/**
 ** Description: Resend verify email
 *  User sẽ dùng chức năng này khi làm mất, lạc mail
 * Flow mình làm: phải đăng nhập thì mới cho verify
 *  Header: { Authorization: Bearer {token} }
 *  Route: /verify-email/?email_verify_token={email_verify_token}
 *  Method: POST
 */
userRoute.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendVerifyEmailController))

/**
 ** Description: Forgot password

 */
userRoute.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/**
 ** Description: Verify forgot password token to reset password
 * Check xem forgot password token còn đúng và còn hiệu lực không ?
 * Method: POST
 * Body: { forgot_password_token: string }
 */
userRoute.post('/verify-forgot-password-token', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordTokenController))

/**
 ** Description: Reset password
 * Check xem forgot password token còn đúng và còn hiệu lực không ?
 * Method: POST
 * Body: { 
 *  password: string,
 *  confirm_password: string,
 *  forgot_password_token: string
 * }
 */
userRoute.post('/reset-password', forgotPasswordTokenValidator, resetPasswordValidator, wrapAsync(resetPasswordController))

/**
 ** Description: Get my profile
 * Method: GET
 * Headers: { Authorization: Bearer {ac} }
 */
userRoute.get('/me', accessTokenValidator, wrapAsync(getMeController))

/**
  Description: Update profile
  Path: '/me'
  Method: PATCH
  Headers: { Authorization: Bearer {ac} }
  Body: {
    name?: string
    date_of_birth?: Date
    bio?: string
    location?: string
    website?: string
    username?: string
    avatar?: string
    cover_photo?: string
*/
userRoute.patch('/me',
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  accessTokenValidator,
  updateMeValidator,
  wrapAsync(updateMeController)
)

/**
 ** Description: Change password
 * Method: PUT
 * Route: /change-password
 * Headers: { Authorization: Bearer {ac} }
 */
userRoute.put(
  '/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

export default userRoute
