const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
function text(value){return Buffer.from(value,'ascii');}
function decode(e,...parts){return e.api.decodeGeoWriteText(Buffer.concat(parts),'Page 1');}
function click(e,key){const b=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(b,key);b.click();}
function mount(e,content){const f=fixture({records:new Map([[0,page(content)]])});e.api.previewD64(f.bytes);click(e,'modal-0');e.api.state.selected.add(0);e.api.openFile(e.api.files[0]);return f;}
test('rulers decode all four alignments with little-endian margins and first-line positions',()=>{
    const e=desktop();for(const [align,name] of ['left','center','right','justify'].entries()){
        const d=decode(e,ruler({left:80,right:560,first:120,align}),text('hello\rnext'));
        assert.equal(d.paragraphs.length,2);assert.equal(d.text,'hello\nnext');assert.deepEqual(JSON.parse(JSON.stringify(d.paragraphs[0].ruler)),{left:80,right:560,first:120,align:name,tabs:[],lineSpacing:1});assert.equal(d.paragraphs[1].ruler,d.paragraphs[0].ruler);assert.equal(d.rulerWarnings,0);
    }
});
test('paragraphs preserve blank lines and mixed text styles without losing export text',()=>{
    const e=desktop(),d=decode(e,ruler({align:1}),text('a'),Buffer.from([23,12,0,64]),text('b\r\rc'));
    assert.equal(d.paragraphs.length,3);assert.equal(d.paragraphs[0].runs.length,2);assert.equal(d.paragraphs[1].runs[0].text,'\n');assert.equal(d.paragraphs[0].ended,true);assert.equal(d.paragraphs[2].ended,false);assert.equal(d.paragraphs.flatMap(p=>p.runs).map(r=>r.text).join(''),d.text);assert.equal(d.text,'ab\n\nc');
});
test('invalid rulers fall back safely and later valid rulers restore paragraph layout',()=>{
    const e=desktop();for(const bad of [{left:100,right:100},{right:65535},{left:100,right:480,first:500}]){
        const d=decode(e,ruler(bad),text('first\r'),ruler({align:2}),text('second'));
        assert.equal(d.rulerWarnings,1);assert.deepEqual(JSON.parse(JSON.stringify(d.paragraphs[0].ruler)),{left:0,right:480,first:0,align:'left',tabs:[],lineSpacing:1});assert.equal(d.paragraphs[1].ruler.align,'right');
    }
});
test('a misplaced ruler applies to the next paragraph and never rewrites text',()=>{
    const e=desktop(),d=decode(e,ruler(),text('start'),ruler({align:1}),text('end\rnext'));
    assert.equal(d.text,'startend\nnext');assert.equal(d.rulerWarnings,1);assert.equal(d.paragraphs[0].ruler.align,'left');assert.equal(d.paragraphs[1].ruler.align,'center');
});
test('DOM paragraphs apply regular and wide page margins and hanging indentation proportionally',()=>{
    const e=desktop();mount(e,Buffer.concat([ruler({left:80,right:560,first:40,align:3}),text('hanging text\r'),ruler({align:1}),text('center\r'),ruler({align:2}),text('right')]));
    const p=e.api.editor.children;assert.equal(e.api.nativeDocument.data.pageWidth,640);assert.equal(p[0].tagName,'p');assert.equal(p[0].style.textAlign,'justify');assert.equal(p[0].style.marginLeft,'12.5%');assert.equal(p[0].style.marginRight,'12.5%');assert.equal(Number.parseFloat(p[0].style.textIndent),-40/480*100);assert.equal(p[1].style.textAlign,'center');assert.equal(p[2].style.textAlign,'right');assert.equal(p[0].textContent,'hanging text');
    e.key('Escape');e.api.act('web-disk');mount(e,Buffer.concat([ruler({left:48,right:432,first:96}),text('indented')]));const regular=e.api.editor.children[0];assert.equal(e.api.nativeDocument.data.pageWidth,480);assert.equal(regular.style.marginLeft,'10%');assert.equal(regular.style.marginRight,'10%');assert.equal(regular.style.textIndent,'12.5%');
});
test('paragraph navigation and plain-text export preserve content and disk bytes',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=fixture({records:new Map([[0,page(Buffer.concat([ruler({align:1}),text('center\r\rbody')]))],[1,page('left')]])});
    e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);assert.equal(e.api.editor.children[0].style.textAlign,'center');assert.equal(e.api.editor.children.filter(n=>n.tagName==='p').length,3);assert.equal(e.api.editor.children[1].textContent,'');click(e,'geowrite-next');assert.equal(e.api.editor.children[0].style.textAlign,'left');click(e,'geowrite-prev');assert.equal(e.api.editor.children[0].style.textAlign,'center');click(e,'geowrite-export');const exported=await e.downloads.at(-1).text();assert.match(exported,/center\n\nbody/);assert.ok(!exported.includes('<p'));assert.equal(e.storage.get('c64-geos-disk'),saved);
});
