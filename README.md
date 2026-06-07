# Unicode Rich Text Editor

Web app nhỏ để tạo **fake Unicode formatting** theo 2 flow rõ ràng:

- `#selection`: edit trực tiếp bằng `contenteditable`, bôi đen rồi áp style
- `#markdown`: viết markdown rồi convert sang Unicode plain text

## Tính năng

- Áp style cho đoạn text đã chọn:
  - Bold
  - Italic
  - Bold + Italic
- Convert markdown:
  - `**bold**`
  - `*italic*`
  - `***bold italic***`
- Copy output nhanh
- Đẩy output từ markdown page sang selection page để chỉnh tiếp

## Chạy local

```bash
npm install
npm run dev
```

## Verify

```bash
npm run test
npm run build
npm run preview
```

## Ghi chú

Đây là Unicode ký tự thay thế, không phải rich text thật. Không nên dùng cho code, command, URL, email, hay dữ liệu cần parse chính xác.
