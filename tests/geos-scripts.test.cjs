const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
const firstParagraph=e=>e.api.editor.children.find(n=>n.tagName==='p');
const text=value=>Buffer.from(value,'ascii');
const font=(style,size=12)=>Buffer.from([23,128+size,0,style]);
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function open(e,records){const f=fixture({records});e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);return f;}
function sample(){return Buffer.concat([font(0),text('x'),font(4),text('2'),font(0),text(' H'),font(2),text('2'),font(0),text('O')]);}

test('script flags preserve ASCII text and combine with other styles without changing encoded sizes',()=>{
    const e=desktop(),d=e.api.decodeGeoWriteText(Buffer.concat([sample(),font(4|64|16|128),text('b')]),'Page');
    assert.equal(d.text,'x2 H2Ob');assert.deepEqual(Array.from(d.runs,r=>r.style),[0,4,0,2,0,212]);assert.ok(d.runs.every(r=>r.pointSize===12&&r.fontId===2));assert.equal(d.scriptWarnings,0);
});

test('DOM script runs shrink and move while normal runs and ruler spacing remain intact',()=>{
    const e=desktop();open(e,new Map([[0,page(Buffer.concat([ruler({spacing:2}),sample(),font(4|64|16|128,18),text('styled')]))]]));
    const p=firstParagraph(e),runs=p.children;assert.equal(p.style.lineHeight,'2');assert.equal(p.style.fontSize,'12px');assert.equal(runs[0].style.fontSize,'12px');assert.equal(runs[0].style.top,undefined);assert.equal(runs[1].style.fontSize,'9px');assert.equal(runs[1].style.top,'-0.35em');assert.equal(runs[1].style.lineHeight,'0');assert.equal(runs[3].style.top,'0.2em');assert.equal(runs[3].style.fontSize,'9px');assert.equal(runs[5].style.fontSize,'13.5px');assert.equal(runs[5].style.fontWeight,'bold');assert.equal(runs[5].style.fontStyle,'italic');assert.equal(runs[5].style.textDecoration,'underline');assert.equal(p.textContent,'x2 H2Ostyled');
});

test('script fonts keep their source ID/size match and scale native or fallback widths for tabs',()=>{
    const e=desktop(),run={fontId:2,pointSize:12,style:4};assert.equal(e.api.geoWriteTextWidth('123',run),13.5);
    e.api.loadedFonts.set('2/12',{family:'Original12',font:{positions:Array.from({length:96},(_,i)=>i*4)}});
    assert.equal(e.api.geoWriteTextWidth('123',run),9);assert.equal(e.api.geoWriteTextWidth('123',{...run,style:2}),9);assert.equal(e.api.geoWriteTextWidth('123',{...run,style:0}),12);
    open(e,new Map([[0,page(sample())]]));assert.equal(firstParagraph(e).children[1].style.fontFamily,'Original12, Arial, sans-serif');
    const r={left:0,right:480,tabs:[{position:240,decimal:true}]};assert.equal(e.api.geoWriteTabWidth(40,240,r,9,18),71);
});

test('conflicting script flags warn and retain normal size, baseline and width',()=>{
    const e=desktop();open(e,new Map([[0,page(Buffer.concat([font(6|64),text('conflict')]))]]));
    const run=firstParagraph(e).children[0];assert.equal(run.style.fontSize,'12px');assert.equal(run.style.top,undefined);assert.equal(run.style.fontWeight,'bold');assert.match(e.api.nativeDocument.data.warnings.join(' '),/conflicting superscript\/subscript/);assert.equal(e.api.geoWriteTextWidth('123',{fontId:2,pointSize:12,style:6}),18);
});

test('page and section navigation resets script style and export preserves plain text and source bytes',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=open(e,new Map([[0,page(sample())],[1,Buffer.concat([text('normal page'),Buffer.from([0])])],[61,Buffer.concat([font(4),text('header'),Buffer.from([0])])]])),before=Buffer.from(f.bytes);
    click(e,'geowrite-next');assert.equal(firstParagraph(e).children[0].style.fontSize,'10px');assert.equal(firstParagraph(e).children[0].style.top,undefined);click(e,'geowrite-next');assert.equal(firstParagraph(e).children[0].style.top,'-0.35em');click(e,'geowrite-prev');click(e,'geowrite-prev');assert.equal(firstParagraph(e).children[1].style.top,'-0.35em');click(e,'geowrite-export');const exported=await e.downloads.at(-1).text();assert.match(exported,/x2 H2O/);assert.ok(!exported.includes('<sup>'));assert.equal(e.storage.get('c64-geos-disk'),saved);assert.deepEqual(f.bytes,before);
});

test('tab prefixes include scaled script runs across font changes without altering source TABs',()=>{
    const e=desktop();open(e,new Map([[0,page(Buffer.concat([ruler({tabs:[{position:240,decimal:true}]}),font(0),text('A\t1'),font(4),text('2'),font(0),text('.30')]))]]));
    const tab=e.api.editor.geosTabs[0];assert.equal(tab.prefix.map(p=>p.text).join(''),'12');assert.equal(tab.prefix.reduce((n,p)=>n+e.api.geoWriteTextWidth(p.text,p.run),0),10.5);assert.equal(tab.node.textContent,'\t');assert.equal(e.api.nativeDocument.data.items[0].text,'A\t12.30');
});
