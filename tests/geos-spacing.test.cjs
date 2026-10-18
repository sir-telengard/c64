const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page,ruler}=require('./helpers/geowrite-fixture.cjs');
const firstParagraph=e=>e.api.editor.children.find(n=>n.tagName==='p');
const text=value=>Buffer.from(value,'ascii');
function click(e,key){const button=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(button,key);button.click();}
function open(e,records){const f=fixture({records});e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);return f;}

test('spacing bits decode independently of alignment and tab settings',()=>{
    const e=desktop();
    for(const [spacing,height] of [1,1.5,2].entries())for(let align=0;align<4;align++){
        const d=e.api.decodeGeoWriteText(Buffer.concat([ruler({spacing,align,tabs:[80]}),text('a\rb')]),'Page');
        assert.equal(d.paragraphs[0].ruler.lineSpacing,height);assert.equal(d.paragraphs[0].ruler.align,['left','center','right','justify'][align]);assert.equal(d.paragraphs[1].ruler,d.paragraphs[0].ruler);assert.equal(d.paragraphs[0].ruler.tabs[0].position,80);assert.equal(d.rulerWarnings,0);assert.equal(d.text,'a\nb');
    }
});

test('reserved spacing falls back to single with a warning and later rulers recover',()=>{
    const e=desktop(),d=e.api.decodeGeoWriteText(Buffer.concat([ruler({spacing:3,align:2}),text('bad\r'),ruler({spacing:2}),text('good')]),'Page');
    assert.equal(d.rulerWarnings,1);assert.equal(d.paragraphs[0].ruler.lineSpacing,1);assert.equal(d.paragraphs[0].ruler.align,'right');assert.equal(d.paragraphs[1].ruler.lineSpacing,2);assert.equal(d.text,'bad\ngood');
});

test('mid-paragraph spacing applies at the next boundary and invalid geometry resets it',()=>{
    const e=desktop(),d=e.api.decodeGeoWriteText(Buffer.concat([text('a'),ruler({spacing:2}),text('b\rc\r'),ruler({spacing:2,right:0}),text('d')]),'Page');
    assert.deepEqual(Array.from(d.paragraphs,p=>p.ruler.lineSpacing),[1,2,1]);assert.equal(d.rulerWarnings,2);assert.equal(d.text,'ab\nc\nd');
});

test('rendered spacing scales with mixed font sizes and gives blank paragraphs height',()=>{
    const e=desktop();open(e,new Map([[0,page(Buffer.concat([ruler({spacing:1}),Buffer.from([23,12,0,0]),text('small '),Buffer.from([23,24,0,0]),text('large\r\r'),ruler({spacing:2}),text('double')]))]]));
    const p=e.api.editor.children;assert.equal(p[0].style.lineHeight,'1.5');assert.equal(p[0].style.fontSize,'12px');assert.equal(p[0].children[1].style.fontSize,'24px');assert.equal(p[1].textContent,'');assert.equal(p[1].style.lineHeight,'1.5');assert.equal(p[1].style.minHeight,'1.5em');assert.equal(p[1].style.fontSize,'24px');assert.equal(p[2].style.lineHeight,'2');
});

test('spacing resets across sections and navigation preserves source text, storage and disk bytes',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=open(e,new Map([[0,page(Buffer.concat([ruler({spacing:2}),text('double\r\rbody')]))],[1,Buffer.concat([text('default page'),Buffer.from([0])])],[61,Buffer.concat([text('default header'),Buffer.from([0])])]])),before=Buffer.from(f.bytes);
    assert.equal(firstParagraph(e).style.lineHeight,'2');click(e,'geowrite-next');assert.equal(firstParagraph(e).style.lineHeight,'1');click(e,'geowrite-next');assert.equal(firstParagraph(e).style.lineHeight,'1');click(e,'geowrite-prev');click(e,'geowrite-prev');assert.equal(firstParagraph(e).style.lineHeight,'2');click(e,'geowrite-export');assert.match(await e.downloads.at(-1).text(),/double\n\nbody/);assert.equal(e.storage.get('c64-geos-disk'),saved);assert.deepEqual(f.bytes,before);
});
