import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'
const mediasRoute = Router()

mediasRoute.post('/upload-image', wrapAsync(uploadSingleImageController))

export default mediasRoute
