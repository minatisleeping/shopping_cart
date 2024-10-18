import express from 'express'
import userRoute from './users.routers'

const app = express()
const PORT = 3000

// cho server kết nối userRoute
app.use('/users', userRoute)

app.listen(PORT, () => {
  console.log(`Server BE đang chạy trên http://localhost:${PORT}/`)
})
