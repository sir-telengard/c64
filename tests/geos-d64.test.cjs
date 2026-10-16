const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {desktop}=require('./helpers/geos-harness.cjs');
const KEY='c64-geos-disk';
const tracks=Array.from({length:35},(_,i)=>i<17?21:i<24?19:i<30?18:17);
function sector(bytes,track,number){const offset=(tracks.slice(0,track-1).reduce((a,b)=>a+b,0)+number)*256;return bytes.subarray(offset,offset+256);}
function text(bytes,offset,value,length){bytes.fill(160,offset,offset+length);Buffer.from(value).copy(bytes,offset);}
// Independently constructed format fixture; no original GEOS binary is bundled.
function image(){
    const bytes=Buffer.alloc(174848),bam=sector(bytes,18,0);bam.set([18,1,65]);text(bam,144,'TEST GEOS',16);text(bam,173,'GEOS format V1.0',16);
    for(let t=1;t<=35;t++){bam[t*4]=tracks[t-1];for(let s=0;s<tracks[t-1];s++)bam[t*4+1+Math.floor(s/8)]|=1<<(s%8);}
    const dir=sector(bytes,18,1);dir.set([0,255]);dir[2]=131;dir[3]=1;dir[4]=0;text(dir,5,'REAL APP',16);dir[21]=1;dir[22]=1;dir[23]=1;dir[24]=6;dir.set([86,5,10,12,34],25);dir[30]=12;
    const header=sector(bytes,1,1);header.set([0,255,3,21,191]);header[5]=128;header[67]=1;text(header,77,'Test App V1.0',19);
    dir[34]=130;dir[35]=2;text(dir,37,'BASIC FILE',16);dir[62]=2;
    return bytes;
}
function click(e,key){const node=e.api.controls.children.find(n=>n.dataset.key===key);assert.ok(node,key);node.click();}
function mount(e,bytes=image(),name='test.d64'){e.api.previewD64(bytes,name);assert.equal(e.api.state.modal.title,'Open D64');click(e,'modal-0');}

