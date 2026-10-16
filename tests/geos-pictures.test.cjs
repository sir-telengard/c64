const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page}=require('./helpers/geowrite-fixture.cjs');
const rectangle=Buffer.from([2,16,0,2,255,223,14,130,128,1,2,255]);
function picturePage(record=64,width=16,height=16){return page(Buffer.concat([Buffer.from('before\r'),Buffer.from([16,width/8,height&255,height>>8,record]),Buffer.from('\rafter')]));}
function disk(){return fixture({records:new Map([[0,picturePage()],[64,rectangle]])});}
function read(e,f){const d=e.api.parseD64(f.bytes);return d.readGeoWrite(d.files[0]);}
function click(e,key){const b=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(b,key);b.click();}
test('repeat, literal and bigcount packets produce the exact 16x16 reference rectangle',()=>{
    const e=desktop(),picture=e.api.decodePhotoScrap(rectangle);assert.equal(picture.width,16);assert.equal(picture.height,16);assert.equal(picture.rowBytes,2);
    assert.deepEqual(Array.from(picture.bitmap),[255,255,...Array.from({length:14},()=>[128,1]).flat(),255,255]);
});
test('bitmap decoding stops at the declared size and ignores trailing color data',()=>{
    const e=desktop();assert.deepEqual(Array.from(e.api.decodePhotoScrap(new Uint8Array([1,3,0,131,128,64,32,0,128,220])).bitmap),[128,64,32]);
    assert.deepEqual(Array.from(e.api.decodePhotoScrap(new Uint8Array([1,1,0,127,255])).bitmap),[255]);
});
test('invalid dimensions, reserved codes and truncated patterns fail with bounded work',()=>{
    const e=desktop();for(const data of [[],[0,1,0],[1,0,0],[255,255,255],[1,1,0],[1,1,0,0],[1,1,0,128],[1,1,0,220],[1,1,0,1],[1,2,0,130,255],[1,1,0,221,0,1],[1,1,0,223,2,130,128],[1,1,0,221,2,221]])assert.throws(()=>e.api.decodePhotoScrap(new Uint8Array(data)));
});
test('image references become inline canvases in text order with exact black/white pixels',async()=>{
    const e=desktop(),f=disk(),saved=e.storage.get('c64-geos-disk');e.api.previewD64(f.bytes);click(e,'modal-0');e.api.state.selected.add(0);e.api.openFile(e.api.files[0]);
    const nodes=e.api.editor.children.flatMap(p=>p.children).filter(n=>n.tagName==='canvas'||n.textContent);assert.equal(nodes[0].textContent,'before');assert.equal(nodes[1].tagName,'canvas');assert.equal(nodes[1].width,16);assert.equal(nodes[1].height,16);assert.equal(nodes[1].attributes.role,'img');assert.match(nodes[1].attributes['aria-label'],/16 by 16/);assert.equal(nodes[2].textContent,'after');
    const pixels=e.context2d.lastImage;assert.deepEqual(Array.from(pixels.data.subarray(0,4)),[0,0,0,255]);const offset=(1*16+1)*4;assert.deepEqual(Array.from(pixels.data.subarray(offset,offset+4)),[255,255,255,255]);
    assert.equal(e.api.nativeDocument.data.warnings.length,0);click(e,'geowrite-export');assert.match(await e.downloads.at(-1).text(),/before\n\n\[Picture omitted\]\n\nafter/);assert.equal(e.storage.get('c64-geos-disk'),saved);
});
test('missing, invalid and mismatched image references keep text readable with warnings',()=>{
    const e=desktop();for(const f of [fixture({records:new Map([[0,picturePage()]])}),fixture({records:new Map([[0,picturePage(63)],[64,rectangle]])}),fixture({records:new Map([[0,picturePage(64,24)],[64,rectangle]])}),fixture({records:new Map([[0,picturePage()],[64,Buffer.from([2,16,0,0])]])})]){
        const doc=read(e,f);assert.match(doc.items[0].text,/before/);const run=doc.items[0].runs.find(r=>r.picture);assert.equal(run.bitmap,undefined);assert.ok(run.pictureError);assert.equal(doc.warnings.length,1);
    }
    const ended=disk();ended.index.set([0,0],4);const doc=read(e,ended);assert.match(doc.warnings[0],/past the end/);
});
test('shared image references reuse decoded data, without merging adjacent text into images',()=>{
    const e=desktop(),f=fixture({records:new Map([[0,page(Buffer.from([16,2,16,0,64,65,16,2,16,0,64,66]))],[64,rectangle]])}),doc=read(e,f),runs=doc.items[0].runs;
    assert.equal(runs.length,4);assert.equal(runs[0].bitmap,runs[2].bitmap);assert.equal(runs[1].text,'A');assert.equal(runs[3].text,'B');assert.equal(doc.warnings.length,0);
});
test('cyclic, overlapping and flagged image sectors produce placeholders without discarding text',()=>{
    const e=desktop();for(const change of [f=>f.sector(...f.locations.get(64)[0]).set(f.locations.get(64)[0]),f=>f.index.set(f.locations.get(0)[0],130),f=>{const pos=f.locations.get(64)[0],tracks=Array.from({length:35},(_,i)=>i<17?21:i<24?19:i<30?18:17);f.bytes=Buffer.concat([f.bytes,Buffer.alloc(683,1)]);f.bytes[174848+tracks.slice(0,pos[0]-1).reduce((a,b)=>a+b,0)+pos[1]]=5;}]){
        const f=disk();change(f);const doc=read(e,f);assert.ok(doc.items[0].runs.some(r=>r.pictureError));assert.equal(doc.items[0].runs[0].text,'before\n');assert.equal(doc.warnings.length,1);
    }
});
test('document pixel budget limits repeated large references and preserves later text',()=>{
    const e=desktop(),image=Buffer.from([128,0,4,...Array.from({length:9},()=>[222,255,127,0]).flat()]),ref=[16,128,0,4,64],f=fixture({records:new Map([[0,page(Buffer.from([...Array.from({length:5},()=>ref).flat(),90]))],[64,image]])}),doc=read(e,f),pictures=doc.items[0].runs.filter(r=>r.picture);
    assert.equal(pictures.filter(r=>r.bitmap).length,4);assert.match(pictures[4].pictureError,/budget/);assert.equal(doc.items[0].runs.at(-1).text,'Z');
});
const scrapPath=path.resolve(__dirname,'../GEOS/research/geopub-photo-scrap.bin');
test('historical Photo Scrap decodes and embeds in a constructed geoWrite container',{skip:!fs.existsSync(scrapPath)},()=>{
    const e=desktop(),raw=fs.readFileSync(scrapPath);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'d288d575307547dc51cc3a2fcef3550bdaf9972851c98cb95b43f6f9efc959c3');const photo=e.api.decodePhotoScrap(raw);assert.equal(photo.width,216);assert.equal(photo.height,144);assert.equal(photo.bitmap.length,3888);assert.equal(crypto.createHash('sha256').update(photo.bitmap).digest('hex'),'5e5ede23825cd7393e51cf797531fb5724af47305786402274940f8dc0cbe837');
    const f=fixture({records:new Map([[0,picturePage(64,216,144)],[64,raw]])}),doc=read(e,f);assert.equal(doc.warnings.length,0);assert.deepEqual(doc.items[0].runs.find(r=>r.picture).bitmap.bitmap,photo.bitmap);
});
