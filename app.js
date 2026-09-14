"use strict";
const $ = (id) => document.getElementById(id);
const format = (cents) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
for (const [ref, rule] of Object.entries(DiscountRules.progressive)) {
  const row = document.createElement("div");
  row.className = "progressive-card";
  row.innerHTML = `<div><strong>${rule.name}</strong><p>${ref} · Base fictícia: ${format(rule.basePrice)}</p></div><label for="qty-${ref}">Quantidade<input id="qty-${ref}" data-ref="${ref}" inputmode="numeric" type="number" min="0" max="100000" step="1" value="0"></label><div class="line-result" id="result-${ref}"></div>`;
  $("items").append(row);
}
function readOrder() {
  if (
    [...document.querySelectorAll("[data-ref]")].some(
      (input) => input.validity.badInput,
    )
  )
    throw new Error("Informe quantidades inteiras válidas.");
  return {
    gross: $("order-gross").value,
    pix: $("payment-pix").checked,
    quantities: Object.fromEntries(
      [...document.querySelectorAll("[data-ref]")].map((input) => [
        input.dataset.ref,
        input.value === "" ? "0" : input.value,
      ]),
    ),
  };
}
function update() {
  $("pix-scenario").hidden = true;
  $("normal-scenario").hidden = true;
  document
    .querySelectorAll(".line-result")
    .forEach((el) => (el.textContent = ""));
  let r;
  try {
    r = DiscountCalculator.calculate(readOrder(), DiscountRules);
  } catch (e) {
    $("error").textContent =
      $("order-gross").value ||
      [...document.querySelectorAll("[data-ref]")].some(
        (el) => el.value && el.value !== "0",
      )
        ? e.message
        : "";
    [
      "gross",
      "progressive-gross",
      "remainder-gross",
      "remainder-saving",
      "remainder-total",
      "final-total",
      "saving",
      "current-rate",
    ].forEach((id) => ($(id).textContent = "—"));
    $("winner").textContent = "Informe um pedido válido";
    $("winner-note").textContent =
      "Confira o valor bruto e as quantidades para calcular.";
    $("next").textContent = "A partir de R$ 1.500,00, desconto de 5%.";
    return;
  }
  $("error").textContent = "";
  const normalProgressive = r.scenarios.normal.lines.filter(line => line.rule === "Progressivo").reduce((sum, line) => sum + line.saving, 0);
  $("normal-progressive-saving").textContent = format(normalProgressive);
  $("normal-loyalty-saving").textContent = format(r.standardSaving - normalProgressive);
  $("normal-saving").textContent = format(r.standardSaving);
  $("normal-total").textContent = format(r.scenarios.normal.finalTotal);
  $("normal-scenario").hidden = false;
  for (const line of r.lines) {
    const percentage =
      line.rule === "PIX" ? "5%" : line.rule === "Fidelidade"
        ? `${r.percent}%`
        : `${((1 - line.finalUnitPrice / line.basePrice) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% aprox. · faixa ${line.minimumQuantity}+`;
    $(`result-${line.product}`).textContent =
      `Bruto: ${format(line.subtotal)} · ${line.rule} ${percentage} · Desconto: ${format(line.saving)} · Total: ${format(line.finalTotal)}`;
  }
  for (const [id, value] of Object.entries({
    gross: r.gross,
    "progressive-gross": r.progressiveGross,
    "remainder-gross": r.remainderGross,
    "remainder-saving": r.remainderSaving,
    "remainder-total": r.remainderTotal,
    "final-total": r.finalTotal,
    saving: r.saving,
  }))
    $(id).textContent = format(value);
  $("current-rate").textContent = `${r.percent}% sobre o bruto`;
  $("winner").textContent = `Melhor condição: ${r.pixApplied ? "Cenário PIX + Progressivo" : r.condition}`;
  if ($("payment-pix").checked) {
    const pix = r.scenarios.pix;
    $("pix-progressive-saving").textContent = format(pix.lines.filter((line) => line.rule === "Progressivo").reduce((sum, line) => sum + line.saving, 0));
    $("pix-reference-saving").textContent = format(pix.lines.filter((line) => line.rule === "PIX").reduce((sum, line) => sum + line.saving, 0));
    $("pix-remainder-saving").textContent = format(pix.remainderSaving);
    $("pix-total-saving").textContent = format(pix.saving);
    $("pix-final-total").textContent = format(pix.finalTotal);
    $("pix-scenario").hidden = false;
  }
  $("remainder-label").textContent = r.pixApplied ? "Desconto PIX no restante" : "Desconto Fidelidade no restante";
  $("winner-note").textContent =
    ($("payment-pix").checked
      ? `Economia no cenário normal: ${format(r.standardSaving)}; Economia no cenário PIX + Progressivo: ${format(r.pixSaving)}. ${r.standardSaving === r.pixSaving ? "Empate; mantido o cenário normal." : r.pixApplied ? "O cenário PIX + Progressivo venceu por maior economia." : "O cenário normal venceu por maior economia."} `
      : "PIX desmarcado; cenário normal aplicado. ") +
    (r.pixApplied
      ? "Cada referência recebe PIX 5% ou progressivo, o que for maior. Restante: PIX 5%. Fidelidade não entra neste cenário."
      : `Cada referência recebe Fidelidade ou progressivo. Restante: Fidelidade ${r.percent}%.`);
  $("next").textContent = r.next
    ? `Faltam ${format(r.next.remaining)} no valor bruto para atingir ${r.next.percent}%.`
    : "O pedido já alcançou a maior faixa: 18%.";
}
$("order-gross").addEventListener("input", update);
$("payment-pix").addEventListener("change", update);
$("items").addEventListener("input", update);
update();
if (document.modelContext?.registerTool) {
  try {
    Promise.resolve(
      document.modelContext.registerTool({
        name: "read_discount_comparison",
        description:
          "Lê o cálculo do pedido bruto e suas referências progressivas.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => DiscountCalculator.calculate(readOrder(), DiscountRules),
      }),
    ).catch(() => {});
  } catch {}
}
