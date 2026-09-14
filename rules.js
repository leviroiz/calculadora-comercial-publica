/* Dados demonstrativos fictícios. Valores em centavos. */
globalThis.DiscountRules = {
  loyalty: [
    { minimum: 150000, percent: 5 },
    { minimum: 300000, percent: 10 },
    { minimum: 500000, percent: 18 },
  ],
  progressive: {
    "DEMO-A": { name: "Caderno criativo", basePrice: 7200, tiers: [
      { minimumQuantity: 4, unitPrice: 6600 }, { minimumQuantity: 8, unitPrice: 6000 }] },
    "DEMO-B": { name: "Estojo modular", basePrice: 4800, tiers: [
      { minimumQuantity: 4, unitPrice: 4500 }, { minimumQuantity: 8, unitPrice: 4200 }] },
    "DEMO-C": { name: "Organizador de mesa", basePrice: 4800, tiers: [
      { minimumQuantity: 4, unitPrice: 4500 }, { minimumQuantity: 8, unitPrice: 4200 }] },
    "DEMO-D": { name: "Bloco de notas", basePrice: 3200, tiers: [
      { minimumQuantity: 4, unitPrice: 3000 }, { minimumQuantity: 8, unitPrice: 2800 }] },
  },
};