test('parse directory, GEOS class, exact 63-byte icon, timestamp and DOS fallback',()=>{
    const e=desktop(),data=e.api.parseD64(image());assert.equal(data.diskName,'TEST GEOS');assert.equal(data.isGeos,true);assert.equal(data.files.length,2);assert.equal(data.freeBlocks,664);assert.equal(data.usedBlocks,0);
    const [app,basic]=data.files;assert.equal(app.name,'REAL APP');assert.equal(app.type,'application');assert.equal(app.blocks,12);assert.equal(app.structure,'VLIR');assert.equal(app.className,'Test App V1.0');assert.equal(app.nativeDate,'1986-05-10 12:34');assert.equal(app.nativeIcon.length,63);assert.equal(app.nativeIcon[0],128);assert.equal(app.nativeIcon[62],1);
    assert.equal(basic.type,'PRG');assert.equal(basic.geosType,0);assert.equal(basic.nativeIcon,undefined);
});
test('multi-sector and GEOS border directories are included; deleted slots are skipped',()=>{
    const e=desktop(),bytes=image(),bam=sector(bytes,18,0),first=sector(bytes,18,1);first.set([18,2]);
    const second=sector(bytes,18,2);second.set([0,255,130,2,0]);text(second,5,'SECOND PAGE',16);bam[171]=19;bam[172]=8;
    const border=sector(bytes,19,8);border.set([0,255,130,2,0]);text(border,5,'BORDER FILE',16);border[34]=0;text(border,37,'DELETED',16);
    const data=e.api.parseD64(bytes);assert.equal(data.files.length,4);assert.equal(data.files[3].border,true);assert.equal(data.files[3].name,'BORDER FILE');
});
test('bad sizes, headers, directory links and loops leave the current disk unchanged',()=>{
    const e=desktop(),raw=e.storage.get(KEY),before=JSON.stringify(e.api.diskSnapshot());
    for(const bytes of [Buffer.alloc(10),Buffer.alloc(174848),(()=>{const b=image();sector(b,18,1).set([36,0]);return b;})(),(()=>{const b=image();sector(b,18,1).set([18,1]);return b;})(),(()=>{const b=image();sector(b,18,1).set([18,19]);return b;})()]){
        e.api.previewD64(bytes);assert.equal(e.api.state.modal.title,'D64 not opened');assert.equal(JSON.stringify(e.api.diskSnapshot()),before);assert.equal(e.storage.get(KEY),raw);e.api.closeModal();
    }
});
test('corrupt info sectors, BAM inconsistencies, unclosed files and error tables produce warnings',()=>{
    const e=desktop(),bytes=Buffer.concat([image(),Buffer.alloc(683,1)]);sector(bytes,18,0)[4]=0;sector(bytes,18,1)[21]=36;sector(bytes,18,1)[34]=2;bytes[174848]=5;
    const data=e.api.parseD64(bytes);assert.equal(data.files.length,2);assert.equal(data.files[0].nativeIcon,undefined);assert.ok(data.warnings.some(w=>w.includes('BAM')));assert.ok(data.warnings.some(w=>w.includes('info sector')));assert.ok(data.warnings.some(w=>w.includes('not closed')));assert.ok(data.warnings.some(w=>w.includes('error table')));
});
test('PETSCII shifted spaces/high letters are mapped and plain CBM disks ignore GEOS fields',()=>{
    const e=desktop(),bytes=image();sector(bytes,18,0).fill(0,173,189);sector(bytes,18,1)[5]=193;
    const data=e.api.parseD64(bytes);assert.equal(data.isGeos,false);assert.equal(data.files[0].name,'AEAL APP');assert.equal(data.files[0].type,'USR');assert.equal(data.files[0].nativeIcon,undefined);
});
test('mount preview can be canceled and mounting preserves the writable disk, context and storage',()=>{
    const e=desktop();e.api.state.page=1;e.api.state.view='name';e.api.state.selected.add(e.file('READ ME').id);const before=JSON.stringify(e.api.diskSnapshot()),raw=e.storage.get(KEY);
    e.api.previewD64(image());click(e,'modal-1');assert.equal(e.api.mountedD64,null);mount(e);assert.equal(e.api.state.diskName,'TEST GEOS');assert.equal(e.api.files.length,2);assert.equal(e.storage.get(KEY),raw);assert.equal(JSON.stringify(e.api.diskSnapshot()),before);
    e.api.act('view-size');e.api.act('disk-close');click(e,'web-disk');assert.equal(e.api.state.diskName,'GEOS 2.0');assert.equal(e.api.state.page,1);assert.equal(e.api.state.view,'name');assert.ok(e.api.state.selected.has(e.file('READ ME').id));assert.equal(JSON.stringify(e.api.diskSnapshot()),before);
});
test('D64 commands block every disk mutation and native programs show metadata without launching',()=>{
    const e=desktop();mount(e);const raw=e.storage.get(KEY),native=JSON.stringify(e.api.files);e.api.state.selected.add(0);
    for(const action of ['new-text','new-picture','duplicate','rename','delete','disk-rename','disk-import','disk-previous','trash-empty','colors','note','clock','calculator','preferences']){
        e.api.act(action);assert.equal(e.api.state.modal.title,'Read-only D64');e.api.closeModal();assert.equal(JSON.stringify(e.api.files),native);assert.equal(e.storage.get(KEY),raw);
    }
    assert.equal(e.api.persistDisk(),false);e.api.openFile(e.api.files[0]);assert.equal(e.api.state.modal.title,'Native GEOS file');assert.match(e.api.state.modal.lines.join(' '),/Native execution is not available/);assert.equal(e.api.state.launch,null);e.api.closeModal();e.api.act('info');assert.match(e.api.state.modal.lines.join(' '),/1986-05-10/);
});
test('export downloads the unchanged original bytes; swapping D64s still returns to the original web disk',async()=>{
    const e=desktop(),bytes=image(),snapshot=JSON.stringify(e.api.diskSnapshot());mount(e,bytes,'first.d64');e.api.act('disk-export');assert.deepEqual(Buffer.from(await e.downloads.at(-1).arrayBuffer()),bytes);
    const other=image();text(sector(other,18,0),144,'SECOND DISK',16);mount(e,other);assert.equal(e.api.state.diskName,'SECOND DISK');e.api.act('web-disk');assert.equal(JSON.stringify(e.api.diskSnapshot()),snapshot);
});
test('leaving D64 for BASIC returns to the web disk, and a fresh page never mounts an image',()=>{
    const e=desktop(),raw=e.storage.get(KEY);mount(e);e.api.act('quit');click(e,'modal-0');assert.equal(e.api.state.phase,'off');assert.equal(e.api.mountedD64,null);assert.ok(e.file('READ ME'));assert.equal(e.storage.get(KEY),raw);assert.equal(desktop({storage:e.storage}).api.mountedD64,null);
});
test('file picker handles reads, invalid sizes, failures and late results after BASIC',async()=>{
    const e=desktop();e.api.d64Picker.files=[{name:'test.d64',size:174848,arrayBuffer:async()=>image()}];await e.api.d64Picker.listeners.get('change')[0]();assert.equal(e.api.state.modal.title,'Open D64');click(e,'modal-1');
    e.api.d64Picker.files=[{name:'bad.d64',size:99}];await e.api.d64Picker.listeners.get('change')[0]();assert.equal(e.api.state.modal.title,'D64 not opened');e.api.closeModal();
    e.api.d64Picker.files=[{name:'bad.d64',size:174848,arrayBuffer:async()=>{throw Error('read failed');}}];await e.api.d64Picker.listeners.get('change')[0]();assert.equal(e.api.state.modal.title,'D64 not opened');e.api.closeModal();
    let resolve;e.api.d64Picker.files=[{name:'late.d64',size:174848,arrayBuffer:()=>new Promise(done=>resolve=done)}];const pending=e.api.d64Picker.listeners.get('change')[0]();e.api.act('quit');click(e,'modal-0');resolve(image());await pending;assert.equal(e.api.state.phase,'off');assert.equal(e.api.state.modal,null);assert.equal(e.api.mountedD64,null);
});
test('mounting cancels a pending JSON import and image viewing works without writable storage',async()=>{
    const e=desktop();const backup=JSON.stringify(e.api.diskSnapshot()),raw=e.storage.get(KEY);let resolve;
    e.api.picker.files=[{size:backup.length,text:()=>new Promise(done=>resolve=done)}];const pending=e.api.picker.listeners.get('change')[0]();mount(e);resolve(backup);await pending;assert.equal(e.api.state.modal,null);assert.equal(e.api.state.diskName,'TEST GEOS');assert.equal(e.storage.get(KEY),raw);
    e.api.previewImport(backup);assert.equal(e.api.state.modal.title,'Read-only D64');e.api.closeModal();e.api.act('disk-info');click(e,'modal-0');assert.equal(e.api.editor.readOnly,true);assert.match(e.api.editor.value,/not been validated/);
    const denied=desktop({failRead:()=>true});mount(denied);assert.equal(denied.api.state.diskName,'TEST GEOS');denied.api.act('web-disk');assert.ok(denied.file('READ ME'));assert.equal(denied.api.state.storageIssue,'Browser storage is unavailable.');
});
for(const [filename,label,count,free,name,kind,blocks] of [
    ['GEOS Boot Disk.d64','GEOS plain boot',15,209,'DESK TOP',4,120],
    ['GEOWrite.d64','geoWrite 64',30,25,'GEOWRITE',6,141]
]){
    const diskPath=path.resolve(__dirname,'../GEOS',filename);
    test('supplied image inventory: '+filename,{skip:!fs.existsSync(diskPath)},()=>{
        const e=desktop(),data=e.api.parseD64(fs.readFileSync(diskPath));assert.equal(data.diskName,label);assert.equal(data.files.length,count);assert.equal(data.freeBlocks,free);const file=data.files.find(f=>f.name===name);assert.equal(file.geosType,kind);assert.equal(file.blocks,blocks);assert.equal(file.nativeIcon.length,63);assert.equal(data.warnings.length,0);mount(e,fs.readFileSync(diskPath),filename);assert.ok(e.api.controls.children.some(n=>n.dataset.key==='file-0'));
    });
}
