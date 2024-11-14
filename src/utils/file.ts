import fs from 'fs' //thư viện giúp handle các đường dẫn
import path from 'path'

export const initFolder = () => {
  //lấy đường dẫn từ project đến thư mục uploads
  const uploadsFolderPath = path.resolve('uploads')
  //kiểm tra xem nếu theo đường dẫn trên có đến được folder uploads không
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      //nếu không tồn tại thì tạo ra
      recursive: true //cho phép tạo folder nested vào nhau
    }) //mkdirSync: giúp tạo thư mục
  }
}
