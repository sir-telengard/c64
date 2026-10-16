const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page}=require('./helpers/geowrite-fixture.cjs');
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function mount(e,f=fixture()){e.api.previewD64(f.bytes);click(e,'modal-0');return f;}
function open(e){const file=e.api.files[0];e.api.state.selected.add(file.id);e.api.openFile(file);}

test('V2.0 and V2.1 VLIR documents decode pages plus separate header and footer',()=>{
    for(const version of ['2.0','2.1']){const e=desktop(),f=fixture({version,startPage:12}),image=e.api.parseD64(f.bytes),doc=image.readGeoWrite(image.files[0]);assert.equal(doc.items.length,4);assert.equal(doc.items[0].label,'Page 12');assert.equal(doc.items[1].label,'Page 13');assert.equal(doc.items[2].label,'Header');assert.equal(doc.items[3].label,'Footer');assert.equal(doc.items[0].text,'A constructed geoWrite reader test.\nFirst page.\tTab preserved.');assert.equal(doc.warnings.length,0);}
});
test('formatting payload is skipped; text, tabs, line/page breaks and picture placeholders remain',()=>{
    const e=desktop(),ruler=Buffer.alloc(27,65);ruler[0]=17;
    const data=Buffer.concat([Buffer.from('one\t'),ruler,Buffer.from([23,65,66,67]),Buffer.from('two\r'),Buffer.from([16,3,21,0,64,12]),Buffer.from('end\0ignored')]);
    const decoded=e.api.decodeGeoWriteText(data,'Page 1');assert.equal(decoded.text,'one\ttwo\n\n[Picture omitted]\n\n[Page break]\nend');assert.equal(decoded.images,1);assert.equal(decoded.unsupported,0);
});
test('cross-sector escapes and a completely full final sector decode without losing bytes',()=>{
    const e=desktop(),payload=Buffer.concat([Buffer.alloc(252,65),Buffer.from([23,0,0,64]),Buffer.from('B\0')]),f=fixture({records:new Map([[0,payload]])});
    const image=e.api.parseD64(f.bytes);assert.equal(image.readGeoWrite(image.files[0]).items[0].text,'A'.repeat(252)+'B');
    const full=fixture({records:new Map([[0,Buffer.alloc(254,67)]])}),disk=e.api.parseD64(full.bytes);assert.equal(disk.readGeoWrite(disk.files[0]).items[0].text,'C'.repeat(254));
});
test('truncated formatting escapes fail instead of printing payload as text',()=>{
    const e=desktop();for(const data of [[17,0],[23,0,0],[16,1,1,0]])assert.throws(()=>e.api.decodeGeoWriteText(new Uint8Array(data),'Page 1'),/truncated/);
});
test('unknown character codes are replaced and image records are never decoded as text',()=>{
    const e=desktop(),f=fixture({records:new Map([[0,page(Buffer.from([65,128,66]))],[64,Buffer.from([17,1])]])}),image=e.api.parseD64(f.bytes),doc=image.readGeoWrite(image.files[0]);assert.equal(doc.items.length,1);assert.equal(doc.items[0].text,'A\uFFFDB');assert.match(doc.warnings[0],/unsupported/);
});
test('unused/end record markers, missing pages and empty records are handled explicitly',()=>{
    const e=desktop(),f=fixture({records:new Map([[0,page('first')],[2,page('third')]])}),image=e.api.parseD64(f.bytes),doc=image.readGeoWrite(image.files[0]);assert.equal(doc.items[1].label,'Page 3');assert.match(doc.warnings[0],/missing/);
    const end=fixture();end.index.set([0,0],4);const ended=e.api.parseD64(end.bytes);assert.equal(ended.readGeoWrite(ended.files[0]).items.length,1);
    const empty=fixture({records:new Map()});const no=e.api.parseD64(empty.bytes);assert.throws(()=>no.readGeoWrite(no.files[0]),/No readable/);
});
test('invalid pointers, cyclic/overlapping chains, bad index and final length are rejected',()=>{
    const e=desktop();for(const mutate of [f=>f.index.set([36,0],2),f=>f.index.set([0,5],2),f=>f.index[0]=1,f=>f.sector(...f.locations.get(0)[0]).set(f.locations.get(0)[0]),f=>f.index.set(f.locations.get(0)[0],4),f=>f.sector(...f.locations.get(0)[0]).set([0,0]),f=>f.index.set([18,0],2)]){
        const f=fixture();mutate(f);const disk=e.api.parseD64(f.bytes);assert.throws(()=>disk.readGeoWrite(disk.files[0]));
    }
});
test('error table flags on metadata or page sectors prevent decoding',()=>{
    const e=desktop();for(const index of [0,1,2]){const f=fixture(),bytes=Buffer.concat([f.bytes,Buffer.alloc(683,1)]);bytes[174848+index]=5;const disk=e.api.parseD64(bytes);assert.throws(()=>disk.readGeoWrite(disk.files[0]),/disk error/);}
});
test('unsupported versions and non-documents continue to show native-file information',()=>{
    for(const version of ['1.1','3.0']){const e=desktop();mount(e,fixture({version}));open(e);assert.equal(e.api.state.modal.title,'Native GEOS file');assert.equal(e.api.nativeDocument,null);}
    const e=desktop(),f=fixture();f.dir[24]=6;mount(e,f);open(e);assert.equal(e.api.state.modal.title,'Native GEOS file');
});
test('viewer is read-only, navigates pages, returns from Details and exports all sections',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk');mount(e);open(e);assert.equal(e.api.state.modal.kind,'geowrite');assert.equal(e.api.editor.readOnly,true);assert.equal(e.api.controls.children.find(n=>n.dataset.key==='geowrite-prev').disabled,true);
    click(e,'geowrite-next');assert.match(e.api.editor.value,/Second page/);click(e,'geowrite-details');assert.match(e.api.editor.value,/page layout/);e.key('Escape');assert.equal(e.api.state.modal.kind,'geowrite');assert.equal(e.api.nativeDocument.index,1);
    click(e,'geowrite-export');const output=await e.downloads.at(-1).text();assert.match(output,/--- Page 1 ---/);assert.match(output,/--- Header ---\nSample header/);assert.equal(e.storage.get('c64-geos-disk'),saved);assert.equal(e.unload().prevented,false);
    e.key('Escape');assert.equal(e.api.nativeDocument,null);assert.equal(e.document.activeElement.dataset.key,'file-0');e.api.act('web-disk');assert.equal(e.storage.get('c64-geos-disk'),saved);
});
test('decode errors display details without losing either disk',()=>{
    const e=desktop(),f=fixture(),saved=e.storage.get('c64-geos-disk');f.index[0]=1;mount(e,f);open(e);assert.equal(e.api.state.modal.title,'Document not opened');click(e,'modal-0');assert.match(e.api.editor.value,/VLIR index/);e.key('Escape');assert.equal(e.api.nativeDocument,null);e.api.act('web-disk');assert.ok(e.file('PAINT'));assert.equal(e.storage.get('c64-geos-disk'),saved);
});
test('a pending image read cannot interrupt an open document',async()=>{
    const e=desktop();mount(e);let resolve;e.api.d64Picker.files=[{size:174848,name:'late.d64',arrayBuffer:()=>new Promise(done=>resolve=done)}];const pending=e.api.d64Picker.listeners.get('change')[0]();open(e);resolve(fixture().bytes);await pending;assert.equal(e.api.state.modal.kind,'geowrite');assert.ok(e.api.nativeDocument);
});
for(const [diskName,count] of [['collette.s1.d64',9],['collette.s2.d64',17]]){
    const diskPath=path.resolve(__dirname,'../GEOS/research',diskName);
    test('public archive document smoke check: '+diskName,{skip:!fs.existsSync(diskPath)},()=>{
        const e=desktop(),disk=e.api.parseD64(fs.readFileSync(diskPath)),docs=disk.files.filter(f=>f.geosType===7&&f.className==='Write Image V2.1');assert.equal(docs.length,count);
        for(const file of docs){const doc=disk.readGeoWrite(file);assert.ok(doc.items.length>0);assert.ok(doc.items.some(item=>item.text.length>0));assert.equal(doc.warnings.length,0);}
        if(diskName==='collette.s1.d64'){const doc=disk.readGeoWrite(docs.find(f=>f.name==='Font Editor.doc'));assert.equal(doc.items.length,8);assert.ok(doc.items[0].text.startsWith('Font Editor 2.5'));}
    });
}
