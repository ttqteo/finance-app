"use server";

import { stock } from "vnstock-js";

export async function getCurrentPrice(ticker: string) {
  try {
    // @ts-ignore
    const data = await stock.price({ ticker });
    console.log(data);
    if (data && data.length > 0) {
      const item = data[0];
      return item;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error);
    return null;
  }
}
