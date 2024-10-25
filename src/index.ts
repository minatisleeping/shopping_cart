import express from 'express'
import userRoute from './routes/users.routers'
import databaseService from './services/database.services'
import { env } from './environments/environments'

const app = express()
const PORT = env.PORT || 3001

databaseService.connect()
app.use(express.json())

app.use('/users', userRoute)

app.listen(PORT, () => {
  console.log(`🚀 Server BE đang chạy trên http://localhost:${PORT}/                🚀 `)
})
