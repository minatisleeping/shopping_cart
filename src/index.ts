import express from 'express'
import userRoute from './routes/users.routers'
import databaseService from './services/database.services'
import { env } from './environments/environments'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import mediasRoute from './routes/medias.routes'
import { initFolder } from './utils/file'

const app = express()
const PORT = env.PORT || 3001

initFolder()
databaseService.connect()
app.use(express.json())

app.use('/users', userRoute)
app.use('/medias', mediasRoute)
 
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server BE đang chạy trên http://localhost:${PORT}/                🚀 `)
})
