const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page}=require('./helpers/geowrite-fixture.cjs');
function fontData(){
    const rowBytes=36,data=Buffer.alloc(200+rowBytes*12);data[0]=8;data.writeUInt16LE(rowBytes,1);data[3]=12;data.writeUInt16LE(8,4);data.writeUInt16LE(200,6);
    for(let c=0;c<96;c++)data.writeUInt16LE(c*3,8+c*2);
    for(let c=1;c<95;c++)for(let y=0;y<3;y++)for(let x=0;x<3;x++)if([5,2,7][y]&(4>>x)){const bit=c*3+x;data[200+y*rowBytes+(bit>>3)]|=128>>(bit&7);}
    return data;
}
function fontDisk(){const f=fixture({records:new Map([[12,fontData()]])});f.dir[24]=8;f.header[69]=8;f.header.fill(0,97,160);f.header.writeUInt16LE(2,128);f.header.writeUInt16LE(140,130);return f;}
function click(e,key){const b=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(b,key);b.click();}
function openDoc(e){const f=fixture({records:new Map([[0,page(Buffer.concat([Buffer.from([23,140,0,0]),Buffer.from('ABC')]))]])});e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);}
test('font records preserve glyph indices, row bits, height and baseline',()=>{
    const e=desktop(),font=e.api.decodeGeosFont(new Uint8Array(fontData()),2,12,'Test');assert.equal(font.height,12);assert.equal(font.baseline,8);assert.equal(font.positions[1]-font.positions[0],3);assert.equal(font.positions.length,96);assert.equal(font.bitmap.length,432);assert.equal(font.fontId,2);
    const disk=e.api.parseD64(fontDisk().bytes).readFonts();assert.equal(disk.fonts.length,1);assert.equal(disk.warnings.length,0);assert.equal(disk.fonts[0].pointSize,12);
});
test('bad font layouts, IDs, glyph indices and truncated rows are rejected',()=>{
    const e=desktop();for(const change of [d=>d[3]=18,d=>d[0]=12,d=>d.writeUInt16LE(0,1),d=>d.writeUInt16LE(0,4),d=>d.writeUInt16LE(199,6),d=>d.writeUInt16LE(65535,10),d=>d.writeUInt16LE(0,14)]){const d=fontData();change(d);assert.throws(()=>e.api.decodeGeosFont(new Uint8Array(d),2,12,'Test'));}
    assert.throws(()=>e.api.decodeGeosFont(new Uint8Array(fontData().subarray(0,500)),2,12,'Test'));assert.throws(()=>e.api.decodeGeosFont(new Uint8Array(fontData()),1024,12,'Test'));
});
test('TrueType wrapper has valid table extents, checksums, cmap and GEOS advance widths',()=>{
    const e=desktop(),font=e.api.decodeGeosFont(new Uint8Array(fontData()),2,12,'Test'),bytes=e.api.geosTrueType(font),v=new DataView(bytes.buffer),tables=new Map();assert.equal(v.getUint32(0),0x10000);
    let total=0;for(let i=0;i<bytes.length;i+=4)total=(total+v.getUint32(i))>>>0;assert.equal(total,0xb1b0afba);
    for(let i=0;i<v.getUint16(4);i++){const o=12+i*16,tag=String.fromCharCode(...bytes.subarray(o,o+4)),offset=v.getUint32(o+8),length=v.getUint32(o+12);assert.ok(offset+length<=bytes.length);assert.equal(offset%4,0);tables.set(tag,{offset,length});}
    assert.equal(tables.get('head').length,54);assert.equal(tables.get('hhea').length,36);assert.equal(tables.get('maxp').length,32);assert.equal(tables.get('OS/2').length,78);assert.equal(v.getUint16(tables.get('head').offset+18),768);assert.equal(v.getInt16(tables.get('hhea').offset+4),576);assert.equal(v.getInt16(tables.get('hhea').offset+6),-192);
    const metrics=tables.get('hmtx').offset;for(let i=1;i<=95;i++)assert.equal(v.getUint16(metrics+i*4),192);assert.equal(v.getUint16(tables.get('cmap').offset+12),4);
});
test('loading fonts preserves both disks and applies the exact ID/size family to document spans',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk');await e.api.loadFontImage(fontDisk().bytes);assert.equal(e.api.loadedFonts.size,1);assert.equal(e.document.fonts.size,1);assert.equal(e.storage.get('c64-geos-disk'),saved);e.api.closeModal();openDoc(e);
    const family=e.api.loadedFonts.get('2/12').family;assert.equal(e.api.editor.children[0].children[0].style.fontFamily,family+', Arial, sans-serif');click(e,'geowrite-details');assert.match(e.api.editor.value,/ID 2, 12 pt: READ ME/);e.key('Escape');e.key('Escape');e.api.act('web-disk');assert.equal(e.api.loadedFonts.size,1);assert.equal(e.storage.get('c64-geos-disk'),saved);
});
test('missing and failed browser fonts retain the reader fallback; duplicate IDs keep the first face',async()=>{
    const missing=desktop();openDoc(missing);assert.equal(missing.api.editor.children[0].children[0].style.fontFamily,undefined);
    const failed=desktop({fontLoad:()=>{throw Error('sanitizer rejected');}});await failed.api.loadFontImage(fontDisk().bytes);assert.equal(failed.api.loadedFonts.size,0);failed.api.closeModal();openDoc(failed);assert.equal(failed.api.editor.children[0].children[0].style.fontFamily,undefined);
    const e=desktop();await e.api.loadFontImage(fontDisk().bytes);const original=e.api.loadedFonts.get('2/12');e.api.closeModal();await e.api.loadFontImage(fontDisk().bytes);assert.equal(e.api.loadedFonts.get('2/12'),original);assert.equal(e.document.fonts.size,1);
    const noApi=desktop({noFontAPI:true});await noApi.api.loadFontImage(fontDisk().bytes);assert.equal(noApi.api.state.modal.title,'Fonts unavailable');
});
test('corrupt font chains, ID tables and recorded errors do not register bad fonts',async()=>{
    for(const change of [f=>f.header.writeUInt16LE(204,130),f=>f.sector(...f.locations.get(12)[0]).set(f.locations.get(12)[0]),f=>{f.bytes=Buffer.concat([f.bytes,Buffer.alloc(683,1)]);f.bytes[174848]=5;}]){const e=desktop(),f=fontDisk();change(f);const parsed=e.api.parseD64(f.bytes).readFonts();assert.equal(parsed.fonts.length,0);assert.ok(parsed.warnings.length>0);await e.api.loadFontImage(f.bytes);assert.equal(e.api.loadedFonts.size,0);}
});
test('asynchronous font loading respects newer requests and return to BASIC',async()=>{
    let resolve;const e=desktop({fontLoad:()=>new Promise(done=>resolve=done)}),pending=e.api.loadFontImage(fontDisk().bytes);e.api.act('quit');click(e,'modal-0');resolve();await pending;assert.equal(e.api.loadedFonts.size,0);assert.equal(e.document.fonts.size,0);assert.equal(e.api.state.phase,'off');
    let finish;const other=desktop({fontLoad:()=>new Promise(done=>finish=done)}),first=other.api.loadFontImage(fontDisk().bytes);await other.api.loadFontImage(fixture().bytes);finish();await first;assert.equal(other.api.loadedFonts.size,0);
});
test('font picker accepts D64 data, handles bad sizes and leaves saved data unchanged',async()=>{
    const e=desktop(),raw=e.storage.get('c64-geos-disk');e.api.fontPicker.files=[{size:174848,arrayBuffer:async()=>fontDisk().bytes}];await e.api.fontPicker.listeners.get('change')[0]();assert.equal(e.api.loadedFonts.size,1);assert.equal(e.storage.get('c64-geos-disk'),raw);e.api.closeModal();e.api.fontPicker.files=[{size:5}];await e.api.fontPicker.listeners.get('change')[0]();assert.equal(e.api.state.modal.title,'Fonts not loaded');
    e.api.closeModal();e.api.fontPicker.files=[{size:174848,arrayBuffer:async()=>{throw Error('denied');}}];await e.api.fontPicker.listeners.get('change')[0]();assert.equal(e.api.state.modal.title,'Fonts not loaded');
});
const diskPath=path.resolve(__dirname,'../GEOS/GEOWrite.d64');
test('supplied GEOWrite image contains 22 usable font sizes, including California 12 and 18',{skip:!fs.existsSync(diskPath)},async()=>{
    const e=desktop(),bytes=fs.readFileSync(diskPath),data=e.api.parseD64(bytes).readFonts();assert.equal(data.fonts.length,22);assert.equal(data.warnings.length,0);const california=data.fonts.filter(f=>f.name==='California');assert.deepEqual(Array.from(california,f=>f.pointSize),[10,12,14,18]);const font=california.find(f=>f.pointSize===12);assert.equal(font.positions[1]-font.positions[0],3);assert.equal(font.baseline,8);assert.equal(font.height,12);await e.api.loadFontImage(bytes);assert.equal(e.api.loadedFonts.size,22);
});
