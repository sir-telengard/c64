const assert = require('node:assert/strict');
const { test } = require('node:test');
const { desktop } = require('./helpers/geos-harness.cjs');
const KEY = 'c64-geos-disk';
function click(e, key) { const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click(); }
function pointer(e, type, x, y) { for(const fn of e.api.paintSurface.listeners.get(type)||[]) fn({button:0,pointerId:1,clientX:32+x*2,clientY:52+y*2,preventDefault(){}}); }
function stroke(e,x,y,x2=x,y2=y){pointer(e,'pointerdown',x,y);pointer(e,'pointermove',x2,y2);pointer(e,'pointerup',x2,y2);}
function save(e,name='MY PICTURE'){click(e,'paint-save');if(e.api.state.modal.kind==='rename'){e.api.editor.value=name;e.key('Enter',e.api.editor);}}
function pixel(e,x,y){return e.api.painting.pixels[y*128+x];}
function open(e,name){e.api.state.selected.clear();e.api.state.selected.add(e.file(name).id);e.api.openFile(e.file(name));}

test('draw/save/reload/reopen a picture through its parent application',()=>{
    const e=desktop();e.api.act('new-picture');stroke(e,1,2,10,2);assert.equal(pixel(e,5,2),'1');assert.equal(e.unload().prevented,true);
    save(e);assert.equal(JSON.parse(e.storage.get(KEY)).version,3);assert.equal(e.file('MY PICTURE').parentApplication,'PAINT');assert.equal(e.unload().prevented,false);click(e,'modal-close');assert.ok(e.api.state.selected.has(e.file('MY PICTURE').id));
    const loaded=desktop({storage:e.storage});open(loaded,'MY PICTURE');assert.equal(loaded.api.state.modal.kind,'paint');assert.equal(pixel(loaded,5,2),'1');
});
test('rectangle bounds enclose a flood fill and Undo reverses each operation',()=>{
    const e=desktop();e.api.act('new-picture');click(e,'paint-rect');stroke(e,2,2,8,8);assert.equal(pixel(e,5,2),'1');assert.equal(pixel(e,5,5),'0');
    click(e,'paint-color-2');click(e,'paint-fill');stroke(e,5,5);assert.equal(pixel(e,5,5),'2');assert.equal(pixel(e,1,1),'0');assert.equal(pixel(e,2,5),'1');
    click(e,'paint-undo');assert.equal(pixel(e,5,5),'0');click(e,'paint-undo');assert.equal(pixel(e,2,5),'0');
});
test('line previews replace earlier previews; eraser uses white; pointer cancel restores',()=>{
    const e=desktop();e.api.act('new-picture');click(e,'paint-line');pointer(e,'pointerdown',1,1);pointer(e,'pointermove',9,1);pointer(e,'pointermove',1,9);pointer(e,'pointerup',1,9);
    assert.equal(pixel(e,9,1),'0');assert.equal(pixel(e,1,9),'1');click(e,'paint-eraser');stroke(e,1,5);assert.equal(pixel(e,1,5),'0');
    click(e,'paint-pencil');pointer(e,'pointerdown',20,20);pointer(e,'pointercancel',21,20);assert.equal(pixel(e,20,20),'0');
});
test('keyboard drawing and Ctrl+S work while Tab remains in the modal',()=>{
    const e=desktop();e.api.act('new-picture');const surface=e.api.paintSurface;e.key('ArrowRight',surface);e.key(' ',surface);assert.equal(pixel(e,1,0),'1');
    e.key('s',surface,{ctrlKey:true});assert.equal(e.api.state.modal.title,'Save picture');e.api.editor.value='KEYBOARD';e.key('Enter',e.api.editor);assert.ok(e.file('KEYBOARD'));
    e.api.paintSurface.focus();e.key('Tab');assert.ok(e.api.controls.children.includes(e.document.activeElement));
});
test('Close, New and BASIC exit offer Save, Discard and Cancel',()=>{
    const e=desktop();e.api.act('new-picture');stroke(e,3,3);click(e,'modal-close');e.api.state.modal.buttons[2][1]();assert.equal(pixel(e,3,3),'1');
    click(e,'paint-new');e.api.state.modal.buttons[0][1]();e.api.editor.value='BEFORE NEW';e.key('Enter',e.api.editor);assert.equal(pixel(e,3,3),'0');assert.ok(e.file('BEFORE NEW'));
    stroke(e,4,4);e.api.act('quit');e.api.state.modal.buttons[2][1]();assert.equal(e.api.state.modal.kind,'paint');e.api.act('quit');e.api.state.modal.buttons[1][1]();assert.equal(e.api.state.phase,'off');
});
test('duplicate pictures edit independently and disk JSON preserves the pixels',()=>{
    const e=desktop();e.api.act('new-picture');stroke(e,2,2);save(e);click(e,'modal-close');e.api.act('duplicate');open(e,'copy MY PICTURE');stroke(e,5,5);save(e);click(e,'modal-close');
    assert.equal(e.file('MY PICTURE').picture.pixels[5*128+5],'0');assert.equal(e.file('copy MY PICTURE').picture.pixels[5*128+5],'1');
    const backup=JSON.stringify(e.api.diskSnapshot());e.api.previewImport(backup);e.api.state.modal.buttons[0][1]();e.api.closeModal();open(e,'copy MY PICTURE');assert.equal(pixel(e,5,5),'1');
});
test('invalid picture backups are rejected before changing the saved disk',()=>{
    const e=desktop();e.api.act('new-picture');stroke(e,1,1);save(e);click(e,'modal-close');const before=e.storage.get(KEY);
    for(const change of [p=>p.width=999,p=>p.pixels='bad',p=>p.pixels='8'.repeat(7168)]){
        const data=JSON.parse(before);change(data.files.find(f=>f.picture).picture);e.api.previewImport(JSON.stringify(data));assert.equal(e.api.state.modal.title,'Import failed');assert.equal(e.storage.get(KEY),before);e.api.closeModal();
    }
});
test('failed saves preserve the saved picture and allow portable SVG export',async()=>{
    let fail=false;const e=desktop({failWrite:key=>fail&&key===KEY});e.api.act('new-picture');stroke(e,1,1);save(e);const before=e.storage.get(KEY);stroke(e,5,5);fail=true;save(e);
    assert.match(e.api.painting.message,/Not saved/);assert.equal(e.storage.get(KEY),before);assert.equal(e.file('MY PICTURE').picture.pixels[5*128+5],'0');
    click(e,'paint-export');const svg=await e.downloads.at(-1).text();assert.match(svg,/<svg/);assert.match(svg,/x="5" y="5"/);assert.equal(e.unload().prevented,true);
});
test('existing saved disks install Paint on request and preserve their documents',()=>{
    const seed=desktop();const data=seed.api.diskSnapshot();data.files=data.files.filter(f=>f.applicationId!=='paint');
    const e=desktop({storage:new Map([[KEY,JSON.stringify(data)]])});assert.equal(e.file('PAINT'),undefined);e.api.act('new-picture');assert.equal(e.api.state.modal.kind,'paint');assert.ok(e.file('READ ME'));assert.ok(JSON.parse(e.storage.get(KEY)).files.some(f=>f.applicationId==='paint'));
});
test('protected pictures are read-only and full disks keep unsaved drafts',()=>{
    const e=desktop();e.api.act('new-picture');stroke(e,1,1);save(e);click(e,'modal-close');e.file('MY PICTURE').locked=true;open(e,'MY PICTURE');stroke(e,2,2);assert.equal(pixel(e,2,2),'0');click(e,'modal-close');
    const remaining=165-e.api.files.reduce((n,f)=>n+f.size,0);e.file('READ ME').size+=remaining;e.api.act('new-picture');stroke(e,3,3);save(e,'FULL');assert.match(e.api.painting.message,/Disk full/);assert.equal(pixel(e,3,3),'1');assert.equal(e.file('FULL'),undefined);
});
