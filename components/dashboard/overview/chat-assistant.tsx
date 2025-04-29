"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample chat history
const initialMessages = [
  {
    role: "assistant",
    content: "Hello! I'm your financial assistant. How can I help you today?",
  },
  {
    role: "user",
    content: "What's my current balance?",
  },
  {
    role: "assistant",
    content:
      "Your current total balance across all accounts is $24,563.00. Your checking account has $8,245.32, savings has $4,317.68, and your investment account has $12,000.00.",
  },
];

export function ChatAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  // Sample responses for demo purposes
  const sampleResponses = {
    budget:
      "Based on your spending patterns, I recommend allocating 50% to necessities, 30% to discretionary spending, and 20% to savings and investments.",
    save: "To increase your savings, consider automating transfers to your savings account on payday and reducing subscription services. You're currently spending $120/month on subscriptions.",
    invest:
      "Based on your risk profile, I'd recommend a portfolio with 70% stocks, 20% bonds, and 10% cash. Your current asset allocation is 60% stocks, 15% bonds, 10% cash, 10% real estate, and 5% crypto.",
    spend:
      "Your top spending categories this month are Housing ($1,500), Food ($420), and Transportation ($320). You've spent 15% more on dining out compared to last month.",
    income:
      "Your total income this month is $8,350. This includes your salary of $7,500, dividends of $350, and side gig income of $500.",
    tax: "Based on your current income and deductions, your estimated tax liability for this year is $18,750. You've paid $15,200 so far through withholdings.",
    default:
      "I don't have specific information about that. Would you like me to help you with budgeting, saving, investing, or analyzing your spending patterns?",
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      let response = sampleResponses.default;

      // Simple keyword matching for demo
      const lowercaseInput = input.toLowerCase();
      if (
        lowercaseInput.includes("budget") ||
        lowercaseInput.includes("plan")
      ) {
        response = sampleResponses.budget;
      } else if (
        lowercaseInput.includes("save") ||
        lowercaseInput.includes("saving")
      ) {
        response = sampleResponses.save;
      } else if (
        lowercaseInput.includes("invest") ||
        lowercaseInput.includes("stock")
      ) {
        response = sampleResponses.invest;
      } else if (
        lowercaseInput.includes("spend") ||
        lowercaseInput.includes("spending")
      ) {
        response = sampleResponses.spend;
      } else if (
        lowercaseInput.includes("income") ||
        lowercaseInput.includes("earn")
      ) {
        response = sampleResponses.income;
      } else if (lowercaseInput.includes("tax")) {
        response = sampleResponses.tax;
      }

      setMessages([...newMessages, { role: "assistant", content: response }]);
    }, 1000);
  };

  return (
    <div className="flex h-[300px] flex-col">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 pt-2">
        <Input
          placeholder="Ask about your finances..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
