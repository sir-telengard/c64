const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
function click(e,key){const b=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(b,key);b.click();}
function mount(e,content){e.api.previewD64(fixture({records:new Map([[0,page(content)]])}).bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);}
test('ruler tabs preserve absolute positions and decimal flags without changing text',()=>{
    const e=desktop(),data=Buffer.concat([ruler({tabs:[80,{position:240,decimal:true},400,480,480]}),Buffer.from('a\t12.34\tb')]),d=e.api.decodeGeoWriteText(data,'Page 1');
    assert.deepEqual(JSON.parse(JSON.stringify(d.paragraphs[0].ruler.tabs)),[{position:80,decimal:false},{position:240,decimal:true},{position:400,decimal:false},{position:480,decimal:false}]);assert.equal(d.rulerWarnings,0);assert.equal(d.text,'a\t12.34\tb');assert.equal(d.runs.filter(r=>r.tab).length,2);
});
test('invalid or descending stops are ignored with warnings and valid stops remain usable',()=>{
    const e=desktop(),d=e.api.decodeGeoWriteText(Buffer.concat([ruler({tabs:[80,40,700,240]}),Buffer.from('a\tb')]),'Page 1');assert.equal(d.rulerWarnings,1);assert.deepEqual(Array.from(d.paragraphs[0].ruler.tabs,t=>t.position),[80,240]);
});
test('regular and decimal widths respect ruler margins, scaling and fields without a decimal',()=>{
    const e=desktop(),r={left:80,right:560,tabs:[{position:240,decimal:false},{position:400,decimal:true}]};
    assert.equal(e.api.geoWriteTabWidth(20,240,r,30,24),60);assert.equal(e.api.geoWriteTabWidth(100,240,r,30,24),30);assert.equal(e.api.geoWriteTabWidth(100,240,r,60,24),0);assert.equal(e.api.geoWriteTabWidth(150,240,r,80,24),0);
    assert.equal(e.api.geoWriteTabWidth(170,240,r,30,24),22);assert.equal(e.api.geoWriteTabWidth(30,240,{left:0,right:480,tabs:[]},0,24),18);
});
test('native glyph widths are used for decimal prefixes when their font is loaded',()=>{
    const e=desktop(),run={fontId:2,pointSize:12,style:0};assert.equal(e.api.geoWriteTextWidth('123',run),18);e.api.loadedFonts.set('2/12',{family:'Test',font:{positions:Array.from({length:96},(_,i)=>i*3)}});assert.equal(e.api.geoWriteTextWidth('123',run),9);
    const r={left:0,right:480,tabs:[{position:240,decimal:true}]};assert.equal(e.api.geoWriteTabWidth(40,240,r,e.api.geoWriteTextWidth('123',run),24),71);
});
test('DOM tabs look ahead across style changes but stop at decimal, next tab or paragraph end',async()=>{
    const e=desktop(),raw=e.storage.get('c64-geos-disk'),source=Buffer.concat([ruler({tabs:[{position:240,decimal:true},400]}),Buffer.from('A\t12'),Buffer.from([23,18,0,64]),Buffer.from('3.45\t-67\rNext\t8')]);mount(e,source);
    const tabs=e.api.editor.geosTabs;assert.equal(tabs.length,3);assert.equal(tabs[0].prefix.map(p=>p.text).join(''),'123');assert.equal(tabs[0].prefix[1].run.pointSize,18);assert.equal(tabs[1].prefix.map(p=>p.text).join(''),'-67');assert.equal(tabs[2].prefix.map(p=>p.text).join(''),'8');assert.equal(tabs[0].node.textContent,'\t');assert.ok(Number.parseFloat(tabs[0].node.style.width)>=0);
    click(e,'geowrite-export');assert.match(await e.downloads.at(-1).text(),/A\t123\.45\t-67\nNext\t8/);assert.equal(e.storage.get('c64-geos-disk'),raw);
});
test('tab layout normalizes desktop transforms and restores paragraph alignment',()=>{
    const e=desktop();mount(e,Buffer.from('a\tb'));const editor=e.api.editor;editor.offsetWidth=100;editor.getBoundingClientRect=()=>({width:200});
    const block={style:{textAlign:'center'},getBoundingClientRect:()=>({left:100,width:480})},node={style:{},getBoundingClientRect:()=>({left:180})};
    e.api.layoutGeoWriteTabs([{block,node,ruler:{left:80,right:560,tabs:[{position:240,decimal:false}]},run:{fontId:0,pointSize:10,style:0},prefix:[]}]);assert.equal(node.style.width,'40px');assert.equal(block.style.textAlign,'center');
});
test('excessive tabs retain source text while limiting custom layout work',()=>{
    const e=desktop(),value='a\t'.repeat(600),d=e.api.decodeGeoWriteText(Buffer.concat([ruler(),Buffer.from(value)]),'Page 1');assert.equal(d.text,value);assert.equal(d.runs.filter(r=>r.tab).length,512);assert.equal(d.tabOverflow,true);assert.equal(d.runs.map(r=>r.text).join(''),value);
});
const diskPath=path.resolve(__dirname,'../GEOS/research/collette.s1.d64');
test('historical rulers retain their tabs without new warnings or text loss',{skip:!fs.existsSync(diskPath)},()=>{
    const e=desktop(),disk=e.api.parseD64(fs.readFileSync(diskPath));let tabbed=0;
    for(const f of disk.files.filter(f=>f.className==='Write Image V2.1')){const d=disk.readGeoWrite(f);assert.equal(d.warnings.length,0);for(const item of d.items){assert.equal(item.runs.map(r=>r.text).join(''),item.text);tabbed+=item.paragraphs.filter(p=>p.ruler.tabs.length).length;}}
    assert.ok(tabbed>0);
});
