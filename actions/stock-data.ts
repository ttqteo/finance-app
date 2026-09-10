"use server";

import { stock } from "vnstock-js";

export async function getCurrentPrice(ticker: string) {
  try {
    // v1.5.1 bỏ `stock.price`. `priceBoard` là chỗ thay thế: vẫn trả về mảng
    // đúng như đoạn dưới vẫn giả định, và có kiểu đàng hoàng nên `@ts-ignore`
    // cũ không còn cần — nó vốn đang che đi chính chỗ sẽ vỡ khi nâng cấp.
    const data = await stock.priceBoard({ ticker });

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
