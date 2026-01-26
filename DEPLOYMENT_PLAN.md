# Kế Hoạch Triển Khai (Deploy) Website Trại Gà & Tên Miền

Dưới đây là phương án tối ưu nhất để đưa website lên internet hoàn toàn **MIỄN PHÍ** và hoạt động ổn định trong năm 2024.

## 1. Tổng Quan Kiến Trúc

*   **Database (Cơ sở dữ liệu):** Sử dụng **MongoDB Atlas** (Gói M0 Sandbox - Miễn phí vĩnh viễn, 512MB lưu trữ, đủ cho ~5000 chiến kê).
*   **Backend & Frontend (Server):** Sử dụng **Render.com** (Gói Free).
    *   Lý do: Hỗ trợ Node.js miễn phí, dễ sử dụng, tự động deploy từ GitHub.
    *   Nhược điểm: Server sẽ "ngủ" nếu không ai truy cập trong 15 phút (mất khoảng 30s để khởi động lại khi có khách đầu tiên vào).
*   **Lưu trữ hình ảnh:** Sử dụng **Cloudinary** (Gói Free).
    *   *Lưu ý quan trọng:* Các server miễn phí như Render không cho phép lưu file trực tiếp trên ổ cứng (ảnh upload sẽ bị mất khi server khởi động lại). Chúng ta CẦN chuyển sang dùng Cloudinary để lưu ảnh bền vững.
*   **Tên miền (Domain):** Sử dụng Subdomain miễn phí của Render hoặc Vercel.

---

## 2. Chi Tiết Các Bước Thực Hiện

### Bước 1: Chuẩn Bị Database (MongoDB Atlas)
1.  Đăng ký tài khoản tại [mongodb.com](https://www.mongodb.com/).
2.  Tạo một **Cluster** mới (chọn gói **M0 FREE**).
3.  Tạo **Database User** (Username/Password).
4.  Trong phần **Network Access**, chọn "Allow Access from Anywhere" (0.0.0.0/0) để server Render có thể kết nối.
5.  Lấy chuỗi kết nối (Connection String): `mongodb+srv://<username>:<password>@cluster0...`

### Bước 2: Chuẩn Bị Lưu Trữ Ảnh (Cloudinary)
1.  Đăng ký tài khoản tại [cloudinary.com](https://cloudinary.com/).
2.  Lấy các thông tin: `Cloud Name`, `API Key`, `API Secret`.
3.  *Cần sửa code backend*: Chuyển code upload ảnh từ lưu file local (`multer` lưu ổ cứng) sang lưu lên Cloudinary (`multer-storage-cloudinary`). Tôi sẽ hỗ trợ bạn sửa phần này.

### Bước 3: Đưa Code Lên GitHub
1.  Tạo tài khoản GitHub (nếu chưa có).
2.  Tạo một **Repository** mới (chế độ Public hoặc Private).
3.  Upload toàn bộ thư mục code hiện tại lên Repository đó.

### Bước 4: Deploy Lên Render
1.  Đăng ký tài khoản [render.com](https://render.com/) (Login bằng GitHub).
2.  Chọn **New +** -> **Web Service**.
3.  Kết nối với Repository GitHub vừa tạo.
4.  Điền thông tin:
    *   **Name**: `trai-ga-thuan-nguyen`
    *   **Runtime**: Node
    *   **Build Command**: `npm install --prefix backend` (để cài đặt thư viện trong thư mục backend)
    *   **Start Command**: `node backend/server.js`
5.  Vào phần **Environment Variables**, thêm các biến môi trường:
    *   `MONGO_URI`: (Chuỗi kết nối lấy ở Bước 1)
    *   `CLOUDINARY_CLOUD_NAME`: (Lấy ở Bước 2)
    *   `CLOUDINARY_API_KEY`: (Lấy ở Bước 2)
    *   `CLOUDINARY_API_SECRET`: (Lấy ở Bước 2)
6.  Bấm **Deploy**.

---

## 3. Về Vấn Đề Tên Miền (Domain)

Hiện tại (2024), các nhà cung cấp tên miền miễn phí như Freenom (.tk, .ml, .ga...) **đã ngừng hoạt động** hoặc rất thiếu ổn định.

**Các lựa chọn hiện có:**

1.  **Sử dụng Subdomain của Render (Khuyên dùng - Miễn phí)**
    *   Địa chỉ web sẽ là: `https://trai-ga-thuan-nguyen.onrender.com`
    *   **Ưu điểm**: Có sẵn HTTPS (ổ khóa bảo mật), ổn định, không lo hết hạn.
    *   **Nhược điểm**: Tên hơi dài và có đuôi `.onrender.com`.

2.  **Sử dụng tên miền rút gọn (Như bit.ly - Không khuyến khích cho web chính)**
    *   Chỉ dùng để chia sẻ link, không thay thế được tên miền chính.

3.  **Mua tên miền giá rẻ (Khuyên dùng nếu làm lâu dài)**
    *   Bạn có thể mua tên miền `.com` (khoảng 250k/năm) hoặc `.online`, `.store` (năm đầu thường chỉ 20k - 50k).
    *   Mua tại: Tenten.vn, Matbao, NhanHoa...
    *   Sau khi mua, trỏ DNS về Render là xong.

## 4. Việc Cần Làm Ngay (Action Items)

Để tiến hành deploy, chúng ta cần thực hiện các việc sau:

1.  [x] Code đã chạy ổn ở Local.
2.  [ ] **Sửa code Upload ảnh**: Chuyển sang Cloudinary (Bắt buộc nếu deploy free).
3.  [ ] **Đẩy code lên GitHub**.
4.  [ ] **Cấu hình trên Render**.

Bạn có muốn tôi bắt đầu thực hiện việc **Sửa code Upload ảnh sang Cloudinary** ngay bây giờ không? Đây là bước quan trọng nhất để web chạy online được.
