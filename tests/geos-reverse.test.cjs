const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
const firstParagraph=e=>e.api.editor.children.find(n=>n.tagName==='p');
const text=value=>Buffer.from(value,'ascii');
const font=style=>Buffer.from([23,140,0,style]);
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function open(e,records){const f=fixture({records});e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);return f;}

test('reverse style renders light on dark and ends at the next normal style run',()=>{
    const e=desktop();open(e,new Map([[0,page(Buffer.concat([font(0),text('before '),font(32),text('two words'),font(0),text(' after')]))]]));
    const runs=firstParagraph(e).children;
    assert.equal(runs[0].style.color,'#111111');assert.equal(runs[0].style.backgroundColor,'transparent');assert.equal(runs[1].style.color,'#eeeeee');assert.equal(runs[1].style.backgroundColor,'#111111');assert.equal(runs[1].textContent,'two words');assert.equal(runs[2].style.backgroundColor,'transparent');assert.equal(e.api.editor.textContent,'before two words after');assert.equal(e.api.nativeDocument.data.warnings.length,0);
});

test('reverse combines with bold, italic, underline and script styles without altering ruler spacing',()=>{
    const e=desktop(),styles=[32,32|64,32|16,32|128,32|4,32|2,32|64|16|128|4];
    e.api.loadedFonts.set('2/12',{family:'Original12',font:{positions:Array.from({length:96},(_,i)=>i*4)}});
    open(e,new Map([[0,page(Buffer.concat([ruler({spacing:1}),...styles.flatMap(style=>[font(style),text('a')])]))]]));
    const p=firstParagraph(e);assert.equal(p.style.lineHeight,'1.5');
    for(const [i,run] of p.children.entries()){assert.equal(run.style.color,'#eeeeee');assert.equal(run.style.backgroundColor,'#111111');assert.equal(run.style.fontFamily,'Original12, Arial, sans-serif');assert.equal(run.style.fontSize,styles[i]&6?'9px':'12px');}
    assert.equal(p.children[1].style.fontWeight,'bold');assert.equal(p.children[2].style.fontStyle,'italic');assert.equal(p.children[3].style.textDecoration,'underline');assert.equal(p.children[4].style.top,'-0.35em');assert.equal(p.children[5].style.top,'0.2em');assert.equal(p.children[6].style.fontWeight,'bold');assert.equal(p.children[6].style.textDecoration,'underline');
});

test('reverse retains source styles and does not change native or fallback tab widths',()=>{
    const e=desktop(),d=e.api.decodeGeoWriteText(Buffer.concat([font(32),text('A\t12.30\r'),font(0),text('plain')]),'Page');
    assert.equal(d.text,'A\t12.30\nplain');assert.equal(d.runs[0].style,32);assert.equal(d.runs.at(-1).style,0);assert.equal(d.scriptWarnings,0);
    for(const original of [false,true]){if(original)e.api.loadedFonts.set('2/12',{family:'Test',font:{positions:Array.from({length:96},(_,i)=>i*4)}});for(const style of [0,4,2,64,128]){const run={fontId:2,pointSize:12,style};assert.equal(e.api.geoWriteTextWidth('123',run),e.api.geoWriteTextWidth('123',{...run,style:style|32}));}}
});

test('reverse resets across sections, survives navigation and leaves export, storage and disk bytes unchanged',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=open(e,new Map([[0,page(Buffer.concat([font(32),text('reverse\r\rtext')]))],[1,Buffer.concat([text('normal page'),Buffer.from([0])])],[61,page(Buffer.concat([font(32),text('header')]))]])),before=Buffer.from(f.bytes);
    click(e,'geowrite-next');assert.equal(firstParagraph(e).children[0].style.backgroundColor,'transparent');click(e,'geowrite-next');assert.equal(firstParagraph(e).children[0].style.backgroundColor,'#111111');click(e,'geowrite-prev');click(e,'geowrite-prev');assert.equal(firstParagraph(e).children[0].style.backgroundColor,'#111111');click(e,'geowrite-export');const exported=await e.downloads.at(-1).text();assert.match(exported,/reverse\n\ntext/);assert.ok(!exported.includes('<span'));assert.equal(e.storage.get('c64-geos-disk'),saved);assert.deepEqual(f.bytes,before);
});
