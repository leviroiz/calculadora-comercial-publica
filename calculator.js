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
    if (!Number.isSafeInteger(cents) || cents > 100000000)
      throw new Error("Valor unitário acima do limite de R$ 1.000.000.");
    return cents;
  }
  function calculate(items, rules) {
    const quantities = new Map();
    const lines = items.map((item) => {
      const product = String(item.product).trim();
      const quantity = Number(item.quantity);
      if (!product) throw new Error("Preencha o produto de todos os itens.");
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000)
        throw new Error("Quantidade deve ser inteira entre 1 e 100.000.");
      const official = Object.hasOwn(rules.progressive, product)
        ? rules.progressive[product]
        : null;
      const cents = official ? official.basePrice : moneyToCents(item.price);
      quantities.set(product, (quantities.get(product) || 0) + quantity);
      return {
        product,
        quantity,
        basePrice: cents,
        subtotal: cents * quantity,
      };
    });
    const gross = lines.reduce((sum, line) => sum + line.subtotal, 0);
    if (!Number.isSafeInteger(gross) || gross > 100000000000)
      throw new Error("Pedido acima do limite de R$ 1 bilhão.");
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
        .find((t) => quantities.get(line.product) >= t.minimumQuantity);
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
      line.referenceQuantity = quantities.get(line.product);
      line.minimumQuantity = selected?.minimumQuantity ?? null;
    });
    const loyaltyTotal = lines.reduce((sum, line) => sum + line.loyaltyTotal, 0);
    const progressiveTotal = lines.reduce(
      (sum, line) => sum + line.progressiveTotal,
      0,
    );
    const finalTotal = lines.reduce((sum, line) => sum + line.finalTotal, 0);
    const next = [...rules.loyalty]
      .sort((a, b) => a.minimum - b.minimum)
      .find((t) => gross < t.minimum);
    return {
      lines,
      gross,
      percent,
      finalTotal,
      saving: gross - finalTotal,
      loyaltySaving: gross - loyaltyTotal,
      progressiveSaving: gross - progressiveTotal,
      loyaltyTotal,
      progressiveTotal,
      difference: Math.min(loyaltyTotal, progressiveTotal) - finalTotal,
      next: next ? { ...next, remaining: next.minimum - gross } : null,
    };
  }
  root.DiscountCalculator = { calculate, moneyToCents };
})(globalThis);
