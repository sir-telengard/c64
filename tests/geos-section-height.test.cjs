const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page}=require('./helpers/geowrite-fixture.cjs');
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function open(e,options={}){const f=fixture(options);e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);return f;}
const sections=e=>e.api.editor.children.filter(n=>n.tagName==='section');

test('stored section heights decode little-endian in both supported versions',()=>{
    for(const version of ['2.0','2.1']){const e=desktop(),f=fixture({version,pageHeight:1024,headerHeight:258,footerHeight:513}),disk=e.api.parseD64(f.bytes),doc=disk.readGeoWrite(disk.files[0]);assert.equal(doc.storedHeaderHeight,258);assert.equal(doc.headerHeight,258);assert.equal(doc.storedFooterHeight,513);assert.equal(doc.footerHeight,513);assert.equal(doc.warnings.length,0);}
});

test('zero caches retain natural sections, valid totals reserve space, invalid totals warn and reset',()=>{
    for(const [headerHeight,footerHeight,valid] of [[0,0,true],[100,652,true],[752,0,true],[400,400,false],[753,0,false],[0,65535,false]]){
        const e=desktop();open(e,{headerHeight,footerHeight});const d=e.api.nativeDocument.data,[h,f]=sections(e);assert.equal(h.style.minHeight,(valid?headerHeight:0)+'px');assert.equal(f.style.minHeight,(valid?footerHeight:0)+'px');assert.equal(d.warnings.length,valid?0:1);if(!valid)assert.match(d.warnings[0],/natural section heights/);assert.equal(h.style.height,undefined);assert.equal(f.style.overflow,undefined);
    }
});

test('reserved heights apply only to repeated sections and stay suppressed on title pages',()=>{
    const e=desktop();open(e,{hasTitlePage:true,startPage:12,headerHeight:100,footerHeight:80});assert.equal(sections(e).length,0);click(e,'geowrite-next');assert.deepEqual(sections(e).map(n=>n.style.minHeight),['100px','80px']);click(e,'geowrite-details');e.key('Escape');assert.deepEqual(sections(e).map(n=>n.style.minHeight),['100px','80px']);click(e,'geowrite-next');assert.equal(sections(e).length,0);assert.equal(e.api.editor.geosPageSpacer,undefined);click(e,'geowrite-prev');assert.deepEqual(sections(e).map(n=>n.style.minHeight),['100px','80px']);
});

test('missing sections reserve no phantom space while an empty present section honors its cache',()=>{
    for(const record of [null,61,62]){const e=desktop(),records=new Map([[0,page('Body')]]);if(record!==null)records.set(record,page(''));open(e,{records,headerHeight:80,footerHeight:60});assert.equal(sections(e).length,record===null?0:1);if(record!==null)assert.equal(sections(e)[0].style.minHeight,(record===61?80:60)+'px');assert.equal(e.api.editor.textContent,'Body');}
});

test('page spacing accounts for reserved section heights under transforms and expands for overflow',()=>{
    const e=desktop();open(e,{headerHeight:100,footerHeight:80,pageHeight:752});const editor=e.api.editor,[header,footer]=sections(e),spacer=editor.geosPageSpacer;editor.offsetWidth=100;editor.getBoundingClientRect=()=>({width:200});header.getBoundingClientRect=()=>({top:50,height:200});let body=40;
    footer.getBoundingClientRect=()=>({top:50+(100+body+parseFloat(spacer.style.height||0))*2,height:160});e.api.layoutGeoWritePage(editor,752);assert.equal(spacer.style.height,'532px');body=800;e.api.layoutGeoWritePage(editor,752);assert.equal(spacer.style.height,'0px');assert.equal(header.style.minHeight,'100px');assert.equal(footer.style.minHeight,'80px');
});

test('reserved section heights preserve original text, source bytes, storage and export',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=open(e,{headerHeight:100,footerHeight:80}),before=Buffer.from(f.bytes);click(e,'geowrite-next');click(e,'geowrite-export');const output=await e.downloads.at(-1).text();assert.equal(output.split('Sample header').length-1,1);assert.equal(output.split('Sample footer').length-1,1);assert.ok(!output.includes('min-height'));assert.deepEqual(f.bytes,before);assert.equal(e.storage.get('c64-geos-disk'),saved);
});
