const assert = require('node:assert/strict');
require('../rules.js'); require('../calculator.js');
const rules = DiscountRules, calc = (gross, quantities={}, pix=false, r=rules) => DiscountCalculator.calculate({gross,quantities,pix},r);
let checks=0; const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
eq(calc('1000', {'DEMO-A':4},true).saving,5960);
eq(calc('1000', {'DEMO-A':4},true).scenarios.pix.remainderSaving,3560);
eq(calc('1000', {'DEMO-A':4},true).finalTotal,94040);
eq(calc('1000', {'DEMO-A':4}).saving,2400);
eq(calc('1500', {},true).pixApplied,false);
eq(calc('5000', {'DEMO-A':8},true).condition,'Fidelidade');
for(const tier of rules.loyalty) for(const offset of [-1,0,1]) {
 const gross=tier.minimum+offset;
 const expected=[...rules.loyalty].reverse().find(t=>gross>=t.minimum)?.percent||0;
 eq(calc((gross/100).toFixed(2)).percent,expected);
}
const tie={loyalty:[],progressive:{T:{basePrice:100,tiers:[{minimumQuantity:1,unitPrice:95}]}}};
eq(calc('2',{T:1},true,tie).scenarios.pix.lines[0].rule,'PIX');
eq(calc('1',{T:1},true,tie).pixApplied,false);
for(const bad of ['', '-1','0','1e3','1.001','1,000.00','Infinity','1000000000.01']) {assert.throws(()=>calc(bad)); checks++;}
for(const bad of [-1,1.2,'x',100001]) {assert.throws(()=>calc('1000',{'DEMO-A':bad})); checks++;}
assert.throws(()=>calc('1',{'DEMO-A':1}));checks++;
for(const key of ['unknown','constructor','toString']){assert.throws(()=>calc('1000',{[key]:1}));checks++;}
eq(DiscountCalculator.moneyToCents('0,29'),29);
console.log(`${checks} verificações de cálculo passaram.`);
