# Unicode Craft

Web app nhỏ để tạo **fake Unicode formatting** nhưng được tách flow rõ ràng hơn thay vì nhét mọi thứ vào một màn hình.

## Tính năng

- 2 workflow riêng bằng hash route:
  - `#selection`: style trực tiếp bằng `contenteditable`
  - `#markdown`: viết markdown rồi convert sang Unicode
- Bôi đen text rồi áp dụng:
  - `𝗕` Bold
  - `𝘪` Italic
  - `𝙗𝙞` Bold Italic
- Convert markdown sang Unicode:
  - `**bold**`
  - `*italic*`
  - `***bold italic***`
- Copy output nhanh
- Đẩy output từ markdown page sang selection page để style tiếp
- Hero mark + loading/transition layer để UI có nhịp hơn

## Design references in repo

- `DESIGN.md`: design analysis cài từ `getdesign` để giữ visual direction nhất quán
- `.agents/skills/design-taste-frontend/SKILL.md`: Taste Skill anti-slop frontend guidance
- `.agents/skills/redesign-existing-projects/SKILL.md`: redesign audit/fix checklist cho các vòng polish tiếp theo

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
