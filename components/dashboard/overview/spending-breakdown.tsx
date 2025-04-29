"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Mock spending data by category
const spendingData = [
  { category: "Housing", amount: 1500, color: "#8b5cf6" },
  { category: "Food", amount: 850, color: "#3b82f6" },
  { category: "Transport", amount: 320, color: "#10b981" },
  { category: "Utilities", amount: 280, color: "#f59e0b" },
  { category: "Entertainment", amount: 220, color: "#ef4444" },
  { category: "Shopping", amount: 380, color: "#ec4899" },
  { category: "Health", amount: 150, color: "#14b8a6" },
  { category: "Other", amount: 180, color: "#6b7280" },
];

export function SpendingBreakdown() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={spendingData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 80,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
          <XAxis type="number" tickFormatter={(value) => `$${value}`} />
          <YAxis type="category" dataKey="category" width={80} />
          <Tooltip
            formatter={(value) => [`$${value}`, "Amount"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {spendingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
