const assert = require("node:assert/strict");
const path = require("node:path");
const root = process.env.CALCULATOR_ROOT || path.resolve(__dirname, "..");
require(path.join(root, "rules.js"));
require(path.join(root, "calculator.js"));
const calc = (items) => DiscountCalculator.calculate(items, DiscountRules);
const item = (product, quantity, price = "0") => ({ product, quantity, price });
let checks = 0;
const eq = (a, b) => {
  assert.deepEqual(a, b);
  checks++;
};
const bad = (i) => {
  assert.throws(() => calc([i]));
  checks++;
};
for (const price of [
  "",
  " ",
  "-0.01",
  "1.234",
  "1,234.56",
  "1e3",
  "Infinity",
  "NaN",
  "1000000.01",
])
  bad(item("X", 1, price));
for (const q of ["", 0, -1, 1.1, 100001, Infinity, NaN]) bad(item("X", q, "1"));
eq(calc([item("X", 1, "0")]).finalTotal, 0);
eq(DiscountCalculator.moneyToCents(" 001,2 "), 120);
eq(DiscountCalculator.moneyToCents("0.29"), 29);
eq(calc([item("X", 1000, "1000000")]).gross, 100000000000);
bad(item("X", 1001, "1000000"));
for (const [price, pct, total] of [
  ["1499.99", 0, 149999],
  ["1500", 5, 142500],
  ["2999.99", 5, 284999],
  ["3000", 10, 270000],
  ["4999.99", 10, 449999],
  ["5000", 18, 410000],
]) {
  const r = calc([item("X", 1, price)]);
  eq([r.percent, r.finalTotal, r.saving], [pct, total, r.gross - total]);
}
for (const ref of Object.keys(DiscountRules.progressive))
  for (const qty of [3, 4, 7, 8])
    for (const gross of [150000, 300000, 500000]) {
      const rule = DiscountRules.progressive[ref];
      const r = calc([
        item(ref, qty, "invalid"),
        item("Other", 1, ((gross - rule.basePrice * qty) / 100).toFixed(2)),
      ]);
      const expected =
        qty >= 8
          ? rule.tiers[1].unitPrice
          : qty >= 4
            ? rule.tiers[0].unitPrice
            : rule.basePrice;
      eq(
        r.lines[0].finalTotal,
        Math.min(
          expected * qty,
          rule.basePrice * qty -
            Math.round((rule.basePrice * qty * r.percent) / 100),
        ),
      );
      eq(
        r.finalTotal,
        r.lines.reduce((s, l) => s + l.finalTotal, 0),
      );
      eq(r.saving, r.gross - r.finalTotal);
      assert.ok(
        r.finalTotal <= r.loyaltyTotal && r.finalTotal <= r.progressiveTotal,
      );
      checks++;
    }
const grouped = calc([item(" DEMO-D ", 5), item("DEMO-D", 5)]);
eq(grouped.finalTotal, 28000);
eq(
  grouped.lines.map((l) => l.referenceQuantity),
  [10, 10],
);
// Rounding happens on the discount of each line, not on each unit or the order.
const r = calc([item("X", 3, "0.07"), item("Other", 1, "1500")]);
eq(r.lines[0].finalTotal, 20);
eq(r.lines[0].finalUnitPrice, 6.65);
const split = calc([
  item("X", 1, "0.07"),
  item("X", 1, "0.07"),
  item("X", 1, "0.07"),
  item("Other", 1, "1500"),
]);
eq(r.finalTotal - split.finalTotal, -1);
for (const name of ["constructor", "toString", "<img src=x onerror=alert(1)>"])
  eq(calc([item(name, 1, "10")]).gross, 1000);
eq(calc([]).next.remaining, 150000);
eq(calc([item("X", 1, "5000")]).next, null);
console.log(`${checks} verificações adicionais passaram.`);
