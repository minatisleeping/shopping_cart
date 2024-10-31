import { checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema({
    email: {
      notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
      isEmail:  { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
      trim: true,
    },
    password: {
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
    },
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
    password: {
      notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
      isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
      isLength: {
        options: { min: 8, max: 50 },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          returnScore: true,
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
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
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  }, ['body'])
)