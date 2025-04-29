"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const currentDate = new Date();
const currentDay = currentDate.getDate();

type Event = {
  type: string;
  amount: number;
  label: string;
};

// Sample events with more detailed financial data
const events: { [key: number]: Event } = {
  2: { type: "bill", amount: 45, label: "Gym Membership" },
  4: { type: "bill", amount: 120, label: "Electricity" },
  7: { type: "payment", amount: 250, label: "Freelance Payment" },
  10: { type: "bill", amount: 85, label: "Internet" },
  12: { type: "bill", amount: 35, label: "Streaming Services" },
  15: { type: "bill", amount: 1500, label: "Rent" },
  17: { type: "bill", amount: 180, label: "Car Insurance" },
  20: { type: "bill", amount: 75, label: "Water Bill" },
  22: { type: "payment", amount: 3250, label: "Salary" },
  25: { type: "bill", amount: 220, label: "Credit Card Payment" },
  28: { type: "bill", amount: 65, label: "Phone" },
  30: { type: "payment", amount: 150, label: "Investment Dividend" },
};

export function MonthlyCalendar() {
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-medium">
          {monthName} {year}
        </h3>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8 rounded-md p-1" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isToday =
            day === currentDay &&
            month === currentDate.getMonth() &&
            year === currentDate.getFullYear();
          const event = events[day];

          return (
            <div
              key={day}
              className={`relative h-8 rounded-md p-1 text-center text-xs ${
                isToday
                  ? "bg-primary text-primary-foreground"
                  : event
                  ? "bg-muted"
                  : ""
              }`}
              title={event ? `${event.label}: $${event.amount}` : ""}
            >
              <span className="font-medium">{day}</span>
              {event && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 rounded-full ${
                    event.type === "bill" ? "bg-red-500" : "bg-green-500"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
