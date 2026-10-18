const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
const text=value=>Buffer.from(value,'ascii');
const font=style=>Buffer.from([23,146,0,style]);
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function open(e,records){const f=fixture({records});e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);return f;}

test('outline applies hollow styling only to flagged text and reverses fill with reverse style',()=>{
    const e=desktop();open(e,new Map([[0,page(Buffer.concat([font(0),text('normal '),font(8),text('outline words'),font(40),text(' reversed'),font(0),text(' normal')]))]]));
    const runs=e.api.editor.children[0].children;
    assert.notEqual(runs[0].className,'geos-outline');assert.equal(runs[0].style['--geos-outline-fill'],undefined);assert.equal(runs[1].className,'geos-outline');assert.equal(runs[1].style['--geos-outline-fill'],'#eeeeee');assert.equal(runs[1].style.color,'#111111');assert.equal(runs[2].style['--geos-outline-fill'],'#111111');assert.equal(runs[2].style.color,'#eeeeee');assert.equal(runs[2].style.backgroundColor,'#111111');assert.notEqual(runs[3].className,'geos-outline');assert.equal(e.api.editor.textContent,'normal outline words reversed normal');assert.equal(e.api.nativeDocument.data.warnings.length,0);
});

test('outline combines with all supported styles while keeping original fonts, rulers and tab widths',()=>{
    const e=desktop(),styles=[8,72,24,136,12,10,8|32|64|16|128|4];e.api.loadedFonts.set('2/18',{family:'Original18',font:{positions:Array.from({length:96},(_,i)=>i*5)}});
    open(e,new Map([[0,page(Buffer.concat([ruler({spacing:2,tabs:[{position:240,decimal:true}]}),...styles.flatMap(style=>[font(style),text('a')]),font(8),text('\t12.30')]))]]));
    const p=e.api.editor.children[0];assert.equal(p.style.lineHeight,'2');
    for(let i=0;i<styles.length;i++){const run=p.children[i];assert.equal(run.className,'geos-outline');assert.equal(run.style.fontFamily,'Original18, Arial, sans-serif');assert.equal(run.style.fontSize,styles[i]&6?'13.5px':'18px');const r={fontId:2,pointSize:18,style:styles[i]};assert.equal(e.api.geoWriteTextWidth('123',r),e.api.geoWriteTextWidth('123',{...r,style:r.style&~8}));}
    assert.equal(p.children[1].style.fontWeight,'bold');assert.equal(p.children[2].style.fontStyle,'italic');assert.equal(p.children[3].style.textDecoration,'underline');assert.equal(p.children[4].style.top,'-0.35em');assert.equal(p.children[5].style.top,'0.2em');assert.equal(p.children[6].style.backgroundColor,'#111111');assert.equal(e.api.editor.geosTabs[0].prefix.map(p=>p.text).join(''),'12');
    e.api.loadedFonts.clear();assert.equal(e.api.geoWriteTextWidth('123',{fontId:2,pointSize:18,style:8}),e.api.geoWriteTextWidth('123',{fontId:2,pointSize:18,style:0}));
});

test('outline resets across sections and preserves navigation, source bytes, storage and plain-text export',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=open(e,new Map([[0,page(Buffer.concat([font(8),text('outline\r\rtext')]))],[1,Buffer.concat([text('normal page'),Buffer.from([0])])],[61,page(Buffer.concat([font(40),text('header')]))]])),before=Buffer.from(f.bytes);
    click(e,'geowrite-next');assert.notEqual(e.api.editor.children[0].children[0].className,'geos-outline');click(e,'geowrite-next');assert.equal(e.api.editor.children[0].children[0].className,'geos-outline');click(e,'geowrite-prev');click(e,'geowrite-prev');assert.equal(e.api.editor.children[0].children[0].className,'geos-outline');click(e,'geowrite-export');const exported=await e.downloads.at(-1).text();assert.match(exported,/outline\n\ntext/);assert.ok(!exported.includes('<span'));assert.equal(e.storage.get('c64-geos-disk'),saved);assert.deepEqual(f.bytes,before);
});
