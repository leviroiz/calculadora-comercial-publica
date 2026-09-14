(function (root) {
  "use strict";
  function moneyToCents(value) {
    const text = String(value).trim();
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(text))
      throw new Error(
        "Informe um valor sem separador de milhar, com até 2 casas decimais.",
      );
    const [whole, fraction = ""] = text.replace(",", ".").split(".");
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    if (!Number.isSafeInteger(cents) || cents > 100000000000)
      throw new Error("Valor bruto acima do limite de R$ 1 bilhão.");
    return cents;
  }
  function calculate(order, rules) {
    const gross = moneyToCents(order.gross);
    if (gross <= 0) throw new Error("Informe um valor bruto maior que zero.");
    const quantities = order.quantities || {};
    let lines = [];
    for (const [product, raw] of Object.entries(quantities)) {
      if (!Object.hasOwn(rules.progressive, product))
        throw new Error("Referência progressiva desconhecida.");
      if (!/^\d+$/.test(String(raw)))
        throw new Error("Quantidade deve ser inteira entre 0 e 100.000.");
      const quantity = Number(raw);
      if (!Number.isSafeInteger(quantity) || quantity > 100000)
        throw new Error("Quantidade deve ser inteira entre 0 e 100.000.");
      if (!quantity) continue;
      const basePrice = rules.progressive[product].basePrice;
      lines.push({
        product,
        quantity,
        basePrice,
        subtotal: basePrice * quantity,
      });
    }
    const progressiveGross = lines.reduce(
      (sum, line) => sum + line.subtotal,
      0,
    );
    if (progressiveGross > gross)
      throw new Error(
        "O subtotal bruto das referências progressivas ultrapassa o valor bruto do pedido. Confira o valor e as quantidades.",
      );
    const tier = [...rules.loyalty]
      .sort((a, b) => b.minimum - a.minimum)
      .find((t) => gross >= t.minimum);
    const percent = tier?.percent || 0;
    lines.forEach((line) => {
      const official = Object.hasOwn(rules.progressive, line.product)
        ? rules.progressive[line.product]
        : null;
      const selected = [...(official?.tiers || [])]
        .sort((a, b) => b.minimumQuantity - a.minimumQuantity)
        .find((t) => line.quantity >= t.minimumQuantity);
      const loyaltyUnitNumerator = line.basePrice * (100 - percent);
      const progressiveUnit = selected?.unitPrice ?? line.basePrice;
      // Compare exact prices before rounding; ties consistently choose Fidelidade.
      line.rule =
        selected && progressiveUnit * 100 < loyaltyUnitNumerator
          ? "Progressivo"
          : "Fidelidade";
      line.finalUnitPrice =
        line.rule === "Progressivo"
          ? progressiveUnit
          : loyaltyUnitNumerator / 100;
      line.loyaltyTotal =
        line.subtotal - Math.round((line.subtotal * percent) / 100);
      line.progressiveTotal = progressiveUnit * line.quantity;
      line.finalTotal =
        line.rule === "Progressivo" ? line.progressiveTotal : line.loyaltyTotal;
      line.saving = line.subtotal - line.finalTotal;
      line.referenceQuantity = line.quantity;
      line.minimumQuantity = selected?.minimumQuantity ?? null;
    });
    const remainderGross = gross - progressiveGross;
    let remainderSaving = Math.round((remainderGross * percent) / 100);
    let remainderTotal = remainderGross - remainderSaving;
    let finalTotal =
      remainderTotal + lines.reduce((sum, line) => sum + line.finalTotal, 0);
    const standardSaving = gross - finalTotal;
    // Build PIX independently: never include Fidelidade or discount a progressive price.
    // Round once over the PIX-eligible gross, preserving cumulative allocation.
    let pixGross = 0;
    let allocatedPixSaving = 0;
    const pixLines = lines.map((line) => {
      const progressiveWins = line.minimumQuantity !== null &&
        line.progressiveTotal * 100 < line.subtotal * 95;
      let saving;
      if (progressiveWins) {
        saving = line.subtotal - line.progressiveTotal;
      } else {
        pixGross += line.subtotal;
        const cumulativeSaving = Math.round(pixGross * 5 / 100);
        saving = cumulativeSaving - allocatedPixSaving;
        allocatedPixSaving = cumulativeSaving;
      }
      return { ...line, rule: progressiveWins ? "Progressivo" : "PIX",
        finalUnitPrice: progressiveWins ? line.progressiveTotal / line.quantity : line.basePrice * 95 / 100,
        saving, finalTotal: line.subtotal - saving };
    });
    const pixRemainderSaving = Math.round((pixGross + remainderGross) * 5 / 100) - allocatedPixSaving;
    const pixSaving = pixLines.reduce((sum, line) => sum + line.saving, 0) + pixRemainderSaving;
    // Total savings tie: retain normal scenario. Reference tie: PIX (normal: Fidelidade).
    const pixApplied = order.pix === true && pixSaving > standardSaving;
    const hasProgressive = lines.some((line) => line.rule === "Progressivo");
    const hasLoyalty = percent > 0 && (remainderGross > 0 ||
      lines.some((line) => line.rule === "Fidelidade"));
    const condition = pixApplied ? "PIX + progressivo onde for melhor" : hasProgressive
      ? (hasLoyalty ? "Fidelidade e progressivos por referência" : "Progressivo")
      : (percent > 0 ? "Fidelidade" : "Sem desconto");
    const scenarios = {
      normal: { lines, saving: standardSaving, finalTotal, remainderSaving, remainderTotal },
      pix: { lines: pixLines, saving: pixSaving, finalTotal: gross - pixSaving,
        remainderSaving: pixRemainderSaving, remainderTotal: remainderGross - pixRemainderSaving },
    };
    if (pixApplied) {
      lines = pixLines;
      remainderSaving = pixRemainderSaving;
      remainderTotal = remainderGross - remainderSaving;
      finalTotal = gross - pixSaving;
    }
    const next = [...rules.loyalty]
      .sort((a, b) => a.minimum - b.minimum)
      .find((t) => gross < t.minimum);
    return {
      scenarios,
      pixApplied,
      pixSaving,
      standardSaving,
      condition,
      lines,
      gross,
      percent,
      finalTotal,
      saving: gross - finalTotal,
      progressiveGross,
      remainderGross,
      remainderSaving,
      remainderTotal,
      next: next ? { ...next, remaining: next.minimum - gross } : null,
    };
  }
  root.DiscountCalculator = { calculate, moneyToCents };
})(globalThis);
