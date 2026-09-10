import { config } from "dotenv";

// Vitest KHÔNG tự nạp `.env` vào `process.env` — Vite chỉ đưa biến có tiền tố
// `VITE_` vào `import.meta.env`. Không có bước này thì `db/__tests__/rls.test.ts`
// thấy biến rỗng rồi tự skip, mà skip lại trông y hệt pass.
//
// Chạy trong từng worker của test chứ không phải lúc nạp config, vì worker là
// tiến trình riêng và không thừa hưởng biến đặt ở tiến trình config.
config({ path: ".env" });
