const assert=require('node:assert/strict');require('../rules.js');require('../calculator.js');
let checks=0; const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
// Independent oracle: choose the larger monetary benefit per reference,
// then round PIX once on all eligible gross value.
for(const gross of [100000,150000,300000,500000,500001]) for(const quantity of [0,3,4,7,8,12]) for(const pix of [false,true]) {
 const quantities=Object.fromEntries(Object.keys(DiscountRules.progressive).map(k=>[k,quantity]));
 const subtotal=Object.values(DiscountRules.progressive).reduce((s,r)=>s+r.basePrice*quantity,0);
 if(subtotal>gross)continue;
 const pct=[...DiscountRules.loyalty].reverse().find(t=>gross>=t.minimum)?.percent||0;
 let normalSaving=Math.round((gross-subtotal)*pct/100), pixBase=gross-subtotal, progSaving=0;
 for(const rule of Object.values(DiscountRules.progressive)) {
  const base=rule.basePrice*quantity;
  const unit=[...rule.tiers].reverse().find(t=>quantity>=t.minimumQuantity)?.unitPrice??rule.basePrice;
  const progressive=base-unit*quantity;
  normalSaving+=Math.max(progressive,Math.round(base*pct/100));
  if(progressive*100>base*5)progSaving+=progressive;else pixBase+=base;
 }
 const pixSaving=progSaving+Math.round(pixBase*5/100);
 const r=DiscountCalculator.calculate({gross:(gross/100).toFixed(2),quantities,pix},DiscountRules);
 eq(r.standardSaving,normalSaving);eq(r.pixSaving,pixSaving);
 eq(r.saving,pix?Math.max(normalSaving,pixSaving):normalSaving);
 eq(r.pixApplied,pix&&pixSaving>normalSaving);
 for(const s of Object.values(r.scenarios)) {eq(s.lines.reduce((a,l)=>a+l.finalTotal,0)+s.remainderTotal,s.finalTotal);eq(gross-s.finalTotal,s.saving);}
}
console.log(`${checks} verificações de auditoria passaram.`);
