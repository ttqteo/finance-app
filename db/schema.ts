import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  foreignKey,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// `user_id` ở mọi bảng là uuid tham chiếu `auth.users(id)` của Supabase.
// Drizzle không mô tả được ràng buộc sang schema `auth` (nằm ngoài tầm nó), nên
// phần `references auth.users` viết tay trong file migration.

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id"),
    name: text("name").notNull(),
    userId: uuid("user_id").notNull(),
  },
  (t) => ({
    // `id` vốn đã là khoá chính; công khai thêm cặp (id, user_id) để
    // `transactions` tham chiếu được bằng composite foreign key.
    idUserId: unique("accounts_id_user_id_key").on(t.id, t.userId),
  })
);

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertAccountSchema = createInsertSchema(accounts);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: uuid("user_id").notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertCategoriesSchema = createInsertSchema(categories);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    payee: text("payee").notNull(),
    notes: text("notes"),
    date: timestamp("date", { mode: "date" }).notNull(),
    accountId: text("account_id").notNull(),
    // Trước đây `transactions` không có cột chủ sở hữu nào, chỉ suy ra qua
    // `account_id → accounts.user_id`. Thêm cột thật để policy RLS rẻ đi:
    // `auth.uid() = user_id` thay vì subquery join trên từng hàng.
    userId: uuid("user_id").notNull(),
    categoryId: text("category__id").references(() => categories.id, {
      onDelete: "set null",
    }),
  },
  (t) => ({
    // Cái giá thường thấy của denormalize là cột trôi khỏi account của nó.
    // Composite FK khiến database tự chặn: ghi một cặp (account, user) không
    // khớp là bị từ chối ngay, nên `user_id` ở đây không thể mâu thuẫn với
    // `accounts.user_id`. Đây cũng là ràng buộc thay cho FK đơn lên accounts.id.
    accountOwner: foreignKey({
      columns: [t.accountId, t.userId],
      foreignColumns: [accounts.id, accounts.userId],
      name: "transactions_account_id_user_id_fkey",
    }).onDelete("cascade"),
  })
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  accounts: one(accounts, {
    fields: [transactions.id],
    references: [accounts.id],
  }),
  categories: one(categories, {
    fields: [transactions.id],
    references: [categories.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey(),
  language: text("language").notNull().default("en"),
  currency: text("currency").notNull().default("USD"),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings);

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  frequency: text("frequency").notNull(), // e.g., 'monthly', 'yearly'
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  currency: text("currency").default("VND").notNull(),
  hasFreeTrial: boolean("has_free_trial").default(false),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  category: one(categories, {
    fields: [subscriptions.categoryId],
    references: [categories.id],
  }),
}));

export const insertSubscriptionSchema = createInsertSchema(subscriptions, {
  startDate: z.coerce.date(),
  hasFreeTrial: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().unique(), // One subscription per user
  plan: text("plan").notNull(), // 'FREE', 'PREMIUM'
  status: text("status").notNull(), // 'ACTIVE', 'CANCELLED', 'EXPIRED'
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }), // Null for lifetime or auto-renewing indefinite? Better to have renewal date.
  renewalDate: timestamp("renewal_date", { mode: "date" }),
  frequency: text("frequency"), // 'MONTHLY', 'YEARLY'
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", {
    mode: "date",
  }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const insertUserSubscriptionSchema = createInsertSchema(
  userSubscriptions,
  {
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    renewalDate: z.coerce.date().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  }
);
