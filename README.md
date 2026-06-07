# Unicode Rich Text Editor

Web app nhỏ để tạo **fake Unicode formatting** cho bold / italic / bold italic.

## Tính năng

- Edit trực tiếp trong vùng `contenteditable`
- Bôi đen text rồi áp dụng:
  - `𝗕` Bold
  - `𝘪` Italic
  - `𝙗𝙞` Bold Italic
- Convert markdown sang Unicode:
  - `**bold**`
  - `*italic*`
  - `***bold italic***`
- Copy output nhanh
- Đẩy output markdown sang editor trực tiếp

## Chạy local

```bash
npm install
npm run dev
```

## Verify

```bash
npm run test
npm run build
```

## Ghi chú

Đây là Unicode ký tự thay thế, không phải rich text thật. Không nên dùng cho code, command, URL, email, hay dữ liệu cần parse chính xác.
