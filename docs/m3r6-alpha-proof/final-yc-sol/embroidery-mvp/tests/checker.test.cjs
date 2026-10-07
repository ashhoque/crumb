const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../checker.html'),'utf8');const ctx={};vm.createContext(ctx);vm.runInContext(html.match(/<script id="core">([\s\S]*?)<\/script>/)[1],ctx);
const head='order_id,garment_size,thread_colour,quantity\n';let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('filled values and quantity unchecked',()=>assert.equal(ctx.checkCSV(head+'a,?,unknown,0').incomplete.length,0));
for(const [name,row,expected]of [['size','a,,Navy,1',['garment_size']],['colour','a,L,,1',['thread_colour']],['both','a, ,\t,1',['garment_size','thread_colour']],['quoted whitespace','a," \t ","  ",1',['garment_size','thread_colour']]])test(name,()=>assert.deepEqual(Array.from(ctx.checkCSV(head+row).incomplete[0].missing),expected));
test('quoted comma, escaped quote, CRLF, BOM, multiline and repeated ID',()=>{const r=ctx.checkCSV('\uFEFF'+head.replace('\n','\r\n')+'"a,b",,"Navy, blue",1\r\n"a,b",L,"\"\"navy\"\"\nblue",2\r\n');assert.equal(r.total,2);assert.equal(r.incomplete[0].orderId,'a,b');assert.equal(r.incomplete[0].record,1);});
test('reordered headers and extra columns',()=>assert.equal(ctx.checkCSV('quantity,thread_colour,order_id,extra,garment_size\n1,Navy,a,z,').incomplete.length,1));
test('fictional sample expectations',()=>{const r=ctx.checkCSV(fs.readFileSync(path.join(__dirname,'sample.csv'),'utf8'));assert.equal(r.total,4);assert.equal(r.incomplete.length,3);assert.equal(r.incomplete[2].missing.length,2);});
const invalid=['',head,'order_id,garment_size,quantity\na,L,1','order_id,garment_size,thread_colour,quantity,quantity\na,L,x,1,1',head+'a,L,"x,1',head+'a,L,x"y,1',head+'a,L,"x"oops,1',head+'a,L,x',head+'a,L,x,1,extra',head+'a,L,x,1\n\n',head+'a,L,\0,1'];
invalid.forEach((text,i)=>test('reject invalid '+i,()=>assert.throws(()=>ctx.checkCSV(text))));
test('99 accepted / 100 rejected',()=>{assert.equal(ctx.checkCSV(head+Array(99).fill('a,L,x,1').join('\n')).total,99);assert.throws(()=>ctx.checkCSV(head+Array(100).fill('a,L,x,1').join('\n')));});
console.log(passed+' known-answer tests passed.');
