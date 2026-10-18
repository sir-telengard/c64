const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const {fixture,page}=require('./helpers/geowrite-fixture.cjs');
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function open(e,options={}){const f=fixture(options);e.api.previewD64(f.bytes);click(e,'modal-0');e.api.openFile(e.api.files[0]);return f;}

test('page height reads a little-endian word for both formats with bounded fallback',()=>{
    for(const version of ['2.0','2.1'])for(const height of [1,480,752,1024,4096,0,4097,65535]){
        const e=desktop(),f=fixture({version,pageHeight:height}),disk=e.api.parseD64(f.bytes),doc=disk.readGeoWrite(disk.files[0]),valid=height>0&&height<=4096;
        assert.equal(doc.storedPageHeight,height);assert.equal(doc.pageHeight,valid?height:752);assert.equal(doc.warnings.length,valid?0:1);if(!valid)assert.match(doc.warnings[0],/page height/);
    }
});

test('numbered pages place blank space before their footer while standalone sections stay natural height',()=>{
    const e=desktop();open(e);const editor=e.api.editor,spacer=editor.geosPageSpacer;assert.equal(editor.children.at(-2),spacer);assert.equal(editor.children.at(-1).className,'geos-page-footer');assert.equal(spacer.attributes['aria-hidden'],'true');assert.equal(spacer.textContent,'');assert.ok(parseFloat(spacer.style.height)>0);
    click(e,'geowrite-next');assert.ok(e.api.editor.geosPageSpacer);click(e,'geowrite-next');assert.equal(e.api.editor.geosPageSpacer,undefined);click(e,'geowrite-next');assert.equal(e.api.editor.geosPageSpacer,undefined);
});

test('page spacing normalizes transforms, is stable on repeated layout and never overlaps overflowing content',()=>{
    const e=desktop();open(e,{pageHeight:600});const editor=e.api.editor,spacer=editor.geosPageSpacer,first=editor.children[0],footer=editor.children.at(-1);editor.offsetWidth=100;editor.getBoundingClientRect=()=>({width:200});first.getBoundingClientRect=()=>({top:100,height:40});let contentHeight=200;
    footer.getBoundingClientRect=()=>({top:100+(contentHeight+parseFloat(spacer.style.height||0))*2-40,height:40});
    e.api.layoutGeoWritePage(editor,600);assert.equal(spacer.style.height,'400px');e.api.layoutGeoWritePage(editor,600);assert.equal(spacer.style.height,'400px');contentHeight=350;e.api.layoutGeoWritePage(editor,600);assert.equal(spacer.style.height,'250px');contentHeight=700;e.api.layoutGeoWritePage(editor,600);assert.equal(spacer.style.height,'0px');
});

test('title pages and pages without footers retain bottom whitespace including empty pages',()=>{
    for(const options of [{hasTitlePage:true},{records:new Map([[0,page('Body')]])},{records:new Map([[0,page('')]])}]){
        const e=desktop();open(e,options);const editor=e.api.editor,spacer=editor.geosPageSpacer;assert.equal(editor.children.at(-1),spacer);assert.ok(parseFloat(spacer.style.height)>0);assert.ok(!editor.children.some(n=>n.className==='geos-page-footer'));
        editor.offsetWidth=100;editor.getBoundingClientRect=()=>({width:100});if(editor.children.length>1)editor.children[0].getBoundingClientRect=()=>({top:50,height:40});spacer.getBoundingClientRect=()=>({top:editor.children.length>1?90:50,height:parseFloat(spacer.style.height||0)});e.api.layoutGeoWritePage(editor,752);assert.equal(spacer.style.height,editor.children.length>1?'712px':'752px');
    }
});

test('height navigation and plain-text export leave page text, source bytes and storage unchanged',async()=>{
    const e=desktop(),saved=e.storage.get('c64-geos-disk'),f=open(e,{pageHeight:1024}),before=Buffer.from(f.bytes);click(e,'geowrite-next');click(e,'geowrite-details');assert.match(e.api.editor.value,/Stored page height/);e.key('Escape');assert.ok(e.api.editor.geosPageSpacer);assert.equal(e.api.nativeDocument.index,1);click(e,'geowrite-export');const output=await e.downloads.at(-1).text();assert.equal(output.split('Sample footer').length-1,1);assert.ok(!output.includes('geos-page-spacer'));assert.equal(e.storage.get('c64-geos-disk'),saved);assert.deepEqual(f.bytes,before);
});
