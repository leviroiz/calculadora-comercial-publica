"use strict";
const $ = (id) => document.getElementById(id);
const format = (cents) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatUnit = (cents) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 4,
  });
let sequence = 0;
function addItem() {
  const id = ++sequence;
  const row = document.createElement("div");
  row.className = "item";
  row.innerHTML = `<label for="product-${id}">Referência / produto<input id="product-${id}" list="references" data-field="product" placeholder="Código ou nome" maxlength="120"></label><label for="quantity-${id}">Quantidade<input id="quantity-${id}" data-field="quantity" type="number" min="1" max="100000" step="1" value="1"></label><label for="price-${id}">Preço base (R$)<input id="price-${id}" data-field="price" inputmode="decimal" placeholder="0,00"></label><button class="remove" type="button" aria-label="Remover item ${id}">×</button><div class="line-total">Subtotal: —</div><div class="line-result"></div>`;
  row.querySelector(".remove").onclick = () => {
    row.remove();
    update();
    $("add").focus();
  };
  row.addEventListener("input", (event) => {
    if (event.target.dataset.field === "product") {
      const product = event.target.value.trim();
      const official = Object.hasOwn(DiscountRules.progressive, product)
        ? DiscountRules.progressive[product]
        : null;
      const price = row.querySelector("[data-field=price]");
      if (official)
        price.value = (official.basePrice / 100).toFixed(2).replace(".", ",");
      else if (price.readOnly) price.value = "";
      price.readOnly = !!official;
    }
    update();
  });
  $("items").append(row);
  update();
  row.querySelector("input").focus();
}
function readItems() {
  return [...$("items").children].map((row) =>
    Object.fromEntries(
      [...row.querySelectorAll("input")].map((input) => [
        input.dataset.field,
        input.value,
      ]),
    ),
  );
}
function update() {
  const items = readItems();
  $("count").textContent =
    `${items.length} ${items.length === 1 ? "item" : "itens"}`;
  let error = "";
  const rows = [...$("items").children];
  rows.forEach((row, index) => {
    row.querySelector(".line-result").textContent = "";
    try {
      const result = DiscountCalculator.calculate(
        [items[index]],
        DiscountRules,
      );
      row.querySelector(".line-total").textContent =
        `Subtotal bruto: ${format(result.gross)}`;
    } catch (e) {
      row.querySelector(".line-total").textContent = "Subtotal: —";
      error ||= `Item ${index + 1}: ${e.message}`;
    }
  });
  let result;
  try {
    result = DiscountCalculator.calculate(items, DiscountRules);
  } catch (e) {
    error ||= e.message;
  }
  $("error").textContent = error;
  if (error || !items.length) {
    $("gross").textContent = error ? "—" : format(0);
    $("winner").textContent = error ? "Complete os itens" : "Monte seu pedido";
    $("winner-note").textContent = error
      ? "Preencha os campos válidos para calcular o pedido completo."
      : "Adicione um produto para começar.";
    ["saving", "final-total", "progressive-total", "loyalty-total"].forEach(
      (id) => ($(id).textContent = "—"),
    );
    $("difference").textContent = "";
    $("rate").textContent = "—";
    $("current-rate").textContent = "—";
    $("loyalty-saving").textContent = "Aguardando pedido válido.";
    $("progressive-saving").textContent = "Aguardando pedido válido.";
    $("next").textContent = "A partir de R$ 1.500,00, desconto de 5%.";
    return;
  }
  rows.forEach((row, index) => {
    const line = result.lines[index];
    row.querySelector(".line-result").textContent =
      `${line.rule}${line.rule === "Fidelidade" ? ` ${result.percent}%` : ` · faixa de ${line.minimumQuantity}+ (${line.referenceQuantity} na referência)`} · Unitário final: ${formatUnit(line.finalUnitPrice)} · Economia: ${format(line.saving)} · Total: ${format(line.finalTotal)}`;
  });
  $("gross").textContent = format(result.gross);
  $("rate").textContent = `${result.percent}%`;
  $("current-rate").textContent = `${result.percent}% sobre o bruto`;
  $("progressive-total").textContent = format(result.progressiveTotal);
  $("loyalty-total").textContent = format(result.loyaltyTotal);
  $("progressive-saving").textContent =
    `Economia: ${format(result.progressiveSaving)}`;
  $("loyalty-saving").textContent = `Economia: ${format(result.loyaltySaving)}`;
  $("winner").textContent = "Melhor desconto por item";
  $("winner-note").textContent =
    "Fidelidade e Progressivo podem coexistir no pedido. Cada item recebe somente o melhor.";
  $("saving").textContent = format(result.saving);
  $("final-total").textContent = format(result.finalTotal);
  $("difference").textContent =
    `${format(result.difference)} de economia adicional em relação ao melhor cenário isolado.`;
  $("next").textContent = result.next
    ? `Faltam ${format(result.next.remaining)} em itens para atingir ${result.next.percent}% de desconto.`
    : "O pedido já alcançou a maior faixa: 18%.";
}
$("add").onclick = addItem;
update();
if (document.modelContext?.registerTool) {
  try {
    Promise.resolve(
      document.modelContext.registerTool({
        name: "read_discount_comparison",
        description: "Lê os descontos por item do pedido atual.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => DiscountCalculator.calculate(readItems(), DiscountRules),
      }),
    ).catch(() => {});
  } catch {}
}
