-- `summary()` nhận tham số `timestamp` trần trong khi từ migration 0012 cột
-- `transactions.date` đã là `timestamptz`.
--
-- So sánh `timestamptz >= timestamp` thì Postgres ép vế `timestamp` sang
-- `timestamptz` THEO TimeZone CỦA PHIÊN. Phiên không phải UTC là cả khoảng thời
-- gian lệch đi đúng bằng offset, không lỗi lầm gì cả. Supabase mặc định phiên
-- UTC nên hiện tại vô hại, nhưng đó lại đúng là kiểu ngầm định mà cả đợt sửa
-- này đang dẹp bỏ.
--
-- Đổi tham số sang `timestamptz` để phép so sánh cùng kiểu, không còn ép ngầm.
-- Handler vẫn truyền chuỗi ISO có `Z` nên vào thẳng, không đổi gì phía TS.
--
-- Phải DROP trước: `CREATE OR REPLACE` không đổi được kiểu tham số, nó tạo
-- thêm một overload rồi hai bản cùng tồn tại.

DROP FUNCTION IF EXISTS public.summary(timestamp, timestamp, timestamp, timestamp, text);--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.summary(
  p_from timestamptz,
  p_to timestamptz,
  p_last_from timestamptz,
  p_last_to timestamptz,
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
