"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Enhanced mock data with more months and detailed income/expense breakdown
const data = [
  {
    name: "Jan",
    Income: 6500,
    Expenses: 4200,
    Savings: 2300,
    incomeBreakdown: {
      Salary: 6000,
      Investments: 300,
      Other: 200,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 800,
      Transportation: 400,
      Utilities: 350,
      Entertainment: 450,
      Shopping: 300,
      Other: 400,
    },
  },
  {
    name: "Feb",
    Income: 5900,
    Expenses: 3800,
    Savings: 2100,
    incomeBreakdown: {
      Salary: 5500,
      Investments: 250,
      Other: 150,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 750,
      Transportation: 350,
      Utilities: 320,
      Entertainment: 380,
      Shopping: 200,
      Other: 300,
    },
  },
  {
    name: "Mar",
    Income: 8100,
    Expenses: 5100,
    Savings: 3000,
    incomeBreakdown: {
      Salary: 6000,
      Investments: 300,
      Bonus: 1600,
      Other: 200,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 850,
      Transportation: 420,
      Utilities: 380,
      Entertainment: 550,
      Shopping: 900,
      Other: 500,
    },
  },
  {
    name: "Apr",
    Income: 7200,
    Expenses: 4800,
    Savings: 2400,
    incomeBreakdown: {
      Salary: 6500,
      Investments: 350,
      Other: 350,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 820,
      Transportation: 400,
      Utilities: 360,
      Entertainment: 520,
      Shopping: 700,
      Other: 500,
    },
  },
  {
    name: "May",
    Income: 7800,
    Expenses: 5200,
    Savings: 2600,
    incomeBreakdown: {
      Salary: 6500,
      Investments: 400,
      Freelance: 600,
      Other: 300,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 850,
      Transportation: 450,
      Utilities: 380,
      Entertainment: 620,
      Shopping: 800,
      Other: 600,
    },
  },
  {
    name: "Jun",
    Income: 8400,
    Expenses: 5500,
    Savings: 2900,
    incomeBreakdown: {
      Salary: 6500,
      Investments: 450,
      Freelance: 1150,
      Other: 300,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 900,
      Transportation: 500,
      Utilities: 400,
      Entertainment: 700,
      Shopping: 850,
      Other: 650,
    },
  },
  {
    name: "Jul",
    Income: 7900,
    Expenses: 5100,
    Savings: 2800,
    incomeBreakdown: {
      Salary: 6500,
      Investments: 500,
      Freelance: 600,
      Other: 300,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 880,
      Transportation: 470,
      Utilities: 420,
      Entertainment: 650,
      Shopping: 580,
      Other: 600,
    },
  },
  {
    name: "Aug",
    Income: 8200,
    Expenses: 5300,
    Savings: 2900,
    incomeBreakdown: {
      Salary: 6500,
      Investments: 550,
      Freelance: 850,
      Other: 300,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 900,
      Transportation: 480,
      Utilities: 450,
      Entertainment: 670,
      Shopping: 700,
      Other: 600,
    },
  },
  {
    name: "Sep",
    Income: 9100,
    Expenses: 5800,
    Savings: 3300,
    incomeBreakdown: {
      Salary: 6500,
      Investments: 600,
      Bonus: 1700,
      Freelance: 300,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 950,
      Transportation: 500,
      Utilities: 450,
      Entertainment: 800,
      Shopping: 950,
      Other: 650,
    },
  },
  {
    name: "Oct",
    Income: 8350,
    Expenses: 5240,
    Savings: 3110,
    incomeBreakdown: {
      Salary: 7500,
      Investments: 350,
      Freelance: 500,
    },
    expenseBreakdown: {
      Housing: 1500,
      Food: 850,
      Transportation: 320,
      Utilities: 280,
      Entertainment: 220,
      Shopping: 380,
      Health: 150,
      Other: 180,
    },
  },
  {
    name: "Nov",
    Income: 0,
    Expenses: 0,
    Savings: 0,
    incomeBreakdown: {
      Salary: 0,
      Investments: 0,
      Other: 0,
    },
    expenseBreakdown: {
      Housing: 0,
      Food: 0,
      Transportation: 0,
      Utilities: 0,
      Entertainment: 0,
      Shopping: 0,
      Other: 0,
    },
  },
  {
    name: "Dec",
    Income: 0,
    Expenses: 0,
    Savings: 0,
    incomeBreakdown: {
      Salary: 0,
      Investments: 0,
      Other: 0,
    },
    expenseBreakdown: {
      Housing: 0,
      Food: 0,
      Transportation: 0,
      Utilities: 0,
      Entertainment: 0,
      Shopping: 0,
      Other: 0,
    },
  },
];

export function ExpenseChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              if (
                name === "Income" ||
                name === "Expenses" ||
                name === "Savings"
              ) {
                return [`$${value}`, name];
              }
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar dataKey="Income" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
