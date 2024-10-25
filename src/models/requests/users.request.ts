// file lưu các định nghĩa về request

// kiểu register thì ngta phải gửi lên cái gì(giống DTO)
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}
