import express from 'express'

// tạo userRoute
const userRoute = express.Router()

// cho userRoute thêm 1 middleware
userRoute.use(
  (req, res, next) => {
    console.log('Time' + Date.now())
    return next()
    // res.status(400).json({ message: 'Not allowed!' })
    // console.log('Ahihi')
  },
  (req, res, next) => {
    console.log('Time 2' + Date.now())
    return next()
  },
)

userRoute.get('/get-me', (req, res) => {
  res.json({
    data: {
      fname: 'Điệp',
      yob: 1999,
    }
  })
})

export default userRoute
