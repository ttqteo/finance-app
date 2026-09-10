import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// `prepare: false` là bắt buộc nếu nối qua Transaction pooler của Supabase
// (pgbouncer ở chế độ transaction không giữ được prepared statement). Đặt sẵn
// để đổi connection string không phải nhớ lại chuyện này; nối thẳng hay qua
// Session pooler thì cờ này cũng vô hại.
export const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(sql);
