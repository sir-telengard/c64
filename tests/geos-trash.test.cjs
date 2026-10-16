const assert=require('node:assert/strict');
const {test}=require('node:test');
const {desktop}=require('./helpers/geos-harness.cjs');
const KEY='c64-geos-disk',BACKUP='c64-geos-disk-backup';
function click(e,key){const button=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(button,key);button.click();}
function trash(e,name='calculator'){e.api.state.selected.clear();e.api.state.selected.add(e.file(name).id);e.api.act('delete');e.api.state.modal.buttons[0][1]();}
function used(e){return e.api.files.reduce((sum,file)=>sum+file.size,0);}

test('Empty requires confirmation, reclaims space and persists across reload',()=>{
    const e=desktop();trash(e);const before=used(e),size=e.file('calculator').size,raw=e.storage.get(KEY);
    click(e,'trash');assert.match(e.api.state.modal.lines.join(' '),/Kbytes held/);click(e,'modal-1');assert.equal(e.api.state.modal.title,'Empty waste basket');assert.equal(e.storage.get(KEY),raw);assert.ok(e.file('calculator'));
    click(e,'modal-0');assert.equal(e.api.state.trash,null);assert.equal(e.file('calculator'),undefined);assert.equal(used(e),before-size);assert.equal(e.storage.get(BACKUP),raw);
    const loaded=desktop({storage:e.storage});assert.equal(loaded.file('calculator'),undefined);assert.equal(loaded.api.state.trash,null);assert.equal(used(loaded),before-size);
});
test('Cancel and Escape keep the basket file and Restore still works',()=>{
    const e=desktop();trash(e);const raw=e.storage.get(KEY);e.api.act('trash-empty');click(e,'modal-1');assert.equal(e.api.state.modal.title,'Waste basket');assert.equal(e.storage.get(KEY),raw);
    click(e,'modal-1');e.key('Escape');assert.equal(e.api.state.modal.title,'Waste basket');assert.equal(e.storage.get(KEY),raw);click(e,'modal-0');assert.equal(e.api.state.trash,null);e.api.openFile(e.file('calculator'));assert.equal(e.api.state.modal.kind,'calculator');
});
test('an empty basket and protected files cannot remove other files',()=>{
    const e=desktop();const raw=e.storage.get(KEY);e.api.act('trash-empty');assert.match(e.api.state.modal.lines[0],/empty/);assert.equal(e.storage.get(KEY),raw);e.api.closeModal();
    e.api.state.trash=e.file('GEOS');e.api.act('trash-empty');assert.match(e.api.state.modal.lines[0],/protected/);assert.ok(e.file('GEOS'));assert.equal(e.storage.get(KEY),raw);
});
test('primary and backup write failures roll back removal and retain the basket',()=>{
    for(const failedKey of [KEY,BACKUP]){
        let fail=false;const e=desktop({failWrite:key=>fail&&key===failedKey});trash(e);const raw=e.storage.get(KEY),before=JSON.stringify(e.api.diskSnapshot());fail=true;e.api.act('trash-empty');click(e,'modal-0');
        assert.equal(e.api.state.modal.title,'Empty not saved');assert.equal(e.storage.get(KEY),raw);assert.equal(JSON.stringify(e.api.diskSnapshot()),before);assert.equal(e.api.state.trash,e.file('calculator'));
        e.api.closeModal();click(e,'trash');click(e,'modal-0');assert.equal(e.api.state.modal.title,'Restore not saved');assert.equal(e.api.state.trash,e.file('calculator'));
    }
});
test('a stale tab cannot permanently remove its basket file from the newer save',()=>{
    const e=desktop();trash(e);e.api.act('trash-empty');const newer=JSON.parse(e.storage.get(KEY));newer.disk.name='OTHER TAB';const raw=JSON.stringify(newer);e.storage.set(KEY,raw);click(e,'modal-0');
    assert.equal(e.api.state.modal.title,'Empty not saved');assert.equal(e.api.state.trash,e.file('calculator'));assert.equal(e.storage.get(KEY),raw);
});
test('reclaimed capacity can be used for new files and previous disk can recover removal',()=>{
    const e=desktop();e.file('GEOS').size+=165-used(e);assert.equal(used(e),165);assert.equal(e.api.persistDisk(),true);trash(e);const old=e.storage.get(KEY);
    e.api.state.selected.add(e.file('READ ME').id);e.api.act('duplicate');assert.equal(e.api.state.modal.title,'Duplicate');e.api.closeModal();e.api.act('trash-empty');click(e,'modal-0');e.api.act('duplicate');assert.ok(e.file('copy READ ME'));assert.ok(used(e)<165);
    e.api.previewImport(old);click(e,'modal-0');assert.equal(e.api.state.trash.name,'calculator');assert.ok(e.file('calculator'));assert.equal(used(e),165);
});
