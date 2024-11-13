import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { USERS_MESSAGES } from '~/constants/messages'
import { env } from '~/environments/environments'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/Users.request'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
  isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
  isLength: {
    options: { min: 8, max: 50 },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
  isString: { errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING },
  isLength: {
    options: { min: 8, max: 50 },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password)
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      
      return true
    }
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: { options: { strict: true, strictSeparator: true } }
}

const nameSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED },
  isString: { errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING },
  trim: true,
  isLength: {
    options: { min: 6, max: 100 },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_6_TO_100
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING },
  trim: true,
  isLength: {
    options: { min: 1, max: 400 },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400
  }
}

export const loginValidator = validate(
  checkSchema({
    email: {
      notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
      isEmail:  { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
      trim: true,
    },
    password: passwordSchema
  }, ['body'])
)

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: { errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED },
      isString: { errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING },
      trim: true,
      isLength: {
        options: { min: 6, max: 100 },
        errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_6_TO_100
      }
    },
    email: {
      notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
      isEmail:  { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
      trim: true,
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    date_of_birth: dateOfBirthSchema
  }, ['body'])
)

export const accessTokenValidator = validate(
  checkSchema({
    Authorization: {
      notEmpty: { errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED },
      isString: { errorMessage: USERS_MESSAGES.ACCESS_TOKEN_MUST_BE_A_STRING },
      custom: {
        options: async (value: string, { req }) => {
          const access_token = value.split(' ')[1]

          if (!access_token) throw new ErrorWithStatus({
            status: StatusCodes.UNAUTHORIZED,
            message: USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID
          })

          try {
            const decoded_authorization = await verifyToken({
              token: access_token,
              secretOrPublicKey: env.JWT_SECRET_ACCESS_TOKEN
            });
            (req as Request).decoded_authorization = decoded_authorization
          } catch (error) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: StatusCodes.UNAUTHORIZED,
            })
          }

          return true
        }
      }
    }
  }, ['headers'])
)

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      notEmpty: { errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED },
      isString: { errorMessage: USERS_MESSAGES.REFRESH_TOKEN_MUST_BE_A_STRING },
      custom: {
        options: async (value: string, { req }) => {
          try {
            const decoded_refresh_token = await verifyToken({
              token: value,
              secretOrPublicKey: env.JWT_SECRET_REFRESH_TOKEN
            }) as TokenPayload;
            (req as Request).decoded_refresh_token = decoded_refresh_token
            console.log('🚀 ~ decoded_refresh_token:', decoded_refresh_token)
          } catch (error) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: StatusCodes.UNAUTHORIZED,
            })
          }

          return true
        }
      }
    }
  }, ['body'])
)

export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED },
      custom: {
        options: async (value: string, { req }) => {
          try {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: env.JWT_SECRET_EMAIL_VERIFY_TOKEN
            }) as TokenPayload;
            (req as Request).decoded_email_verify_token = decoded_email_verify_token
          } catch (error) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: StatusCodes.UNAUTHORIZED,
            })
          }

          return true
        }
      }
    }
  }, ['query'])
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
      isEmail:  { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
      trim: true,
    },
  })
)

export const forgotPasswordTokenValidator = validate(
  checkSchema({
    forgot_password_token: {
      notEmpty: { errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED },
      custom: {
        options: async (value: string, { req }) => {
          try {
            const decoded_forgot_password_token = await verifyToken({
              token: value,
              secretOrPublicKey: env.JWT_SECRET_FORGOT_PASSWORD_TOKEN
            })
            ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
          } catch (error) {
            throw new ErrorWithStatus({
              status: StatusCodes.UNAUTHORIZED,
              message: capitalize((error as JsonWebTokenError).message),
            })
          }

          return true
        }
      }
    },
  }, ['body'])
)

export const resetPasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
  }, ['body'])
)

export const updateMeValidator = validate(
  checkSchema({
    name: {
      optional: true,
      ...nameSchema,
      notEmpty: undefined
    },
    date_of_birth: {
      optional: true,
      ...dateOfBirthSchema,
      notEmpty: undefined
    },
    bio: {
      optional: true,
      isString: { errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING },
      trim: true,
      isLength: {
        options: { min: 1, max: 200 },
        errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_LESS_THAN_200
      }
    },
    location: {
      optional: true,
      isString: { errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING },
      trim: true,
      isLength: {
        options: { min: 1, max: 200 },
        errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_LESS_THAN_200
      }
    },
    website: {
      optional: true,
      isString: { errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING },
      trim: true,
      isLength: {
        options: { min: 1, max: 200 },
        errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_LESS_THAN_200
      }
    },
    username: {
      optional: true,
      isString: { errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING },
      trim: true,
      isLength: {
        options: { min: 1, max: 50 },
        errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_LESS_THAN_50
      }
    },
    avatar: imageSchema,
    cover_photo: imageSchema
    },
    ['body']
  )
)
