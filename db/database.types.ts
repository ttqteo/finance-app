/**
 * Kiểu bảng cho supabase-js.
 *
 * Bản này VIẾT TAY theo `db/schema.ts`. Đúng ra nó phải do
 * `supabase gen types typescript --project-id <ref>` sinh ra, nhưng lệnh đó cần
 * Supabase CLI đã đăng nhập. Khi nào chạy được thì sinh đè lên file này —
 * hình dạng đã theo đúng khuôn của bản sinh tự động để thay thẳng được.
 *
 * Lưu ý về kiểu ngày: PostgREST trả `timestamp` thành CHUỖI, không phải `Date`
 * như Drizzle. Xem `lib/pg-date.ts` — chuỗi đó không có múi giờ nên phải chuẩn
 * hoá trước khi đưa vào `new Date()`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          plaid_id: string | null;
          name: string;
          user_id: string;
        };
        Insert: {
          id: string;
          plaid_id?: string | null;
          name: string;
          user_id: string;
        };
        Update: {
          id?: string;
          plaid_id?: string | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          plaid_id: string | null;
          name: string;
          user_id: string;
        };
        Insert: {
          id: string;
          plaid_id?: string | null;
          name: string;
          user_id: string;
        };
        Update: {
          id?: string;
          plaid_id?: string | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          amount: number;
          payee: string;
          notes: string | null;
          date: string;
          account_id: string;
          user_id: string;
          // Tên cột có hai gạch dưới là lỗi gõ có từ trước, không sửa trong
          // đợt này để khỏi phình diff.
          category__id: string | null;
        };
        Insert: {
          id: string;
          amount: number;
          payee: string;
          notes?: string | null;
          date: string;
          account_id: string;
          user_id: string;
          category__id?: string | null;
        };
        Update: {
          id?: string;
          amount?: number;
          payee?: string;
          notes?: string | null;
          date?: string;
          account_id?: string;
          user_id?: string;
          category__id?: string | null;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          language: string;
          currency: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          language?: string;
          currency?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          language?: string;
          currency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          frequency: string;
          start_date: string;
          currency: string;
          has_free_trial: boolean | null;
          category_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          frequency: string;
          start_date: string;
          currency?: string;
          has_free_trial?: boolean | null;
          category_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          frequency?: string;
          start_date?: string;
          currency?: string;
          has_free_trial?: boolean | null;
          category_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          start_date: string;
          end_date: string | null;
          renewal_date: string | null;
          frequency: string | null;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_current_period_end: string | null;
          cancel_at_period_end: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          start_date: string;
          end_date?: string | null;
          renewal_date?: string | null;
          frequency?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          renewal_date?: string | null;
          frequency?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      summary: {
        Args: {
          p_from: string;
          p_to: string;
          p_last_from: string;
          p_last_to: string;
          p_account_id?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
