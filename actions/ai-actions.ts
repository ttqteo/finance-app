"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  profitLossPercent: number;
  value: number;
  [key: string]: any;
}

interface PortfolioData {
  stocks: Stock[];
  portfolioPerformance: { date: Date; value: number }[];
  sectorAllocation: { name: string; value: number }[];
}

export async function getPortfolioInsights(
  portfolioData: PortfolioData
): Promise<string> {
  try {
    // Format the data for the AI
    const stocksInfo = portfolioData.stocks.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: stock.currentPrice,
      profitLossPercent: stock.profitLossPercent,
      value: stock.value,
    }));

    // Get the first and last portfolio values to calculate overall performance
    const firstValue = portfolioData.portfolioPerformance[0]?.value || 0;
    const lastValue =
      portfolioData.portfolioPerformance[
        portfolioData.portfolioPerformance.length - 1
      ]?.value || 0;
    const overallPerformance = ((lastValue - firstValue) / firstValue) * 100;

    // Create a prompt for the AI
    const prompt = `
      You are a financial advisor analyzing a stock portfolio. Please provide insights and recommendations based on the following data:

      Portfolio Performance:
      - Overall return: ${overallPerformance.toFixed(2)}%
      - Current portfolio value: $${lastValue.toFixed(2)}

      Sector Allocation:
      ${portfolioData.sectorAllocation
        .map((sector) => `- ${sector.name}: ${sector.value}%`)
        .join("\n")}

      Top Stocks:
      ${stocksInfo
        .map(
          (stock) =>
            `- ${stock.symbol} (${
              stock.name
            }): Current price $${stock.currentPrice.toFixed(2)}, P/L ${
              stock.profitLossPercent >= 0 ? "+" : ""
            }${stock.profitLossPercent.toFixed(
              2
            )}%, Value $${stock.value.toFixed(2)}`
        )
        .join("\n")}

      Please provide:
      1. A brief analysis of the portfolio's performance and diversification
      2. Potential risks and areas of concern
      3. 2-3 specific recommendations to improve the portfolio
      4. 1-2 stocks that might be worth considering adding to this portfolio

      Format your response in clear paragraphs with headings. Keep your response concise and focused on actionable insights.
    `;

    // Call the Gemini API
    const { text } = await generateText({
      model: google("models/gemini-2.0-flash-exp"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return text;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return "Unable to generate insights at this time. Please try again later.";
  }
}
