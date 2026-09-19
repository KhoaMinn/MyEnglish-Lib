# HƯỚNG DẪN THIẾT KẾ CHUẨN PHONG CÁCH MOCHI IELTS (DESIGN SYSTEM & AI PROMPT GUIDE)

> **Mục đích tài liệu:** Tài liệu này chuẩn hóa toàn bộ Design System, bảng màu, typography, hiệu ứng 3D tactile buttons, layout và quy tắc giao diện của website [Mochi IELTS](https://ielts.mochidemy.com/). Bất kỳ AI hoặc lập trình viên frontend nào khi thiết kế thêm trang mới (landing page, study dashboard, checkout, test page...) đều phải tuân thủ nghiêm ngặt để đạt độ tương đồng 100% về mặt thị giác.

---

## 1. TỔNG QUAN PHONG CÁCH (VISUAL IDENTITY & TONE)

- **Phong cách chủ đạo:** *Playful EdTech, Gamified, Friendly, Tactile & Approachable*.
- **Cảm giác mang lại:** Tươi sáng, đáng yêu, thân thiện, tạo cảm giác học tập không áp lực nhưng vẫn hiện đại và đáng tin cậy.
- **Điểm nhận diện đặc trưng:**
  - **3D Pressable Buttons:** Nút bấm dạng viên thuốc (pill-shape) có đổ bóng cứng 4px ở đáy tạo hiệu ứng xúc giác (tactile 3D click/press) tương tự phong cách Duolingo.
  - **Quicksand Rounded Font:** Toàn bộ trang web dùng font chữ tròn trịa Quicksand.
  - **Pill Bars Tiêu Đề:** Mỗi tiêu đề mục lớn đều được kẹp giữa 2 thanh bar bo tròn màu xanh dương `#4786E3`.
  - **Bố cục so le (Z-pattern / Alternating layout):** Các khối nội dung tính năng đổi hướng xen kẽ giữa ảnh và chữ.
  - **Mascot & Minh họa đáng yêu:** Hình tượng Mochi vàng (chú sóc/bé mochi tròn màu vàng), mây uốn lượn mềm mại, ngôi sao vàng lấp lánh.

---

## 2. BẢNG MÀU CHUẨN (COLOR PALETTE TOKENS)

Tất cả màu sắc dưới đây được trích xuất trực tiếp từ mã nguồn CSS của website Mochi IELTS:

| Tên Token | Mã HEX | Mã RGB | Vai trò & Ứng dụng |
| :--- | :--- | :--- | :--- |
| **`--primary-blue`** | `#4786E3` | `rgb(71, 134, 227)` | **Màu thương hiệu chính**: Header navbar, nút CTA chính, thanh line tiêu đề, tiêu đề câu hỏi, nền Footer. |
| **`--primary-shadow-blue`** | `#0950AE` | `rgb(9, 80, 174)` | **Đổ bóng 3D nút chính**: Dùng cho `box-shadow: 0 4px 0 0 #0950AE` của nút bấm chính. |
| **`--secondary-blue`** | `#507FBD` | `rgb(80, 127, 189)` | **Màu phụ / Headline**: Dùng cho H1 hero banner, đổ bóng nút phụ màu trắng trong header. |
| **`--action-blue`** | `#2C9DFF` | `rgb(44, 157, 255)` | **Màu chữ nút phụ**: Màu chữ nút "Đăng nhập" trên header. |
| **`--bg-light-blue`** | `#F1F7FF` | `rgb(241, 247, 255)` | **Màu nền section phụ**: Dùng làm nền cho khối FAQ, bảng thông tin, card nổi bật. |
| **`--bg-outer-frame`** | `#E1E6EC` | `rgb(225, 230, 236)` | **Màu nền khung ngoài**: Dùng cho phần backdrop bao quanh màn hình desktop. |
| **`--white`** | `#FFFFFF` | `rgb(255, 255, 255)` | **Màu nền chính**: Nền card, nền trang chính, chữ trên nền xanh. |
| **`--text-primary`** | `#000000` / `#0F1114` | `rgb(15, 17, 20)` | **Màu chữ văn bản**: Nội dung mô tả, câu trả lời, body text. |
| **`--accent-yellow`** | `#FFCB08` | `rgb(255, 203, 8)` | **Màu điểm nhấn (Mascot & Icon)**: Ngôi sao, chấm tròn phân trang active, huy hiệu thành tích. |
| **`--badge-red`** | `#FFB2B2` | `rgb(255, 178, 178)` | **Highlight đỏ nhạt**: Dùng đánh dấu từ khóa hoặc tag khuyến mãi. |

### Khai báo CSS Variables:
```css
:root {
  --primary-blue: #4786e3;
  --primary-shadow-blue: #0950ae;
  --secondary-blue: #507fbd;
  --action-blue: #2c9dff;
  --bg-light-blue: #f1f7ff;
  --bg-outer-frame: #e1e6ec;
  --white: #ffffff;
  --text-primary: #0f1114;
  --text-body: #000000;
  --accent-yellow: #ffcb08;
  --radius-pill: 16px;
  --radius-full: 9999px;
  --font-family-base: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

---

## 3. TYPOGRAPHY (HỆ THỐNG PHÔNG CHỮ)

### Quy định phông chữ:
- **Font-family bắt buộc:** `'Quicksand', sans-serif` (Google Font).
- **Import font:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Phân cấp cỡ chữ và trọng số:
- **Hero Title (H1):**
  - Desktop: `font-size: 32px; font-weight: 700; line-height: 130%; color: #507FBD;`
  - Mobile: `font-size: 20px; font-weight: 700; line-height: 130%; text-align: center;`
- **Section Heading (H2):**
  - Desktop: `font-size: 24px; font-weight: 700; line-height: 100%; color: #0F1114;` (hoặc `#4786E3`)
  - Mobile: `font-size: 18px; line-height: 130%;`
- **Sub-heading / Feature Title / FAQ Question (H3):**
  - Desktop: `font-size: 20px; font-weight: 700; line-height: 130%; color: #4786E3;`
  - Mobile: `font-size: 16px;`
- **Body / Paragraph:**
  - Desktop: `font-size: 16px; font-weight: 500; line-height: 150%; color: #000000;`
  - Mobile: `font-size: 14px; line-height: 150%;`
- **Header Text (cta info):**
  - `font-size: 16px; font-weight: 600; color: #FFFFFF;`
- **Button Text:**
  - Primary CTA: `font-size: 18px; font-weight: 700;` (Mobile: `16px`)
  - Secondary Header Button: `font-size: 16px; font-weight: 700;`

---

## 4. CÁC COMPONENT CHUẨN CỦA MOCHI IELTS

### 4.1. Nút Bấm 3D Đặc Trưng (Tactile 3D Buttons)

#### A. Nút CTA Chính (Primary Blue 3D Button) - "Bắt đầu học", "Học thử ngay"
```css
.mochi-btn-primary {
  display: inline-block;
  font-family: 'Quicksand', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 38px;
  color: #ffffff;
  background-color: #4786e3;
  padding: 10px 50px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  /* Đổ bóng 3D đáy */
  box-shadow: 0 4px 0 0 #0950ae;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.2s ease;
  user-select: none;
}

.mochi-btn-primary:hover {
  opacity: 0.9;
}

/* Hiệu ứng khi bấm lún xuống */
.mochi-btn-primary:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 0 #0950ae;
}
```

#### B. Nút Phụ Màu Trắng trên Header (White 3D Button) - "Đăng nhập"
```css
.mochi-btn-secondary {
  display: inline-block;
  font-family: 'Quicksand', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #2c9dff;
  background-color: #ffffff;
  padding: 13px 25px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 4px 0 0 #507fbd;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.2s ease;
  user-select: none;
}

.mochi-btn-secondary:hover {
  opacity: 0.9;
}

.mochi-btn-secondary:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 0 #507fbd;
}
```

---

### 4.2. Tiêu Đề Có Hai Thanh Bo Tròn (Pill-Bar Section Title)

Đặc điểm nhận diện lớn nhất của các section:
```html
<div class="mochi-section-header">
  <span class="pill-bar"></span>
  <h2>Mochi IELTS giúp bạn học IELTS <br> hiệu quả như thế nào?</h2>
  <span class="pill-bar"></span>
</div>
```

```css
.mochi-section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  font-size: 24px;
  font-weight: 700;
  line-height: 120%;
  color: #0f1114;
  text-align: center;
}

.mochi-section-header .pill-bar {
  display: block;
  width: 95px;
  height: 10px;
  background-color: #4786e3;
  border-radius: 5px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .mochi-section-header {
    font-size: 18px;
    gap: 15px;
  }
  .mochi-section-header .pill-bar {
    width: 35px;
    height: 8px;
  }
}
```

---

### 4.3. Thanh Điều Hướng Trên Cùng (Header Navigation Bar)

- Chiều cao / padding: `padding: 21px 150px` (Desktop) / `padding: 10px 20px` (Mobile).
- Bo góc phía dưới: `border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;`
- Nền xanh: `#4786E3`.
- Logo nằm bên trái, CTA bên phải gồm dòng chữ màu trắng "Bạn đã có tài khoản?" và nút bấm trắng "Đăng nhập".

```html
<header class="mochi-header">
  <div class="mochi-header-logo">
    <img src="logo.png" alt="Mochi IELTS Logo" />
  </div>
  <div class="mochi-header-cta">
    <span class="cta-text">Bạn đã có tài khoản?</span>
    <a href="/login" class="mochi-btn-secondary">Đăng nhập</a>
  </div>
</header>
```

```css
.mochi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #4786e3;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  padding: 21px 150px;
}

.mochi-header .cta-text {
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
}

.mochi-header-cta {
  display: flex;
  align-items: center;
  gap: 20px;
}

@media (max-width: 768px) {
  .mochi-header {
    padding: 10px 20px;
  }
  .mochi-header .cta-text {
    display: none;
  }
}
```

---

### 4.4. Hero Banner Section

- **Bối cảnh:** Nền kem sáng nhạt kết hợp các hình khối mây uốn lượn mềm mại (`background-size: cover; background-position: center;`).
- **Hình ảnh minh họa:** Chú Mochi vàng đội nón tốt nghiệp hoặc ngồi trên quyển sách mở, tay cầm bút chì lớn, các ngôi sao vàng lấp lánh xung quanh.
- **Nội dung:** Logo phụ `Mochi IELTS`, H1: `Đạt 6.5+ IELTS sau 1 khóa học với Adaptive Learning`, Nút CTA: `Bắt đầu học`.

---

### 4.5. Feature Cards (Bố Cục So Le Z-Pattern)

- Mỗi dòng gồm 1 hình minh họa tính năng và 1 cột văn bản.
- **Quy tắc so le:**
  - Dòng chẵn (thứ 2): Ảnh bên trái, Chữ bên phải (căn lề trái).
  - Dòng lẻ (thứ 1, thứ 3): Chữ bên trái (căn lề phải), Ảnh bên phải (`flex-direction: row-reverse`).
- **Mobile:** Tự động chuyển thành 1 cột dọc (`flex-direction: column; text-align: center;`).

```css
.feature-card {
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 855px;
  margin: 0 auto;
}

.feature-card:nth-child(odd) {
  flex-direction: row-reverse;
}

.feature-card:nth-child(odd) .feature-text {
  text-align: right;
  align-items: flex-end;
}

.feature-card:nth-child(even) .feature-text {
  text-align: left;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .feature-card,
  .feature-card:nth-child(odd) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 0 20px;
  }
  .feature-card .feature-text,
  .feature-card:nth-child(odd) .feature-text {
    text-align: center;
    align-items: center;
  }
}
```

---

### 4.6. FAQ Section (Hỏi Đáp)

- **Màu nền:** Xanh dương cực nhạt `#F1F7FF` (`--bg-light-blue`).
- **Bố cục lưới:** Grid 2 cột trên desktop (`grid-template-columns: repeat(2, 1fr); gap: 40px;`), chuyển thành 1 cột trên mobile.
- **Tiêu đề câu hỏi (H3):** Màu xanh `#4786E3`, `font-size: 20px`, `font-weight: 700`.
- **Nội dung câu trả lời:** Màu đen `#000000`, `font-size: 16px`, `font-weight: 500`, khoảng cách dòng thoáng (`line-height: 150%`).
- **Cuối khối FAQ:** Nút CTA "Học thử ngay" kẹp giữa với bóng 3D.

---

### 4.7. Download App Section

- Giới thiệu ứng dụng Mochi IELTS trên thiết bị di động.
- Nền có hoa văn mây uốn lượn.
- Phía trái: Tiêu đề xanh `#4786E3`, mô tả, và 2 nút tải ứng dụng (App Store & Google Play badge).
- Phía phải: Mockup điện thoại smartphone hiển thị app Mochi.

---

### 4.8. Footer (Chân Trang)

- **Màu nền:** `#4786E3` đồng bộ với Header.
- **Màu chữ & liên kết:** Trắng `#FFFFFF`.
- **Bố cục:** Grid 3 cột (`repeat(3, 1fr)`):
  1. Logo Mochi IELTS trắng + Khối liên hệ (Email: `mochidemy@gmail.com`, Fanpage: `Nhắn tin cho Mochi IELTS`).
  2. Câu hỏi thường gặp (Các đường link hữu ích).
  3. Cộng đồng (Các nhóm Facebook tự học).
- Hiệu ứng liên kết: Khi hover hiện gạch chân `text-decoration: underline`.

---

## 5. BẢNG CHECKLIST BẮT BUỘC ĐỐI VỚI AI THIẾT KẾ

Mọi AI khi sinh code hoặc thiết kế giao diện Mochi IELTS phải kiểm tra checklist sau:

- [ ] **Font chữ:** Phải là `Quicksand` (Google Font), tuyệt đối không dùng phông mặc định (Arial, Times New Roman, Roboto, Inter).
- [ ] **Nút bấm 3D:** Mọi nút bấm quan trọng (CTA) phải có `border-radius: 16px` và `box-shadow: 0 4px 0 0 [màu tối hơn]`. Khi click `:active` phải có `transform: translateY(4px); box-shadow: none;`.
- [ ] **Màu xanh nhận diện:** Nền Header, Footer và nút chính phải dùng đúng mã `#4786E3`. Bóng nút chính phải là `#0950AE`.
- [ ] **Bo góc tròn trịa:** Tối thiểu bo góc `16px` cho header đáy, card và button. Không dùng góc nhọn `0px` hay góc bo quá vuông vức.
- [ ] **Thanh Pill Bar kẹp tiêu đề:** Các tiêu đề section chính phải có 2 thanh bo tròn màu xanh hai bên (`width: 95px; height: 10px; background: #4786E3; border-radius: 5px;`).
- [ ] **Hiệu ứng hover:** Hover nút bấm chỉ cần giảm nhẹ opacity (`opacity: 0.9` hoặc `0.85`), không đổi màu đột ngột gây gãy thẩm mỹ.
- [ ] **Ngôn ngữ hình ảnh:** Minh họa phải phong cách 2D/3D cartoon đáng yêu, tròn trịa, có nhân vật hạt dẻ/mochi vàng, mây trời mềm mại. Không dùng ảnh chụp người lớn phong cách doanh nghiệp cứng nhắc (corporate/serious).

---

## 6. PROMPT MẪU ĐỂ COPY-PASTE CHO CÁC AI TIẾP THEO

Khi bạn yêu cầu Claude, ChatGPT, v0, Gemini hoặc Antigravity thiết kế bất kỳ màn hình mới nào, hãy dán kèm đoạn System Prompt sau:

```text
Bạn là chuyên gia thiết kế UI/UX và lập trình viên Frontend cao cấp.
Hãy thiết kế giao diện tuân thủ CHÍNH XÁC 100% phong cách thiết kế của "Mochi IELTS" (ielts.mochidemy.com) với các quy tắc sau:

1. TYPOGRAPHY:
- Bắt buộc dùng font 'Quicksand', sans-serif (Google Font). Trọng số 500 cho body, 600 cho label, 700 cho heading và button.

2. BẢNG MÀU:
- Primary Brand Blue: #4786E3 (Header, Footer, CTA chính, Tiêu đề)
- 3D Shadow Dark Blue: #0950AE (Đổ bóng 4px đáy nút CTA chính)
- Secondary Blue / Headings: #507FBD
- Action Blue (Link/Button text): #2C9DFF
- Nền Section phụ: #F1F7FF
- Nền chính: #FFFFFF
- Accent Mascot Yellow: #FFCB08

3. NÚT BẤM 3D TACTILE (BẮT BUỘC):
- Nút bấm chính: background #4786E3, text #FFFFFF, border-radius: 16px, padding: 10px 50px, font-weight: 700, font-size: 18px.
- Hiệu ứng 3D: box-shadow: 0 4px 0 0 #0950AE;
- Hiệu ứng bấm (:active): transform: translateY(4px); box-shadow: none;
- Nút phụ (như nút Đăng nhập): background #FFFFFF, color #2C9DFF, box-shadow: 0 4px 0 0 #507FBD;

4. TIÊU ĐỀ SECTION:
- Giữa tiêu đề section luôn có 2 thanh bo tròn hai bên: span { width: 95px; height: 10px; background: #4786E3; border-radius: 5px; }

5. BỐ CỤC & TONE:
- Phong cách Gamified, vui tươi, thân thiện, bo tròn mềm mại (border-radius 16px).
- Bố cục xen kẽ so le (Z-pattern) cho các tính năng.
- Header có nền #4786E3 với border-bottom bo góc 16px. Footer nền #4786E3 với chữ trắng.
```
