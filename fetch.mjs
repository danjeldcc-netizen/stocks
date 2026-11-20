import fs from 'node:fs';
const syms=(JSON.parse(fs.readFileSync('symbols.json','utf8')).symbols)||[];
const out={app:'mos-desk-quotes',version:1,updated:Date.now(),quotes:{}};
const suf=s=>{const i=s.lastIndexOf('.');return i>0?s.slice(i+1):'';};
const stq=s=>{const m={US:'us',DE:'de',L:'uk',WA:'pl',PR:'cz',F:'de',SW:'ch'};const k=suf(s)||'US';return m[k]?s.slice(0,s.lastIndexOf('.')).toLowerCase()+'.'+m[k]:null;};
for(const s of syms){let q=null;
 try{const r=await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(s)+'?interval=1d&range=3mo',{headers:{'User-Agent':'Mozilla/5.0'}});
 const d=await r.json();const res=d.chart.result[0];const m=res.meta;const ts=res.timestamp||[];
 const cl=(res.indicators.quote[0].close||[]).map((p,i)=>({t:(ts[i]||0)*1000,p})).filter(x=>typeof x.p==='number');const h=cl.slice(-60);
 q={price:m.regularMarketPrice,prev:h.length>1?h[h.length-2].p:(m.chartPreviousClose||null),currency:m.currency||null,name:m.longName||m.shortName||null,exchange:m.fullExchangeName||null,history:h,ts:Date.now(),src:'yahoo'};}catch(e){}
 if(!q){const st=stq(s);if(st){try{const r=await fetch('https://stooq.com/q/l/?s='+st+'&f=sd2t2ohlcv&h&e=csv');const t=await r.text();const rows=t.trim().split('\n');const hd=rows[0].split(',');const v=rows[1].split(',');const c=parseFloat(v[hd.indexOf('Close')]);if(isFinite(c))q={price:c,prev:null,ts:Date.now(),src:'stooq'};}catch(e){}}}
 if(q)out.quotes[s]=q;await new Promise(r=>setTimeout(r,350));}
fs.writeFileSync('quotes.json',JSON.stringify(out));
console.log('Fetched',Object.keys(out.quotes).length,'of',syms.length);