-- Gom ba truy vấn tổng hợp của `/api/summary` vào một hàm SQL.
--
-- Query builder của supabase-js không diễn đạt nổi mấy câu này (SUM có CASE,
-- group + order theo biểu thức tổng hợp), nên phần đó xuống SQL. NHƯNG chỉ phần
-- tổng hợp thôi:
--
--   * `calculatePercentageChange` và `fillMissingDays` VẪN Ở TypeScript. Chúng
--     là hàm thuần, đã có test trong `lib/dashboard/__tests__/`, dịch sang SQL
--     là vứt luôn chỗ test đó đi mà chẳng được gì.
--   * Mốc thời gian kỳ trước cũng tính bên TS rồi truyền vào. date-fns và
--     Postgres không nhất thiết chia ngày giống nhau ở biên; giữ một nguồn duy
--     nhất cho phép tính đó an toàn hơn.
--
-- `security invoker` là bắt buộc: hàm chạy bằng quyền người gọi nên RLS vẫn áp
-- dụng. Dùng `security definer` là mở cửa hậu vòng qua policy.
--
-- Không còn join sang `accounts` để lọc theo user như bản Drizzle cũ: từ
-- migration 0009 `transactions` đã có `user_id` riêng, và policy RLS lọc sẵn.
--
-- `coalesce(..., 0)`: `sum()` trên tập rỗng trả NULL, còn bản TS cũ đi qua
-- `Number(null)` thành 0. Giữ nguyên hành vi đó để client không phải đổi.

CREATE OR REPLACE FUNCTION public.summary(
  p_from timestamp,
  p_to timestamp,
  p_last_from timestamp,
  p_last_to timestamp,
  p_account_id text DEFAULT NULL
)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT json_build_object(
    'current', (
      SELECT json_build_object(
        'income',    coalesce(sum(CASE WHEN t.amount >= 0 THEN t.amount ELSE 0 END), 0),
        'expenses',  coalesce(sum(CASE WHEN t.amount <  0 THEN t.amount ELSE 0 END), 0),
        'remaining', coalesce(sum(t.amount), 0)
      )
      FROM transactions t
      WHERE t.date >= p_from AND t.date <= p_to
        AND (p_account_id IS NULL OR t.account_id = p_account_id)
    ),
    'last', (
      SELECT json_build_object(
        'income',    coalesce(sum(CASE WHEN t.amount >= 0 THEN t.amount ELSE 0 END), 0),
        'expenses',  coalesce(sum(CASE WHEN t.amount <  0 THEN t.amount ELSE 0 END), 0),
        'remaining', coalesce(sum(t.amount), 0)
      )
      FROM transactions t
      WHERE t.date >= p_last_from AND t.date <= p_last_to
        AND (p_account_id IS NULL OR t.account_id = p_account_id)
    ),
    -- LEFT JOIN chứ không INNER: `category__id` cho phép NULL, inner join sẽ
    -- ném hết chi tiêu chưa phân loại ra khỏi danh sách trong khi `expenses`
    -- bên trên vẫn tính chúng. Hàng không phân loại về với name = null và
    -- client tự đặt nhãn.
    'categories', (
      SELECT coalesce(json_agg(row_to_json(x) ORDER BY x.value DESC), '[]'::json)
      FROM (
        SELECT c.name AS name, sum(abs(t.amount)) AS value
        FROM transactions t
        LEFT JOIN categories c ON c.id = t.category__id
        WHERE t.amount < 0
          AND t.date >= p_from AND t.date <= p_to
          AND (p_account_id IS NULL OR t.account_id = p_account_id)
        GROUP BY c.name
      ) x
    ),
    'days', (
      SELECT coalesce(json_agg(row_to_json(y) ORDER BY y.date), '[]'::json)
      FROM (
        SELECT t.date AS date,
               sum(CASE WHEN t.amount >= 0 THEN t.amount ELSE 0 END) AS income,
               sum(CASE WHEN t.amount <  0 THEN abs(t.amount) ELSE 0 END) AS expenses
        FROM transactions t
        WHERE t.date >= p_from AND t.date <= p_to
          AND (p_account_id IS NULL OR t.account_id = p_account_id)
        GROUP BY t.date
      ) y
    )
  );
$$;
