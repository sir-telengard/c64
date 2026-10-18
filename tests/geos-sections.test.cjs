const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
const text=value=>Buffer.from(value,'ascii');
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function open(e,options){const f=fixture(options);e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);return f;}
const regions=e=>e.api.editor.children.filter(n=>n.tagName==='section');

test('document title flag is independent of NLQ and other flags in both supported versions',()=>{
    for(const version of ['2.0','2.1'])for(const flags of [0,64,128,192,255]){
        const e=desktop(),f=fixture({version,startPage:12});f.header[139]=flags;const disk=e.api.parseD64(f.bytes),d=disk.readGeoWrite(disk.files[0]);assert.equal(d.hasTitlePage,!!(flags&128));assert.equal(d.items[0].label,'Page 12');assert.equal(d.warnings.length,0);
    }
});

test('normal pages repeat header/body/footer in source order with separately accessible sections',()=>{
    const e=desktop();open(e,{startPage:12});assert.deepEqual(e.api.editor.children.map(n=>n.tagName),['section','p','p','section']);assert.deepEqual(regions(e).map(n=>n.attributes['aria-label']),['Header','Footer']);assert.match(e.api.editor.children[0].textContent,/Sample header/);assert.match(e.api.editor.children.at(-1).textContent,/Sample footer/);assert.ok(e.api.editor.textContent.indexOf('Sample header')<e.api.editor.textContent.indexOf('First page'));
    click(e,'geowrite-next');assert.equal(regions(e).length,2);assert.match(e.api.editor.textContent,/Second page/);click(e,'geowrite-next');assert.equal(regions(e).length,0);assert.equal(e.api.editor.textContent,'Sample header');click(e,'geowrite-next');assert.equal(e.api.editor.textContent,'Sample footer');assert.equal(e.api.controls.children.find(n=>n.dataset.key==='geowrite-next').disabled,true);
});

test('title page suppresses repeated sections only on physical page zero and preserves Details navigation',()=>{
    const e=desktop();open(e,{hasTitlePage:true,startPage:12});assert.equal(regions(e).length,0);assert.ok(!e.api.editor.textContent.includes('Sample header'));click(e,'geowrite-next');assert.equal(regions(e).length,2);click(e,'geowrite-details');assert.match(e.api.editor.value,/title-page flag/);e.key('Escape');assert.equal(e.api.nativeDocument.index,1);assert.equal(regions(e).length,2);click(e,'geowrite-prev');assert.equal(regions(e).length,0);
    const missing=desktop();open(missing,{hasTitlePage:true,records:new Map([[1,page('Surviving page')],[61,page('Header')]])});assert.equal(regions(missing).length,1);assert.match(missing.api.nativeDocument.data.items[0].label,/Page 2/);
});

test('missing header/footer records create no placeholders and empty sections retain their source',()=>{
    for(const record of [null,61,62]){const e=desktop(),records=new Map([[0,page('Body')]]);if(record!==null)records.set(record,page(''));open(e,{records});assert.equal(regions(e).length,record===null?0:1);assert.equal(e.api.editor.textContent,'Body');}
});

test('repeated sections retain independent fonts, styles, rulers and tab layout',()=>{
    const e=desktop();e.api.loadedFonts.set('2/12',{family:'Original12',font:{positions:Array.from({length:96},(_,i)=>i*4)}});
    open(e,{records:new Map([[0,page('Body')],[61,page(Buffer.concat([ruler({align:1,spacing:1,tabs:[240]}),Buffer.from([23,140,0,40]),text('H\t12')]))],[62,page(Buffer.concat([ruler({align:2,spacing:2}),text('Footer')]))]])});
    const [header,footer]=regions(e),hp=header.children[0];assert.equal(hp.style.textAlign,'center');assert.equal(hp.style.lineHeight,'1.5');assert.equal(hp.children[0].className,'geos-outline');assert.equal(hp.children[0].style.backgroundColor,'#111111');assert.equal(hp.children[0].style.fontFamily,'Original12, Arial, sans-serif');assert.equal(footer.children[0].style.textAlign,'right');assert.equal(footer.children[0].style.lineHeight,'2');assert.equal(e.api.editor.children.find(n=>n.tagName==='p').style.lineHeight,'1');assert.equal(e.api.editor.geosTabs.length,1);assert.equal(e.api.editor.geosTabs[0].block,hp);
});

test('repeating sections leaves plain-text export unduplicated and both disks unchanged',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=open(e,{}),before=Buffer.from(f.bytes);click(e,'geowrite-next');click(e,'geowrite-prev');click(e,'geowrite-export');const output=await e.downloads.at(-1).text();assert.equal(output.split('Sample header').length-1,1);assert.equal(output.split('Sample footer').length-1,1);assert.match(output,/--- Header ---/);assert.match(output,/--- Footer ---/);assert.deepEqual(f.bytes,before);assert.equal(e.storage.get('c64-geos-disk'),saved);e.key('Escape');e.api.act('web-disk');assert.equal(e.storage.get('c64-geos-disk'),saved);
});

test('a header picture is decoded once and rendered again after page navigation',()=>{
    const e=desktop();open(e,{records:new Map([[0,page('First')],[1,page('Second')],[61,page(Buffer.from([16,1,1,0,64]))],[64,Buffer.from([1,1,0,1,255])]])});
    const bitmap=e.api.nativeDocument.data.items.find(i=>i.record===61).runs[0].bitmap;
    for(let i=0;i<2;i++){const image=regions(e)[0].children[0].children[0];assert.equal(image.tagName,'canvas');assert.equal(image.width,8);assert.equal(image.height,1);assert.equal(image.attributes.role,'img');assert.equal(e.api.nativeDocument.data.items.find(i=>i.record===61).runs[0].bitmap,bitmap);if(i===0)click(e,'geowrite-next');}
    assert.equal(e.api.nativeDocument.data.warnings.length,0);
});
