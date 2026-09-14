const assert = require("node:assert/strict");
require("../rules.js");
require("../calculator.js");
const calc = (items, rules = DiscountRules) =>
  DiscountCalculator.calculate(items, rules);
const item = (product, quantity, price = "0") => ({ product, quantity, price });
let checks = 0;
const check = (condition) => {
  assert.ok(condition);
  checks++;
};
for (const [gross, percent] of [
  ["1499,99", 0],
  ["1500", 5],
  ["2999,99", 5],
  ["3000", 10],
  ["4999,99", 10],
  ["5000", 18],
])
  check(calc([item("Outro", 1, gross)]).percent === percent);
for (const [ref, base, six, ten] of [
  ["DEMO-A", 7200, 6600, 6000],
  ["DEMO-B", 4800, 4500, 4200],
  ["DEMO-C", 4800, 4500, 4200],
  ["DEMO-D", 3200, 3000, 2800],
]) {
  for (const [qty, expected] of [
    [3, base],
    [4, six],
    [7, six],
    [8, ten],
  ]) {
    const r = calc([item(ref, qty)]);
    check(r.finalTotal === expected * qty);
    check(r.gross === base * qty);
  }
}
const mixed = calc([item("DEMO-A", 10), item("Outras peças", 10, "78,00")]);
check(mixed.gross === 150000);
check(mixed.finalTotal === 134100);
check(mixed.saving === 15900);
check(mixed.lines[0].rule === "Progressivo");
check(mixed.lines[1].rule === "Fidelidade");
check(mixed.lines[1].finalUnitPrice === 7410);
const twelve = calc([item("DEMO-D", 10), item("Outros", 1, "2680")]);
check(twelve.lines[0].rule === "Progressivo");
check(twelve.percent === 10);
const sixteen = calc([item("DEMO-A", 10), item("Outros", 1, "4280")]);
check(sixteen.lines.every((l) => l.rule === "Fidelidade"));
const split = calc([item("DEMO-A", 4), item("DEMO-A", 6)]);
check(split.lines.every((l) => l.finalUnitPrice === 6000));
const tieRules = {
  loyalty: [{ minimum: 0, percent: 10 }],
  progressive: {
    T: { basePrice: 1000, tiers: [{ minimumQuantity: 1, unitPrice: 900 }] },
  },
};
check(calc([item("T", 1)], tieRules).lines[0].rule === "Fidelidade");
check(calc([]).finalTotal === 0);
check(calc([item("__proto__", 1, "10")]).gross === 1000);
for (const bad of [
  item("", 1, "10"),
  item("x", 0, "10"),
  item("x", 1.5, "10"),
  item("x", 1, "-1"),
  item("x", 1, "abc"),
]) {
  assert.throws(() => calc([bad]));
  checks++;
}
check(mixed.lines.reduce((n, l) => n + l.finalTotal, 0) === mixed.finalTotal);
console.log(
  `${checks} verificações passaram; exemplo misto: R$ ${(mixed.finalTotal / 100).toFixed(2)}`,
);
