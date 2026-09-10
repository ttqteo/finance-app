const { stock } = require("vnstock-js");

(async () => {
  try {
    const res = await stock.priceBoard({ ticker: "HPG" });
    if (res && res.length > 0) {
      console.log("Keys:", Object.keys(res[0]));
      console.log(
        "Sample values:",
        JSON.stringify(
          {
            matchPrice: res[0].matchPrice,
            price: res[0].price,
            lastPrice: res[0].lastPrice,
            close: res[0].close,
            referencePrice: res[0].referencePrice,
          },
          null,
          2
        )
      );
    } else {
      console.log("Empty result");
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
})();
