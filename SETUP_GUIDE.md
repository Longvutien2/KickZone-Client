# HƯỚNG DẪN SETUP DỰ ÁN KICK-ZONE

## Yêu cầu hệ thống

### Phần mềm cần thiết:
- **Node.js**: Phiên bản 18.x trở lên
- **NPM**: Phiên bản 8.x trở lên  
- **Git**: Phiên bản 2.30 trở lên
- **MongoDB**: Tài khoản MongoDB Atlas (miễn phí)
- **Cloudinary**: Tài khoản để upload ảnh (miễn phí)

## Bước 1: Clone project

```bash
git clone https://github.com/your-username/kick-zone.git
cd kick-zone
```

## Bước 2: Setup Backend

### 2.1 Cài đặt dependencies
```bash
cd Server-DoAnTotNghiep
npm install
```

### 2.2 Tạo file .env.local
Tạo file `.env.local` trong thư mục `Server-DoAnTotNghiep` với nội dung:

```env
# MongoDB Connection (Tạo tài khoản MongoDB Atlas miễn phí)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret (có thể giữ nguyên)
JWT_SECRET=123456

# Client URL (URL frontend local)
CLIENT_URL=http://localhost:3000

# SePay Configuration (Tùy chọn - để test thanh toán)
SEPAY_API_KEY=your_sepay_api_key
SEPAY_ACCOUNT_NUMBER=your_account_number

# VNPay Configuration (Tùy chọn - để test thanh toán)
VNP_TMN_CODE=EYD7LZ6F
VNP_HASH_SECRET=HVU42TA5QJ9TH1ZW9UF62FTQGDJI36Y5
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNP_RETURN_URL=http://localhost:8000/payment/result

# Port
PORT=8000
```

### 2.3 Tạo MongoDB Atlas Database
1. Truy cập https://cloud.mongodb.com
2. Đăng ký tài khoản miễn phí
3. Tạo cluster mới (chọn M0 Sandbox - Free)
4. Tạo database user với username/password
5. Whitelist IP: 0.0.0.0/0 (cho phép truy cập từ mọi nơi)
6. Copy connection string và paste vào MONGODB_URI

### 2.4 Chạy Backend
```bash
npm run dev
# Hoặc
npm start
```
Backend sẽ chạy tại: http://localhost:8000

## Bước 3: Setup Frontend

### 3.1 Cài đặt dependencies
```bash
# Quay lại thư mục gốc
cd ..
npm install
```

### 3.2 Tạo file .env.local
Tạo file `.env.local` trong thư mục `kick-zone` với nội dung:

```env
# API Backend URL (URL backend local)
NEXT_PUBLIC_API_BACKEND=http://localhost:8000
NEXT_PUBLIC_API_BACKEND_IO=http://localhost:8000

# Cloudinary Configuration (Tạo tài khoản Cloudinary miễn phí)
NEXT_PUBLIC_CLOUDINARY_API=https://api.cloudinary.com/v1_1/your_cloud_name/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# SePay Configuration (Tùy chọn)
NEXT_PUBLIC_SEPAY_API_KEY=your_sepay_api_key
NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER=your_account_number
```

### 3.3 Tạo Cloudinary Account
1. Truy cập https://cloudinary.com
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard > Settings > Upload
4. Tạo Upload Preset:
   - Preset name: `your_upload_preset`
   - Signing Mode: Unsigned
5. Copy Cloud Name và Upload Preset vào .env.local

### 3.4 Chạy Frontend
```bash
npm run dev
```
Frontend sẽ chạy tại: http://localhost:3000

## Bước 4: Tạo dữ liệu mẫu

### 4.1 Tạo tài khoản Manager
1. Truy cập http://localhost:3000/auth/register
2. Đăng ký với thông tin:
   - Email: manager@test.com
   - Password: 123456
   - Name: Manager Test

### 4.2 Cập nhật role thành Manager
Vào MongoDB Atlas > Collections > users > Tìm user vừa tạo > Edit:
```json
{
  "role": 1
}
```

### 4.3 Tạo sân bóng
1. Đăng nhập với tài khoản manager
2. Vào /manager/myField/add
3. Tạo sân bóng với thông tin đầy đủ

## Bước 5: Test chức năng

### 5.1 Kiểm tra Backend
- Truy cập: http://localhost:8000/home
- Kết quả: Hiển thị "Trang chủ"

### 5.2 Kiểm tra Frontend
- Truy cập: http://localhost:3000
- Kết quả: Hiển thị trang đăng nhập

### 5.3 Test các chức năng chính
- ✅ Đăng ký/Đăng nhập
- ✅ Tạo sân bóng (Manager)
- ✅ Đặt sân (User)
- ✅ Upload ảnh
- ✅ Thông báo real-time

## Lỗi thường gặp và cách khắc phục

### 1. Lỗi kết nối MongoDB
```
Error: MongoNetworkError
```
**Khắc phục**: Kiểm tra MONGODB_URI và whitelist IP

### 2. Lỗi CORS
```
Access to fetch blocked by CORS policy
```
**Khắc phục**: Kiểm tra CLIENT_URL trong backend .env.local

### 3. Lỗi upload ảnh
```
Upload failed
```
**Khắc phục**: Kiểm tra Cloudinary config và upload preset

### 4. Lỗi port đã được sử dụng
```
Port 3000 is already in use
```
**Khắc phục**: 
```bash
# Kill process sử dụng port
npx kill-port 3000
# Hoặc sử dụng port khác
npm run dev -- -p 3001
```

## Cấu trúc thư mục

```
kick-zone/
├── Server-DoAnTotNghiep/     # Backend (Node.js + Express)
│   ├── .env.local            # Config backend
│   ├── app.js               # Entry point
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   └── controllers/         # Business logic
├── app/                     # Frontend (Next.js)
├── components/              # React components
├── features/                # Redux slices
├── .env.local              # Config frontend
└── package.json            # Dependencies
```

## Tài khoản test mặc định

Sau khi setup xong, bạn có thể tạo các tài khoản test:

**Manager:**
- Email: manager@test.com
- Password: 123456
- Role: 1 (Manager)

**User:**
- Email: user@test.com  
- Password: 123456
- Role: 0 (User)

## Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình setup, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.
