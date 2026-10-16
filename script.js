/* Browser recreation of GEOS 64 2.0 deskTop. See GEOS-NOTES.md. */
(() => {
    'use strict';
    const W = 320, H = 200, INK = '#111111', PAPER = '#eeeeee';
    // Hand-drawn proportional bitmap alphabet. No GEOS ROM/font data is bundled.
    const alphabet = {
        A:'01110/10001/10001/11111/10001/10001/10001',B:'11110/10001/10001/11110/10001/10001/11110',C:'01111/10000/10000/10000/10000/10000/01111',D:'11110/10001/10001/10001/10001/10001/11110',E:'11111/10000/10000/11110/10000/10000/11111',F:'11111/10000/10000/11110/10000/10000/10000',G:'01111/10000/10000/10111/10001/10001/01111',H:'10001/10001/10001/11111/10001/10001/10001',I:'111/010/010/010/010/010/111',J:'00111/00010/00010/00010/10010/10010/01100',K:'10001/10010/10100/11000/10100/10010/10001',L:'10000/10000/10000/10000/10000/10000/11111',M:'10001/11011/10101/10101/10001/10001/10001',N:'10001/11001/10101/10011/10001/10001/10001',O:'01110/10001/10001/10001/10001/10001/01110',P:'11110/10001/10001/11110/10000/10000/10000',Q:'01110/10001/10001/10001/10101/10010/01101',R:'11110/10001/10001/11110/10100/10010/10001',S:'01111/10000/10000/01110/00001/00001/11110',T:'11111/00100/00100/00100/00100/00100/00100',U:'10001/10001/10001/10001/10001/10001/01110',V:'10001/10001/10001/10001/10001/01010/00100',W:'10001/10001/10001/10101/10101/10101/01010',X:'10001/10001/01010/00100/01010/10001/10001',Y:'10001/10001/01010/00100/00100/00100/00100',Z:'11111/00001/00010/00100/01000/10000/11111',
        a:'00000/00000/01110/00001/01111/10001/01111',b:'10000/10000/11110/10001/10001/10001/11110',c:'0000/0000/0111/1000/1000/1000/0111',d:'00001/00001/01111/10001/10001/10001/01111',e:'00000/00000/01110/10001/11111/10000/01111',f:'0011/0100/1110/0100/0100/0100/0100',g:'00000/01111/10001/10001/01111/00001/11110',h:'10000/10000/11110/10001/10001/10001/10001',i:'1/0/1/1/1/1/1',j:'01/00/01/01/01/01/10',k:'1000/1000/1001/1010/1100/1010/1001',l:'10/10/10/10/10/10/01',m:'00000/00000/11010/10101/10101/10101/10101',n:'00000/00000/11110/10001/10001/10001/10001',o:'00000/00000/01110/10001/10001/10001/01110',p:'00000/11110/10001/10001/11110/10000/10000',q:'00000/01111/10001/10001/01111/00001/00001',r:'0000/0000/1011/1100/1000/1000/1000',s:'0000/0000/0111/1000/0110/0001/1110',t:'010/010/111/010/010/010/001',u:'00000/00000/10001/10001/10001/10001/01111',v:'00000/00000/10001/10001/10001/01010/00100',w:'00000/00000/10001/10101/10101/10101/01010',x:'00000/00000/10001/01010/00100/01010/10001',y:'00000/10001/10001/10001/01111/00001/11110',z:'0000/0000/1111/0001/0010/0100/1111',
        '0':'01110/10001/10011/10101/11001/10001/01110','1':'010/110/010/010/010/010/111','2':'01110/10001/00001/00010/00100/01000/11111','3':'11110/00001/00001/01110/00001/00001/11110','4':'00010/00110/01010/10010/11111/00010/00010','5':'11111/10000/10000/11110/00001/00001/11110','6':'01110/10000/10000/11110/10001/10001/01110','7':'11111/00001/00010/00100/01000/01000/01000','8':'01110/10001/10001/01110/10001/10001/01110','9':'01110/10001/10001/01111/00001/00001/01110',
        '.':'0/0/0/0/0/0/1',',':'00/00/00/00/00/01/10',':':'0/1/0/0/1/0/0',';':'00/01/00/00/01/01/10','!':'1/1/1/1/1/0/1','?':'1110/0001/0001/0010/0100/0000/0100','-':'0000/0000/0000/1111/0000/0000/0000','+':'00000/00100/00100/11111/00100/00100/00000','=':'0000/0000/1111/0000/1111/0000/0000','/':'00001/00010/00010/00100/01000/01000/10000','(':'01/10/10/10/10/10/01',')':'10/01/01/01/01/01/10','"':'101/101/000/000/000/000/000',"'":'1/1/0/0/0/0/0','<':'001/010/100/010/001/000/000','>':'100/010/001/010/100/000/000','*':'00000/10101/01110/11111/01110/10101/00000','%':'11001/11010/00100/01000/10110/00110/00000','@':'01110/10001/10111/10101/10111/10000/01110','_':'0000/0000/0000/0000/0000/0000/1111',' ':'000/000/000/000/000/000/000'
    };
    Object.assign(alphabet, {"a":"0000/0000/0110/0001/0111/1001/0111","b":"1000/1000/1110/1001/1001/1001/1110","d":"0001/0001/0111/1001/1001/1001/0111","e":"0000/0000/0110/1001/1111/1000/0111","g":"0000/0111/1001/1001/0111/0001/1110","h":"1000/1000/1110/1001/1001/1001/1001","n":"0000/0000/1110/1001/1001/1001/1001","o":"0000/0000/0110/1001/1001/1001/0110","p":"0000/1110/1001/1001/1110/1000/1000","q":"0000/0111/1001/1001/0111/0001/0001","u":"0000/0000/1001/1001/1001/1001/0111","v":"00000/00000/10001/10001/01010/01010/00100"});
    const glyphs = Object.fromEntries(Object.entries(alphabet).map(([key, rows]) => [key, rows.split('/')]));
    const GEOS_TYPE = Object.freeze({SYSTEM:4, ACCESSORY:5, APPLICATION:6, DOCUMENT:7, PRINTER:9, INPUT:10, BOOT:12, AUTO_EXEC:14});
    const diskId = 'geos-demo';
    const fileTypes = {0:'non-GEOS',1:'BASIC program',2:'assembly',3:'data',4:'system',5:'accessory',6:'application',7:'document',8:'font',9:'printer driver',10:'input driver',11:'disk driver',12:'system boot',13:'temporary',14:'application',15:'input driver'};
    // Application IDs describe behavior; icons and display names can change independently.
    const files = [
        ['GEOS',4,12,'system'],['GEOBOOT',12,4,'system'],['DESK TOP',6,22,'desktop','desktop'],['CONFIGURE',6,8,'configure','configure'],
        ['preference mgr',5,3,'preferences','preferences'],['pad color mgr',5,2,'colors','colors'],['COMM 1351',10,2,'mouse'],['MPS-801',9,4,'printer'],
        ['note pad',5,3,'note','note'],['calculator',5,3,'calculator','calculator'],['alarm clock',5,2,'clock','clock'],['READ ME',7,1,'readme'],
        ['TEXT READER',6,3,'readme','text-reader'],['PAINT',6,4,'note','paint']
    ].map(([name,geosType,size,icon,applicationId],id)=>({id,name,geosType,type:fileTypes[geosType],size,icon,applicationId,
        diskId,structure:[6,7,14].includes(geosType)?'VLIR':'sequential',locked:[4,12].includes(geosType)}));
    Object.assign(files[11],{parentApplication:'TEXT READER',parentDiskId:diskId,
        content:['You found the hidden disk!','Double-click files to open.','Turn the corner for page 2.','options > BASIC to return.']});
    const state = { phase:'off', page:0, view:'icon', diskOpen:true, diskId, diskName:'GEOS 2.0', selected:new Set(), menu:null, hover:-1, modal:null, launch:null, documentEdit:null, trash:null, note:'', pattern:0, storageIssue:'' };
    let root, desktop, canvas, ctx, controls, status, editor, callbacks, clockTimer, diskPicker;
    let timers = [], focusKey = null, lastFileClick = null, calc = { display:'0', left:null, op:null, fresh:true };
    const DISK_KEY='c64-geos-disk', BACKUP_KEY='c64-geos-disk-backup', RECOVERY_KEY='c64-geos-disk-recovery';
    let diskLoaded=false, writesBlocked=false, lastSavedRaw=null, importRequest=0;
    const PAINT_W=128, PAINT_H=56, paintColors=['#ffffff','#111111','#880000','#00aa55','#0000aa','#aa44cc','#eeee77','#0088ff'];
    let painting=null, paintSurface=null;
    function diskSnapshot() {
        return {format:'geos-web-disk',version:files.some(file=>file.picture)?3:2,disk:{id:state.diskId,name:state.diskName,pattern:state.pattern},
            files:JSON.parse(JSON.stringify(files)),trashId:state.trash?.id??null};
    }
    function decodeDisk(raw) {
        if(typeof raw!=='string'||raw.length>1000000)throw new Error('Disk backup is too large.');
        const data=JSON.parse(raw);
        if(data?.format!=='geos-web-disk')throw new Error('Not a GEOS web disk backup.');
        if(![1,2,3].includes(data.version))throw new Error('Disk version is not supported.');
        const validText=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
        const pattern=data.version===1?(data.disk?.pattern??0):data.disk?.pattern;
        if(!validText(data.disk?.id,64)||!validText(data.disk?.name,16)||![0,1].includes(pattern))throw new Error('Invalid disk information.');
        if(!Array.isArray(data.files)||data.files.length>256)throw new Error('Invalid file directory.');
        const ids=new Set();
        const restored=data.files.map(file=>{
            if(!file||!Number.isSafeInteger(file.id)||file.id<0||ids.has(file.id)||!validText(file.name,16)||
                !Number.isInteger(file.geosType)||file.geosType<0||file.geosType>15||file.diskId!==data.disk.id||
                !Number.isInteger(file.size)||file.size<1||file.size>165||!validText(file.icon,32)||
                !['sequential','VLIR'].includes(file.structure)||typeof file.locked!=='boolean')throw new Error('Invalid file metadata.');
            ids.add(file.id);
            const result={id:file.id,name:file.name,geosType:file.geosType,type:fileTypes[file.geosType]||'file',size:file.size,
                icon:file.icon,diskId:file.diskId,structure:file.structure,locked:file.locked||[4,12].includes(file.geosType)};
            for(const [key,max] of [['applicationId',32],['parentApplication',16],['parentDiskId',64]]) {
                if(file[key]!==undefined){if(!validText(file[key],max))throw new Error('Invalid application metadata.');result[key]=file[key];}
            }
            if(file.content!==undefined){
                const content=Array.isArray(file.content)&&file.content.every(line=>typeof line==='string')?file.content.join('\n'):file.content;
                if(typeof content!=='string'||content.length>200000)throw new Error('Invalid document text.');result.content=content;
            }
            if(file.picture!==undefined){
                const p=file.picture;
                if(file.geosType!==7||p?.width!==PAINT_W||p?.height!==PAINT_H||typeof p.pixels!=='string'||p.pixels.length!==PAINT_W*PAINT_H||!/^[0-7]+$/.test(p.pixels))throw new Error('Invalid picture data.');
                result.picture={width:PAINT_W,height:PAINT_H,pixels:p.pixels};
                if(file.size<Math.ceil(p.pixels.length/1024))throw new Error('Invalid picture size.');
            }
            return result;
        });
        if(restored.reduce((sum,file)=>sum+file.size,0)>165)throw new Error('Disk capacity exceeded.');
        const trashId=data.version===1?(data.trashId??null):data.trashId;
        if(trashId!==null&&!ids.has(trashId))throw new Error('Invalid waste basket entry.');
        if(restored.some(file=>file.id===trashId&&file.locked))throw new Error('Protected file in waste basket.');
        if(data.version===1&&data.note!==undefined){
            if(typeof data.note!=='string'||data.note.length>2000)throw new Error('Invalid note text.');
            const note=restored.find(file=>file.applicationId==='note');if(note&&note.content===undefined)note.content=data.note;
        }
        return {format:'geos-web-disk',version:restored.some(file=>file.picture)?3:2,disk:{id:data.disk.id,name:data.disk.name,pattern},files:restored,trashId};
    }
    function applyDisk(data) {
        files.splice(0,files.length,...data.files);state.diskId=data.disk.id;state.diskName=data.disk.name;state.pattern=data.disk.pattern;
        state.trash=files.find(file=>file.id===data.trashId)||null;state.note='';state.selected.clear();state.page=0;
    }
    function storageFailed(message) {state.storageIssue=message;if(status)say(message+' Changes remain in this session. Use disk > export.');}
    function persistDisk() {
        if(writesBlocked)return false;
        try {
            const previous=localStorage.getItem(DISK_KEY);
            if(previous!==lastSavedRaw){writesBlocked=true;storageFailed('Another tab changed this disk.');return false;}
            const next=JSON.stringify(diskSnapshot());decodeDisk(next);
            if(previous!==null)localStorage.setItem(BACKUP_KEY,previous);
            localStorage.setItem(DISK_KEY,next);lastSavedRaw=next;state.storageIssue='';return true;
        } catch(e){storageFailed('Disk could not be saved.');return false;}
    }
    function loadDisk() {
        if(diskLoaded)return;diskLoaded=true;
        try {
            lastSavedRaw=localStorage.getItem(DISK_KEY);
            if(lastSavedRaw!==null){
                try{const data=decodeDisk(lastSavedRaw);applyDisk(data);if(JSON.parse(lastSavedRaw).version===1)persistDisk();return;}
                catch(e){
                    writesBlocked=true;
                    try{const backup=localStorage.getItem(BACKUP_KEY);if(backup!==null)applyDisk(decodeDisk(backup));}catch(backupError){/* Keep the supplied disk if neither save can be read. */}
                    storageFailed('Saved disk needs recovery.');return;
                }
            }
            const note=files.find(file=>file.applicationId==='note');
            if(note)note.content=localStorage.getItem('c64-geos-note')||'';
            persistDisk();
        } catch(e){writesBlocked=true;storageFailed('Browser storage is unavailable.');}
    }
    function downloadFile(content,name,type) {
        const url=URL.createObjectURL(new Blob([content],{type}));
        const link=element('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    function exportDisk() {
        downloadFile(JSON.stringify(diskSnapshot(),null,2),'geos-disk.json','application/json');say('Disk backup downloaded.');
    }
    function previewImport(raw) {
        let data;try{data=decodeDisk(raw);}catch(e){dialog('Import failed',['This backup could not be read.','The current disk is unchanged.']);return;}
        dialog('Import disk',[data.disk.name,data.files.length+' files','Replace the current disk?','A previous copy will be kept.'],[['Import',()=>{
            try {
                const previous=localStorage.getItem(DISK_KEY);
                if(previous!==lastSavedRaw){writesBlocked=true;storageFailed('Another tab changed this disk.');dialog('Import canceled',['Another tab changed this disk.','Reload before importing.']);return;}
                if(previous!==null){try{decodeDisk(previous);}catch(e){localStorage.setItem(RECOVERY_KEY,previous);}}
                localStorage.setItem(BACKUP_KEY,JSON.stringify(diskSnapshot()));
                const next=JSON.stringify(data);localStorage.setItem(DISK_KEY,next);lastSavedRaw=next;
            } catch(e){dialog('Import not saved',['The current disk is unchanged.','Export it and try again.']);return;}
            writesBlocked=false;state.storageIssue='';state.launch=null;applyDisk(data);state.diskOpen=true;state.view='icon';
            dialog('Disk imported',[state.diskName,'Your disk is ready.']);
        }],['Cancel',closeModal]]);
    }
    const menus = {
        geos:[['GEOS info','geos-info'],['deskTop info','desktop-info'],null,['select printer','printer'],['select input','input'],null,['preference mgr','preferences'],['pad color mgr','colors'],['alarm clock','clock'],['note pad','note'],['calculator','calculator']],
        file:[['new text','new-text'],['new picture','new-picture'],['open','open','O'],['duplicate','duplicate','D'],['rename','rename','R'],['info','info','Q'],['delete','delete'],null,['quit','quit','Z']],
        view:[['by icon','view-icon'],['by size','view-size'],['by type','view-type'],['by date','view-date'],['by name','view-name']],
        disk:[['open','disk-open'],['close','disk-close'],['rename','disk-rename'],['info','disk-info'],['validate','validate'],null,['export','disk-export'],['import','disk-import'],['previous disk','disk-previous']],
        select:[['all','select-all'],['none','select-none']],
        page:[['next','page-next'],['previous','page-previous'],['first','page-first'],['last','page-last']],
        options:[['shortcuts','shortcuts'],['BASIC','quit']]
    };
    const menuWidths = [28,22,27,23,31,27,39];
    function width(value) { return [...String(value)].reduce((n,c)=>n+(glyphs[c]||glyphs['?'])[0].length+1,0); }
    function text(value,x,y,color=INK) {
        ctx.fillStyle=color;
        for (const c of String(value)) { const rows=glyphs[c]||glyphs['?']; rows.forEach((row,j)=>{ [...row].forEach((bit,i)=>{if(bit==='1')ctx.fillRect(x+i,y+j,1,1);});}); x+=rows[0].length+1; }
    }
    function center(value,x,y,w,color=INK) { text(value,Math.round(x+(w-width(value))/2),y,color); }
    function fill(x,y,w,h,color=PAPER) { ctx.fillStyle=color;ctx.fillRect(x,y,w,h); }
    function box(x,y,w,h,color=INK) { fill(x,y,w,1,color);fill(x,y+h-1,w,1,color);fill(x,y,1,h,color);fill(x+w-1,y,1,h,color); }
    function line(x,y,x2,y2) { ctx.beginPath();ctx.moveTo(x+.5,y+.5);ctx.lineTo(x2+.5,y2+.5);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke(); }
    function dither(x,y,w,h) { fill(x,y,w,h,'#bbbbbb');ctx.fillStyle='#777777';for(let j=y;j<y+h;j++)for(let i=x+(j%2);i<x+w;i+=2)ctx.fillRect(i,j,1,1); }
    const tinyGlyphs = Object.fromEntries(Object.entries({"A":"010/101/111/101/101","B":"110/101/110/101/110","C":"011/100/100/100/011","D":"110/101/101/101/110","E":"111/100/110/100/111","F":"111/100/110/100/100","G":"011/100/101/101/011","H":"101/101/111/101/101","I":"111/010/010/010/111","J":"001/001/001/101/010","K":"101/101/110/101/101","L":"100/100/100/100/111","M":"10001/11011/10101/10001/10001","N":"1001/1101/1011/1001/1001","O":"010/101/101/101/010","P":"110/101/110/100/100","Q":"010/101/101/011/001","R":"110/101/110/101/101","S":"011/100/010/001/110","T":"111/010/010/010/010","U":"101/101/101/101/111","V":"101/101/101/101/010","W":"10101/10101/10101/10101/01010","X":"101/101/010/101/101","Y":"101/101/010/010/010","Z":"111/001/010/100/111","a":"000/011/101/101/011","b":"100/110/101/101/110","c":"000/011/100/100/011","d":"001/011/101/101/011","e":"000/010/111/100/011","f":"011/010/111/010/010","g":"000/011/101/011/110","h":"100/110/101/101/101","i":"1/0/1/1/1","j":"01/00/01/01/10","k":"100/101/110/101/101","l":"10/10/10/10/01","m":"00000/11010/10101/10101/10101","n":"000/110/101/101/101","o":"000/010/101/101/010","p":"000/110/101/110/100","q":"000/011/101/011/001","r":"000/101/110/100/100","s":"000/011/110/001/110","t":"010/111/010/010/001","u":"000/101/101/101/011","v":"000/101/101/101/010","w":"00000/10101/10101/10101/01010","x":"000/101/010/010/101","y":"000/101/101/011/110","z":"000/111/001/010/111"," ":"00/00/00/00/00","-":"000/000/111/000/000"}).map(([c,rows])=>[c,rows.split('/')]));
    function tinyRows(c){return tinyGlyphs[c]||[0,1,3,5,6].map(j=>(glyphs[c]||glyphs['?'])[j]);}
    function smallWidth(value){return [...String(value)].reduce((n,c)=>n+tinyRows(c)[0].length+1,0);}
    function smallText(value,x,y,color=INK){ctx.fillStyle=color;for(const c of String(value)){const rows=tinyRows(c);rows.forEach((row,j)=>{[...row].forEach((bit,i)=>{if(bit==='1')ctx.fillRect(x+i,y+j,1,1);});});x+=rows[0].length+1;}}
    function label(value,x,y,w,selected=false){if(selected)fill(x,y,w,8,INK);smallText(value,Math.round(x+(w-smallWidth(value))/2),y+1,selected?PAPER:INK);}
    function element(tag, className) { const el=document.createElement(tag);if(className)el.className=className;return el; }
    function control(key,name,x,y,w,h,action,options={}) {
        const el=element('button','geos-control');el.type='button';el.dataset.key=key;el.setAttribute('aria-label',name);
        Object.assign(el.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
        if(options.role)el.setAttribute('role',options.role);
        if(options.expanded!==undefined)el.setAttribute('aria-expanded',String(options.expanded));
        if(options.selected!==undefined)el.setAttribute('aria-pressed',String(options.selected));
        el.disabled=!!options.disabled;
        el.addEventListener('click',event=>{if(!key.startsWith('file-'))lastFileClick=null;action(event);});
        if(options.doubleClick)el.addEventListener('dblclick',options.doubleClick);
        if(options.hover)el.addEventListener('pointerenter',options.hover);
        controls.appendChild(el);return el;
    }
    function button(key,name,x,y,w,action) { fill(x,y,w,13);box(x,y,w,13);box(x+1,y+1,w-2,11);center(name,x,y+3,w);control(key,name,x,y,w,13,action); }
    function say(value) { status.textContent=value; }
    function icon(kind,x,y) {
        if(kind==='drive') { box(x,y,23,19);box(x+2,y+3,19,12);fill(x+4,y+5,15,2,INK);fill(x+5,y+11,3,2,INK);fill(x+16,y+11,2,2,INK);return; }
        if(kind==='trash') { line(x+3,y+3,x+20,y+3);line(x+1,y+6,x+22,y+6);line(x+3,y+6,x+6,y+22);line(x+20,y+6,x+17,y+22);line(x+6,y+22,x+17,y+22);for(let i=5;i<20;i+=4)line(x+i,y+8,x+i+1,y+19);return; }
        box(x+1,y+1,22,20);fill(x+3,y+3,18,16);
        if(kind==='calculator') {box(x+4,y+4,16,5);for(let r=0;r<3;r++)for(let c=0;c<4;c++)fill(x+4+c*4,y+11+r*3,2,2,INK);}
        else if(kind==='clock'){box(x+5,y+3,15,16);line(x+7,y+5,x+17,y+5);line(x+12,y+7,x+12,y+12);line(x+12,y+12,x+16,y+14);}
        else if(kind==='note'||kind==='readme'){for(let j=7;j<18;j+=3)line(x+5,y+j,x+18,y+j);line(x+4,y+3,x+4,y+19);}
        else if(kind==='preferences'||kind==='colors'){for(let j=0;j<3;j++){line(x+4,y+6+j*5,x+19,y+6+j*5);fill(x+7+j*3,y+4+j*5,3,5,INK);}}
        else if(kind==='mouse'){box(x+8,y+6,9,12);line(x+12,y+6,x+12,y+11);line(x+12,y+6,x+12,y+3);}
        else if(kind==='printer'){box(x+5,y+9,15,8);box(x+7,y+3,11,9);line(x+9,y+5,x+15,y+5);line(x+9,y+7,x+15,y+7);}
        else if(kind==='desktop'){box(x+4,y+4,16,12);line(x+12,y+16,x+12,y+19);line(x+7,y+19,x+17,y+19);}
        else if(kind==='configure'){text('*',x+6,y+8);text('+',x+14,y+5);}
        else {text('G',x+5,y+6);text('S',x+12,y+11);}
    }
    function available() {
        const list=files.filter(f=>f.diskId===state.diskId&&f.id!==state.trash?.id);
        if(state.view==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
        if(state.view==='size')list.sort((a,b)=>b.size-a.size);
        if(state.view==='type')list.sort((a,b)=>a.type.localeCompare(b.type));
        if(state.view==='date')list.sort((a,b)=>a.id-b.id);
        return list;
    }
    function pageFiles() {return available().slice(state.page*8,state.page*8+8);}
    function pages() {return Math.max(1,Math.ceil(available().length/8));}
    function selectedFiles() {return available().filter(f=>state.selected.has(f.id));}
    function deselect() {state.selected.clear();render();}
    function selectFile(file,event) {
        // Selection redraws the buttons, so track pointer clicks by file identity.
        const elapsed=event.timeStamp-(lastFileClick?.timeStamp??-Infinity);
        const doubleClick=event.detail>0&&!event.shiftKey&&lastFileClick?.id===file.id&&elapsed>=0&&elapsed<=500;
        lastFileClick=event.detail>0&&!event.shiftKey?{id:file.id,timeStamp:event.timeStamp}:null;
        if(event.shiftKey){if(state.selected.has(file.id))state.selected.delete(file.id);else state.selected.add(file.id);}else{state.selected.clear();state.selected.add(file.id);}
        say(file.name+' selected. Press Enter to open.');
        if(doubleClick){lastFileClick=null;openFile(file);}else render();
    }
    function drawDesktop() {
        dither(0,0,W,H);
        if(state.pattern)fill(0,12,W,H-12,'#9999aa');
        fill(0,0,W,12);line(0,11,319,11);
        let x=0;
        Object.keys(menus).forEach((name,i)=>{const w=menuWidths[i];const active=state.menu===name;if(active)fill(x,0,w,11,INK);text(name,x+3,2,active?PAPER:INK);line(x+w-1,0,x+w-1,10);control('menu-'+name,name,x,0,w,12,()=>{state.menu=state.menu===name?null:name;state.hover=-1;render();},{role:'menuitem',expanded:active,hover:()=>{if(state.menu&&state.menu!==name){state.menu=name;state.hover=-1;render();}}});x+=w;});
        const now=new Date();const date=String(now.getMonth()+1).padStart(2,'0')+'/'+String(now.getDate()).padStart(2,'0')+'/'+String(now.getFullYear()).slice(-2);
        text(date,219,2);const time=String(now.getHours()%12||12).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');text(time,270,2);text(now.getHours()<12?'AM':'PM',303,2);
        fill(0,14,264,129);box(0,14,264,129);
        for(let y=16;y<28;y+=2)line(2,y,260,y);
        fill(77,15,105,11);center(state.diskOpen?state.diskName:'deskTop',77,17,105);
        fill(242,17,13,8);box(242,17,13,8);fill(245,20,7,2,INK);
        control('disk-close','Close disk',241,15,17,12,()=>act('disk-close'));
        fill(1,28,262,12);line(1,39,262,39);
        if(state.diskOpen){const used=files.reduce((sum,f)=>sum+f.size,0);text(available().length+' files',5,30);text(used+' Kbytes used',68,30);text((165-used)+' Kbytes free',172,30);
            if(state.view==='icon')pageFiles().forEach((file,i)=>{const x=9+(i%4)*63,y=45+Math.floor(i/4)*43;icon(file.icon,x+19,y);label(file.name,x,y+24,61,state.selected.has(file.id));const el=control('file-'+file.id,file.name,x,y,61,35,e=>selectFile(file,e),{selected:state.selected.has(file.id)});el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();openFile(file);}});});
            else pageFiles().forEach((file,i)=>{const y=42+i*10;if(state.selected.has(file.id))fill(3,y,257,10,INK);const c=state.selected.has(file.id)?PAPER:INK;text(file.name,7,y+1,c);text(file.type,106,y+1,c);text(file.size+'K',232,y+1,c);control('file-'+file.id,file.name,3,y,257,10,e=>selectFile(file,e),{selected:state.selected.has(file.id)});});
        }
        for(let x=6;x<239;x+=12){box(x,138,7,9);fill(x+2,140,3,1);}
        fill(239,128,24,15);line(239,142,262,128);text(String(state.page+1),246,132);
        control('page-next','Next page',239,128,24,15,()=>act('page-next'),{disabled:!state.diskOpen||state.page>=pages()-1});
        control('page-previous','Previous page',1,128,22,10,()=>act('page-previous'),{disabled:!state.diskOpen||state.page===0});
        icon('drive',281,26);text('A',286,31);label('GEOS',273,48,43,state.diskOpen);
        control('drive-a','Open GEOS disk in drive A',274,23,43,36,()=>act('disk-open'));
        icon('trash',281,157);if(state.trash)fill(287,166,9,7,INK);control('trash','Waste basket',274,153,43,35,()=>state.trash?dialog('Waste basket',[state.trash.name,'Restore this file?'],[['Restore',()=>{state.trash=null;persistDisk();closeModal();}],['Cancel',closeModal]]):dialog('Waste basket',['The waste basket is empty.']));
        text('GEOS',276,186);text('2.0',284,194);
        text('deskTop',8,185);text('V2.0',8,194);text(state.storageIssue?'session only':'disk saved',80,185);
    }
    function drawMenu(addControls=true) {
        const names=Object.keys(menus),index=names.indexOf(state.menu);let x=menuWidths.slice(0,index).reduce((a,b)=>a+b,0);const items=menus[state.menu],w=state.menu==='geos'?113:state.menu==='file'?94:96;x=Math.min(x,W-w-3);
        const h=items.reduce((sum,item)=>sum+(item?12:4),0)+2;fill(x+2,14,w,h,INK);fill(x,12,w,h);box(x,12,w,h);
        let y=13;items.forEach((item,i)=>{if(!item){line(x+1,y+1,x+w-2,y+1);y+=4;return;}const [name,action,shortcut]=item;const active=i===state.hover;if(active)fill(x+1,y,w-2,12,INK);text(name,x+4,y+2,active?PAPER:INK);if(shortcut)text('C='+shortcut,x+w-25,y+2,active?PAPER:INK);
            if(addControls)control('item-'+action,name,x+1,y,w-2,12,()=>act(action),{role:'menuitem',hover:()=>{if(state.hover!==i){state.hover=i;drawMenu(false);}}});y+=12;});
    }
    function dialog(title,lines,buttons=[['OK',closeModal]],kind='message',value='') {lastFileClick=null;if(editor){editor.remove();editor=null;}if(kind!=='paint'&&paintSurface){paintSurface.remove();paintSurface=null;}state.menu=null;state.modal={title,lines,buttons,kind,value};say(title+'. '+lines.join(' '));render();focusFirst();}
    function closeModal() {
        if(painting){if(state.modal?.kind==='paint')confirmPaint(finishCloseModal);else showPaint();return;}
        if(state.documentEdit){if(state.modal?.kind==='document')confirmDocumentAction(()=>finishCloseModal());else showDocumentEditor();return;}
        finishCloseModal();
    }
    function finishCloseModal() {
        painting=null;if(paintSurface){paintSurface.remove();paintSurface=null;}
        state.documentEdit=null;
        state.modal=null;if(editor){editor.remove();editor=null;}
        const saved=state.launch?.desktop;state.launch=null;
        if(saved){state.page=saved.page;state.view=saved.view;state.diskId=saved.diskId;state.diskOpen=saved.diskOpen;state.selected=new Set(saved.selected);}
        render();
        const key=saved?.focusKey||'menu-geos';
        const target=[...controls.children].find(el=>el.dataset.key===key)||controls.querySelector('[data-key="menu-geos"]');if(target)target.focus();
    }
    function focusFirst() {const target=editor||paintSurface||controls.querySelector('[data-modal="true"]');if(target)target.focus();}
    function drawModal() {
        const m=state.modal;let x=34,y=42,w=252,h=116;if(m.kind==='calculator'){x=82;y=25;w=156;h=165;}if(['note','reader','document'].includes(m.kind)){x=40;y=24;w=240;h=161;}if(m.kind==='paint'){x=4;y=14;w=312;h=183;}
        // The active dialog blocks every desktop control, including keyboard focus.
        controls.replaceChildren();fill(x+3,y+3,w,h,INK);fill(x,y,w,h);box(x,y,w,h);box(x+2,y+2,w-4,h-4);fill(x+3,y+3,w-6,12,INK);center(m.title,x+4,y+5,w-8,PAPER);
        const modalControl=(key,name,bx,by,bw,fn)=>{button(key,name,bx,by,bw,fn);controls.lastElementChild.dataset.modal='true';};
        if(m.kind==='paint') {drawPaint(modalControl);
        } else if(m.kind==='calculator') {
            fill(x+10,y+23,w-20,16);box(x+10,y+23,w-20,16);const display=calc.display.slice(0,18);text(display,x+w-15-width(display),y+28);
            const keys=['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'];keys.forEach((key,i)=>modalControl('calc-'+key,key,x+10+(i%4)*35,y+47+Math.floor(i/4)*23,29,()=>calculate(key)));
            modalControl('modal-close','Close',x+48,y+h-20,60,closeModal);
        } else if(['note','reader','document'].includes(m.kind)) {
            if(!editor){editor=element('textarea','geos-editor');editor.setAttribute('aria-label',m.kind==='reader'?'Document text':m.kind==='document'?'Edit document text':'Note pad text');editor.readOnly=m.kind==='reader';editor.value=m.kind==='reader'?m.value:m.kind==='document'?state.documentEdit.text:state.note;
                if(m.kind==='document'){editor.maxLength=200000;editor.addEventListener('input',()=>{state.documentEdit.text=editor.value;state.documentEdit.message='';state.modal.title=documentTitle();render();});}
                if(m.kind==='note'){editor.maxLength=2000;editor.addEventListener('input',()=>{state.note=editor.value;const file=files.find(file=>file.id===state.launch?.fileId);if(file)file.content=state.note;persistDisk();render();});}desktop.appendChild(editor);}
            Object.assign(editor.style,{left:(x+8)+'px',top:(y+22)+'px',width:(w-16)+'px',height:'108px'});
            if(m.kind==='note')smallText(state.storageIssue?'session only - export disk':'saved to disk',x+8,y+134);
            if(m.kind==='document')smallText(state.documentEdit.message||(documentDirty()?'unsaved changes':state.documentEdit.fileId===null?'not saved yet':'saved to disk'),x+8,y+134);
            if(m.kind==='document'){
                modalControl('document-new','New',x+8,y+h-21,40,newDocument);
                modalControl('document-save','Save',x+55,y+h-21,42,()=>saveDocument());
                modalControl('document-export','Export',x+104,y+h-21,50,exportDocument);
                modalControl('modal-close','Close',x+161,y+h-21,65,closeModal);
            } else if(m.kind==='note'){
                modalControl('document-new','New',x+8,y+h-21,60,newDocument);
                modalControl('document-save-as','Save as',x+84,y+h-21,68,()=>{beginDocument(null,state.note);promptDocumentName(()=>showDocumentEditor(),true);});
                modalControl('modal-close','Close',x+168,y+h-21,60,closeModal);
            } else modalControl('modal-close','Close',x+w-67,y+h-21,58,closeModal);
        } else {
            m.lines.forEach((value,i)=>center(value,x+7,y+24+i*12,w-14));
            if(m.kind==='rename'&&!editor){editor=element('input','geos-editor');editor.type='text';editor.maxLength=16;editor.value=m.value;editor.setAttribute('aria-label',m.title);Object.assign(editor.style,{left:(x+16)+'px',top:(y+50)+'px',width:(w-32)+'px',height:'17px'});desktop.appendChild(editor);editor.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();m.buttons[0][1]();}});}
            const bw=62,total=m.buttons.length*bw+(m.buttons.length-1)*10;let bx=x+Math.floor((w-total)/2);m.buttons.forEach(([name,fn],i)=>modalControl('modal-'+i,name,bx+i*(bw+10),y+h-24,bw,fn));
        }
    }
    function calculate(key) {
        if(key==='C')calc={display:'0',left:null,op:null,fresh:true};
        else if('+-*/='.includes(key)) {const value=Number(calc.display);if(calc.op!==null&&!calc.fresh){const a=calc.left;const result=calc.op==='+'?a+value:calc.op==='-'?a-value:calc.op==='*'?a*value:a/value;calc.display=Number.isFinite(result)?String(Number(result.toPrecision(10))):'Error';}calc.left=Number(calc.display);calc.op=key==='='?null:key;calc.fresh=true;}
        else {calc.display=calc.fresh||calc.display==='0'?key:(calc.display+key).slice(0,16);calc.fresh=false;}say('Calculator: '+calc.display);render();
    }
    function render() {
        if(state.phase!=='desktop')return;
        const active=document.activeElement;focusKey=active&&active.dataset?active.dataset.key:null;
        controls.replaceChildren();controls.setAttribute('role',state.modal?'dialog':'group');controls.setAttribute('aria-label',state.modal?state.modal.title:'Desktop controls');if(state.modal)controls.setAttribute('aria-modal','true');else controls.removeAttribute('aria-modal');ctx.imageSmoothingEnabled=false;drawDesktop();if(state.menu)drawMenu();if(state.modal)drawModal();
        if(focusKey){const target=[...controls.children].find(el=>el.dataset.key===focusKey);if(target)target.focus({preventScroll:true});}
    }
    function rename(title,value,save) {
        dialog(title,['Enter a new name:'],[['OK',()=>{const name=editor.value.trim();if(!name){say('Enter a name.');return;}save(name);persistDisk();closeModal();}],['Cancel',closeModal]],'rename');state.modal.value=value;editor.value=value;editor.select();
    }
    function documentText(file) {return Array.isArray(file.content)?file.content.join('\n'):String(file.content??'');}
    function documentDirty() {const draft=state.documentEdit;return !!draft&&(draft.fileId===null?draft.text.length>0:draft.text!==draft.savedText);}
    function documentTitle() {const draft=state.documentEdit;return (draft.name||'Untitled')+(documentDirty()?' *':'');}
    function showDocumentEditor() {dialog(documentTitle(),[],[['Close',closeModal]],'document');}
    function showScratchNote() {state.documentEdit=null;state.note=files.find(file=>file.id===state.launch?.fileId)?.content??'';dialog('Note Pad',[],[['Close',closeModal]],'note');}
    function beginDocument(file=null,text='') {
        if(file?.locked){dialog(file.name,[],[['Close',closeModal]],'reader',documentText(file));return;}
        state.documentEdit={fileId:file?.id??null,name:file?.name||'',text:file?documentText(file):text,savedText:file?documentText(file):'',message:''};
        showDocumentEditor();
    }
    function confirmDocumentAction(next) {
        if(!documentDirty()){next();return;}
        dialog('Unsaved changes',[state.documentEdit.name||'Untitled','Save your changes first?'],[['Save',()=>saveDocument(next)],['Discard',next],['Cancel',showDocumentEditor]]);
    }
    function newDocument() {
        if(!state.launch){launchById('note');if(!state.launch)return;}
        confirmDocumentAction(()=>beginDocument());
    }
    function promptDocumentName(onSaved,fromScratch=false) {
        dialog('Save document',['Enter a file name:'],[['Save',()=>{
            const name=editor.value.trim();
            if(!name||files.some(file=>file.name.toUpperCase()===name.toUpperCase())){
                state.modal.lines=['Enter a file name:',name?'That name is already used.':'A name is required.'];render();return;
            }
            saveDocument(onSaved,name);
        }],['Cancel',fromScratch?showScratchNote:showDocumentEditor]],'rename',state.documentEdit.name);
        if(fromScratch)state.modal.cancel=showScratchNote;
    }
    function saveDocument(onSaved=showDocumentEditor,name=null) {
        const draft=state.documentEdit;if(!draft)return;
        if(draft.fileId===null&&name===null){promptDocumentName(onSaved);return;}
        if(draft.fileId===null&&name!==null)draft.name=name;
        const index=files.findIndex(file=>file.id===draft.fileId),original=files[index];
        if(draft.fileId!==null&&(!original||original.locked||original.id===state.trash?.id)){
            draft.message='Document is not writable.';showDocumentEditor();return;
        }
        const app=files.find(file=>file.id===state.launch?.fileId);
        if(!app){draft.message='Note Pad is unavailable.';showDocumentEditor();return;}
        let id=0;while(files.some(file=>file.id===id))id++;
        const updated={...(original||{id,name,geosType:GEOS_TYPE.DOCUMENT,type:'document',icon:'note',diskId:state.diskId,structure:'sequential',locked:false,
            parentApplication:app.name,parentDiskId:app.diskId}),content:draft.text,size:Math.max(1,Math.ceil(new Blob([draft.text]).size/1024))};
        const candidate=diskSnapshot();if(index<0)candidate.files.push(updated);else candidate.files[index]=updated;
        try{decodeDisk(JSON.stringify(candidate));}catch(e){draft.message='Disk full. Export your text.';showDocumentEditor();return;}
        if(index<0)files.push(updated);else files[index]=updated;
        if(!persistDisk()){
            if(index<0)files.pop();else files[index]=original;
            draft.message='Not saved. Export your text.';showDocumentEditor();return;
        }
        draft.fileId=updated.id;draft.name=updated.name;draft.savedText=draft.text;draft.message='Saved to disk.';
        const position=available().findIndex(file=>file.id===updated.id);
        Object.assign(state.launch.desktop,{page:Math.floor(position/8),diskOpen:true,selected:[updated.id],focusKey:'file-'+updated.id});
        onSaved();
    }
    function exportDocument() {
        const draft=state.documentEdit;if(!draft)return;
        let name=(draft.name||'untitled').replace(/[\\/:*?"<>|]/g,'_');if(!name.toLowerCase().endsWith('.txt'))name+='.txt';
        downloadFile(draft.text,name,'text/plain;charset=utf-8');say('Document text downloaded.');
    }
    function paintDirty(){return !!painting&&painting.pixels.join('')!==painting.saved;}
    function showPaint(){dialog((painting.name||'Untitled picture')+(paintDirty()?' *':''),[],[['Close',closeModal]],'paint');}
    function beginPaint(file=null){
        if(file&&!file.picture){dialog('Paint',['This file has no picture data.']);return;}
        const pixels=file?file.picture.pixels:'0'.repeat(PAINT_W*PAINT_H);
        painting={fileId:file?.id??null,name:file?.name||'',pixels:[...pixels],saved:pixels,locked:!!file?.locked,tool:'pencil',color:'1',undo:[],cursor:[0,0],stroke:null,message:''};showPaint();
    }
    function confirmPaint(next){
        if(!paintDirty()){next();return;}
        dialog('Unsaved picture',['Save your changes first?'],[['Save',()=>savePaint(next)],['Discard',next],['Cancel',showPaint]]);
    }
    function newPaint(){
        if(!state.launch){
            if(!available().some(file=>file.applicationId==='paint')){
                let id=0;while(files.some(file=>file.id===id))id++;
                let name='PAINT',n=2;while(files.some(file=>file.name.toUpperCase()===name))name='PAINT '+n++;
                const app={id,name,geosType:6,type:'application',size:4,icon:'note',applicationId:'paint',diskId:state.diskId,structure:'sequential',locked:false};
                const candidate=diskSnapshot();candidate.files.push(app);
                try{decodeDisk(JSON.stringify(candidate));}catch(e){dialog('Paint unavailable',['Disk full. Make room for Paint.']);return;}
                files.push(app);if(!persistDisk()){files.pop();dialog('Paint unavailable',['Disk could not be saved.','Export your disk for backup.']);return;}
            }
            launchById('paint');return;
        }
        confirmPaint(()=>beginPaint());
    }
    function paintRemember(){painting.undo.push(painting.pixels.join(''));if(painting.undo.length>12)painting.undo.shift();painting.message='';}
    function paintPoint(x,y,color){if(x>=0&&y>=0&&x<PAINT_W&&y<PAINT_H)painting.pixels[y*PAINT_W+x]=color;}
    // Integer raster primitives: inclusive endpoints, clipped to this picture's bounds.
    function paintLine(x,y,x2,y2,color){
        const dx=Math.abs(x2-x),sx=x<x2?1:-1,dy=-Math.abs(y2-y),sy=y<y2?1:-1;let error=dx+dy;
        while(true){paintPoint(x,y,color);if(x===x2&&y===y2)break;const e=2*error;if(e>=dy){error+=dy;x+=sx;}if(e<=dx){error+=dx;y+=sy;}}
    }
    function paintFill(x,y,color){
        const old=painting.pixels[y*PAINT_W+x];if(old===color)return;
        const stack=[[x,y]];paintPoint(x,y,color);
        while(stack.length){const [px,py]=stack.pop();for(const [nx,ny] of [[px-1,py],[px+1,py],[px,py-1],[px,py+1]]){
            if(nx>=0&&ny>=0&&nx<PAINT_W&&ny<PAINT_H&&painting.pixels[ny*PAINT_W+nx]===old){paintPoint(nx,ny,color);stack.push([nx,ny]);}
        }}
    }
    function paintStart(x,y){
        if(painting.locked)return;paintRemember();painting.cursor=[x,y];
        painting.stroke={start:[x,y],last:[x,y],base:painting.pixels.join('')};paintMove(x,y);
    }
    function paintMove(x,y){
        const p=painting,s=p.stroke;if(!s)return;const color=p.tool==='eraser'?'0':p.color;
        if(p.tool==='fill'){paintFill(...s.start,color);p.stroke=null;}
        else if(p.tool==='line'||p.tool==='rect'){
            p.pixels=[...s.base];const [a,b]=s.start;
            if(p.tool==='line')paintLine(a,b,x,y,color);
            else {paintLine(a,b,x,b,color);paintLine(x,b,x,y,color);paintLine(x,y,a,y,color);paintLine(a,y,a,b,color);}
        }else paintLine(...s.last,x,y,color);
        if(p.stroke)p.stroke.last=[x,y];p.cursor=[x,y];state.modal.title=(p.name||'Untitled picture')+(paintDirty()?' *':'');render();
    }
    function drawPaint(addButton){
        const p=painting;
        ['pencil','eraser','fill','line','rect'].forEach((tool,i)=>{const bx=10+i*61;addButton('paint-'+tool,tool,bx,32,57,()=>{p.tool=tool;render();});controls.lastElementChild.setAttribute('aria-pressed',String(p.tool===tool));if(p.tool===tool)box(bx-1,31,59,15);});
        box(31,51,258,114);
        for(let y=0;y<PAINT_H;y++)for(let x=0;x<PAINT_W;x++)fill(32+x*2,52+y*2,2,2,paintColors[Number(p.pixels[y*PAINT_W+x])]);
        paintColors.forEach((color,i)=>{fill(10,52+i*14,15,12,color);box(10,52+i*14,15,12);if(p.color===String(i))box(8,50+i*14,19,16);control('paint-color-'+i,'Color '+['white','black','red','green','blue','purple','yellow','light blue'][i],8,50+i*14,19,16,()=>{p.color=String(i);render();},{selected:p.color===String(i)});controls.lastElementChild.dataset.modal='true';});
        smallText(p.message||(p.locked?'write protected':paintDirty()?'unsaved changes':'128 x 56 - '+p.tool),32,169);
        addButton('paint-new','New',10,181,45,newPaint);
        addButton('paint-save','Save',61,181,46,()=>savePaint());
        addButton('paint-undo','Undo',113,181,46,()=>{if(p.locked)return;const previous=p.undo.pop();if(previous){p.pixels=[...previous];showPaint();}});
        addButton('paint-export','Export',165,181,62,exportPaint);
        addButton('modal-close','Close',233,181,70,closeModal);
        if(!paintSurface){
            paintSurface=element('div','geos-paint-surface');paintSurface.tabIndex=0;paintSurface.setAttribute('role','group');paintSurface.setAttribute('aria-label','Picture canvas. Drag to draw. Arrow keys move; Space draws. Line and rectangle: Space to start, arrows, Space to finish.');
            const position=e=>{const rect=paintSurface.getBoundingClientRect();return [Math.max(0,Math.min(PAINT_W-1,Math.floor((e.clientX-rect.left)*PAINT_W/rect.width))),Math.max(0,Math.min(PAINT_H-1,Math.floor((e.clientY-rect.top)*PAINT_H/rect.height)))];};
            paintSurface.addEventListener('pointerdown',e=>{if(e.button!==0||painting.locked||painting.pointerId!==undefined)return;e.preventDefault();painting.pointerId=e.pointerId;paintSurface.focus();paintSurface.setPointerCapture(e.pointerId);paintStart(...position(e));});
            paintSurface.addEventListener('pointermove',e=>{if(painting.stroke&&painting.pointerId===e.pointerId){e.preventDefault();paintMove(...position(e));}});
            paintSurface.addEventListener('pointerup',e=>{if(painting.pointerId!==e.pointerId)return;if(painting.stroke)paintMove(...position(e));painting.stroke=null;delete painting.pointerId;});
            paintSurface.addEventListener('pointercancel',()=>{delete painting.pointerId;if(painting.stroke){painting.pixels=[...painting.stroke.base];painting.stroke=null;render();}});
            paintSurface.addEventListener('lostpointercapture',()=>{painting.stroke=null;delete painting.pointerId;});desktop.appendChild(paintSurface);
        }
    }
    function savePaint(next=showPaint,name=null){
        const p=painting;if(!p||p.locked)return;
        if(p.fileId===null&&name===null){
            dialog('Save picture',['Enter a file name:'],[['Save',()=>{const value=editor.value.trim();if(!value||files.some(f=>f.name.toUpperCase()===value.toUpperCase())){state.modal.lines=['Enter a file name:',value?'That name is already used.':'A name is required.'];render();return;}savePaint(next,value);}],['Cancel',showPaint]],'rename',p.name);return;
        }
        const index=files.findIndex(f=>f.id===p.fileId),old=files[index],app=files.find(f=>f.id===state.launch?.fileId);
        if(!app||(p.fileId!==null&&(!old||old.locked||old.id===state.trash?.id))){p.message='Picture is not writable.';showPaint();return;}
        let id=0;while(files.some(f=>f.id===id))id++;
        const updated={...(old||{id,name,geosType:7,type:'document',icon:'note',diskId:state.diskId,structure:'sequential',locked:false,parentApplication:app.name,parentDiskId:app.diskId}),size:7,picture:{width:PAINT_W,height:PAINT_H,pixels:p.pixels.join('')}};
        const candidate=diskSnapshot();if(index<0)candidate.files.push(updated);else candidate.files[index]=updated;
        try{decodeDisk(JSON.stringify(candidate));}catch(e){p.message='Disk full. Export your picture.';showPaint();return;}
        if(index<0)files.push(updated);else files[index]=updated;
        if(!persistDisk()){if(index<0)files.pop();else files[index]=old;p.message='Not saved. Export your picture.';showPaint();return;}
        p.fileId=updated.id;p.name=updated.name;p.saved=updated.picture.pixels;p.message='Saved to disk.';
        const position=available().findIndex(f=>f.id===updated.id);Object.assign(state.launch.desktop,{page:Math.floor(position/8),diskOpen:true,selected:[updated.id],focusKey:'file-'+updated.id});next();
    }
    function exportPaint(){
        // Portable SVG keeps the exact pixels and opens without this website.
        let rectangles='';painting.pixels.forEach((color,i)=>{if(color!=='0')rectangles+='<rect x="'+(i%PAINT_W)+'" y="'+Math.floor(i/PAINT_W)+'" width="1" height="1" fill="'+paintColors[Number(color)]+'"/>';});
        downloadFile('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="224" viewBox="0 0 128 56" shape-rendering="crispEdges"><rect width="128" height="56" fill="white"/>'+rectangles+'</svg>',(painting.name||'untitled').replace(/[\\/:*?"<>|]/g,'_')+'.svg','image/svg+xml');
    }
    const applications = new Map([
        ['paint',{geosType:6,open:document=>beginPaint(document)}],
        ['desktop',{geosType:6,open:()=>closeModal()}],
        ['configure',{geosType:6,open:()=>dialog('CONFIGURE 2.0',['Drive A: 1541   Device 8','Input: mouse / keyboard','64K RAM'])}],
        ['preferences',{geosType:5,open:()=>dialog('Preference Manager',['Pointer: mouse / touch','Display: 320 x 200','Tab: select   Enter: open','Esc: close   F1: shortcuts'])}],
        ['colors',{geosType:5,open:()=>dialog('Pad Color Manager',['Choose a desktop pattern.'],[['Change',()=>{state.pattern=state.pattern?0:1;persistDisk();render();}],['Close',closeModal]])}],
        ['clock',{geosType:5,open:()=>{const now=new Date();dialog('Alarm Clock',[now.toLocaleDateString('en-US'),now.toLocaleTimeString('en-US'),'System clock']);}}],
        ['calculator',{geosType:5,open:()=>{calc={display:'0',left:null,op:null,fresh:true};dialog('Calculator',[],[['Close',closeModal]],'calculator');}}],
        ['note',{geosType:5,open:document=>document?beginDocument(document):showScratchNote()}],
        ['text-reader',{geosType:6,open:document=>document?dialog(document.name,[],[['Close',closeModal]],'reader',Array.isArray(document.content)?document.content.join('\n'):String(document.content??'')):
            dialog('Text Reader',['Open a document from','the disk to read it.'],[['Close',closeModal]])}]
    ]);
    function cannotOpen() {dialog('Open',["This file can't be opened",'from the deskTop.']);}
    function launchApplication(file,document=null) {
        const app=applications.get(file.applicationId);
        const type=file.geosType===GEOS_TYPE.AUTO_EXEC?GEOS_TYPE.APPLICATION:file.geosType;
        if(!app||app.geosType!==type){dialog('Application unavailable',[file.name,'This application is not','available yet.']);return;}
        if(state.launch)return;
        state.launch={fileId:file.id,documentId:document?.id??null,desktop:{page:state.page,view:state.view,diskOpen:state.diskOpen,diskId:state.diskId,
            selected:[...state.selected],focusKey:document?'file-'+document.id:'file-'+file.id}};
        app.open(document);
    }
    function launchById(applicationId) {
        const file=available().find(f=>f.applicationId===applicationId);
        if(!file){dialog('Application unavailable',['This application is not','on the current disk.']);return;}
        launchApplication(file);
    }
    function openFile(file) {
        state.menu=null;
        if(selectedFiles().length>1){dialog('Open',['No multiple file operation for','this feature.']);return;}
        if(!state.diskOpen||!available().includes(file)){dialog('Open',['This file is not on','the current disk.']);return;}
        switch(file.geosType) {
            case GEOS_TYPE.ACCESSORY:
            case GEOS_TYPE.APPLICATION:
            case GEOS_TYPE.AUTO_EXEC:launchApplication(file);return;
            case GEOS_TYPE.DOCUMENT:{
                if(!file.parentApplication){cannotOpen();return;}
                const app=available().find(f=>([GEOS_TYPE.APPLICATION,GEOS_TYPE.AUTO_EXEC].includes(f.geosType)||(f.geosType===GEOS_TYPE.ACCESSORY&&f.applicationId==='note'))&&
                    f.diskId===(file.parentDiskId||file.diskId)&&f.name.toUpperCase()===file.parentApplication.toUpperCase());
                if(!app){dialog('Application not found',[file.parentApplication,'is not on the current disk.','Restore the application','and choose Retry.'],[['Retry',()=>openFile(file)],['Cancel',closeModal]]);return;}
                launchApplication(app,file);return;
            }
            default:cannotOpen();
        }
    }
    function act(action) {
        state.menu=null;state.hover=-1;
        const selected=selectedFiles(),file=selected[0];
        if(action.startsWith('view-')){state.view=action.slice(5);state.page=0;state.selected.clear();}
        else switch(action) {
            case 'geos-info':dialog('GEOS info',['GEOS 64   Version 2.0','Graphic Environment','Operating System','Berkeley Softworks 1988']);return;
            case 'desktop-info':dialog('deskTop info',['deskTop   Version 2.0','A browser recreation for','GENX JAY','jasonstum.com']);return;
            case 'open':if(file){openFile(file);return;}dialog('Open',['Select a file first.']);return;
            case 'new-text':newDocument();return;
            case 'new-picture':newPaint();return;
            case 'info':if(!file){dialog('File info',['Select a file first.']);return;}dialog('File info',[file.name,file.type,file.size+' Kbytes',file.locked?'write protected':'not write protected',file.parentApplication?'opens with '+file.parentApplication:file.structure]);return;
            case 'rename':if(!file){dialog('Rename',['Select a file first.']);return;}if(file.locked){dialog('Rename',['This system file is protected.']);return;}rename('Rename file',file.name,name=>{file.name=name;});return;
            case 'duplicate':if(!file){dialog('Duplicate',['Select a file first.']);return;}if(files.reduce((n,f)=>n+f.size,0)+file.size>165){dialog('Duplicate',['Disk full.']);return;}{let id=0;while(files.some(file=>file.id===id))id++;let name,count=1;do{const prefix=count===1?'copy ':'copy '+count+' ';name=prefix+file.name.slice(0,16-prefix.length);count++;}while(files.some(file=>file.name.toUpperCase()===name.toUpperCase()));const copy={...file,id,name,locked:[4,12].includes(file.geosType)};const candidate=diskSnapshot();candidate.files.push(copy);try{decodeDisk(JSON.stringify(candidate));}catch(e){dialog('Duplicate',['Disk full.']);return;}files.push(copy);persistDisk();}break;
            case 'delete':if(!file){dialog('Delete',['Select a file first.']);return;}if(file.locked){dialog('Delete',['This system file is protected.']);return;}dialog('Delete file',[file.name,'Move to the waste basket?'],[['Delete',()=>{state.trash=file;state.selected.clear();state.page=Math.min(state.page,pages()-1);persistDisk();closeModal();}],['Cancel',closeModal]]);return;
            case 'disk-open':state.diskOpen=true;break;
            case 'disk-close':state.diskOpen=false;state.selected.clear();break;
            case 'disk-rename':rename('Rename disk',state.diskName,name=>{state.diskName=name;});return;
            case 'disk-info':dialog('Disk info',[state.diskName,'Drive A: 1541   Device 8','165 Kbytes total',state.storageIssue||'Saved in this browser.']);return;
            case 'disk-export':exportDisk();break;
            case 'disk-import':diskPicker.click();break;
            case 'disk-previous':try{const backup=localStorage.getItem(BACKUP_KEY);if(backup===null)dialog('Previous disk',['No previous copy is available.']);else previewImport(backup);}catch(e){dialog('Previous disk',['Browser storage is unavailable.']);}return;
            case 'validate':dialog('Validate',['Disk validated.','No errors found.']);return;
            case 'select-all':if(state.diskOpen)pageFiles().forEach(f=>state.selected.add(f.id));break;
            case 'select-none':state.selected.clear();break;
            case 'page-next':if(state.diskOpen)state.page=Math.min(pages()-1,state.page+1);state.selected.clear();break;
            case 'page-previous':if(state.diskOpen)state.page=Math.max(0,state.page-1);state.selected.clear();break;
            case 'page-first':state.page=0;state.selected.clear();break;
            case 'page-last':state.page=pages()-1;state.selected.clear();break;
            case 'printer':dialog('Select printer',['MPS-801','Printer driver selected.']);return;
            case 'input':dialog('Select input',['Mouse / touch / keyboard','Input driver selected.']);return;
            case 'preferences':case 'colors':case 'clock':case 'calculator':case 'note':launchById(action);return;
            case 'shortcuts':dialog('Shortcuts',['Tab / arrows: select controls','Enter / Space: activate','Page Up / Down: turn page','Esc: close   Alt+B: BASIC']);return;
            case 'quit':if(painting){confirmPaint(leave);return;}if(state.documentEdit){confirmDocumentAction(()=>{state.documentEdit=null;leave();});return;}dialog('Return to BASIC',['Leave GEOS and return to BASIC?'],[['OK',leave],['Cancel',closeModal]]);return;
        }
        render();
    }
    function fit() {if(!root)return;const scale=Math.max(.5,Math.min(4,Math.floor(Math.min((innerWidth-24)/344,(innerHeight-24)/224)*4)/4));root.style.setProperty('--geos-scale',scale);}
    function setup() {
        if(root)return;
        root=element('section','geos-shell');root.hidden=true;root.setAttribute('aria-label','GEOS 2.0 desktop');
        const monitor=element('div','geos-monitor'),viewport=element('div','geos-viewport');desktop=element('div','geos-desktop');desktop.tabIndex=-1;
        canvas=element('canvas');canvas.width=W;canvas.height=H;canvas.setAttribute('aria-hidden','true');ctx=canvas.getContext('2d');
        controls=element('div','geos-controls');controls.setAttribute('aria-label','Desktop controls');
        status=element('div','geos-sr-only');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
        diskPicker=element('input');diskPicker.type='file';diskPicker.accept='.json,application/json';diskPicker.hidden=true;
        diskPicker.addEventListener('change',async()=>{const file=diskPicker.files?.[0],request=++importRequest;diskPicker.value='';if(!file)return;
            if(file.size>1000000){dialog('Import failed',['Disk backup is too large.']);return;}
            try{const raw=await file.text();if(state.phase==='desktop'&&request===importRequest&&!state.launch)previewImport(raw);}catch(e){if(state.phase==='desktop'&&request===importRequest&&!state.launch)dialog('Import failed',['This backup could not be read.','The current disk is unchanged.']);}});
        root.appendChild(diskPicker);
        desktop.append(canvas,controls,status);viewport.append(desktop);monitor.append(viewport);root.append(monitor);document.body.append(root);
        desktop.addEventListener('click',e=>{if(e.target===canvas||e.target===controls){state.menu=null;deselect();}});
        window.addEventListener('resize',fit);
    }
    function leave() {
        painting=null;if(paintSurface){paintSurface.remove();paintSurface=null;}
        timers.forEach(clearTimeout);timers=[];clearInterval(clockTimer);importRequest++;state.phase='off';state.menu=null;state.modal=null;state.launch=null;state.documentEdit=null;lastFileClick=null;
        if(root)root.hidden=true;if(editor){editor.remove();editor=null;}
        document.body.classList.remove('geos-active');callbacks.onExit();
    }
    function boot(options) {
        if(state.phase!=='off')return;callbacks=options;state.phase='loading';setup();loadDisk();
        state.page=0;state.view='icon';state.diskOpen=true;state.selected.clear();state.menu=null;
        options.output('SEARCHING FOR GEOS');
        // Static loading text still needs reading time when reduced motion is enabled.
        const delay=900;
        timers.push(setTimeout(()=>options.output('FOUND GEOS'),delay));
        timers.push(setTimeout(()=>options.output('LOADING'),delay*2));
        timers.push(setTimeout(()=>{state.phase='desktop';root.hidden=false;document.body.classList.add('geos-active');fit();render();desktop.focus();say(state.storageIssue?state.storageIssue+' Changes are session only. Use disk > export for backup.':'GEOS 2.0 desktop. Tab to explore menus and files.');clockTimer=setInterval(()=>{if(!state.modal&&!state.menu)render();},30000);},delay*4));
    }
    document.addEventListener('keydown',event=>{
        if(state.phase==='off')return;
        // Browser shortcuts remain available. Stop BASIC from receiving GEOS keys.
        event.stopImmediatePropagation();
        if(state.phase==='loading'){if(event.key==='Escape'){event.preventDefault();leave();}return;}
        if(event.key==='Escape'){event.preventDefault();if(state.modal?.cancel)state.modal.cancel();else if(state.modal)closeModal();else if(state.menu){state.menu=null;render();}else act('quit');return;}
        if(event.altKey&&event.key.toLowerCase()==='b'){event.preventDefault();act('quit');return;}
        if(state.modal?.kind==='paint'){
            if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();savePaint();return;}
            if(event.target===paintSurface){
                const p=painting,[x,y]=p.cursor;
                if(event.key.startsWith('Arrow')){event.preventDefault();p.cursor=[Math.max(0,Math.min(PAINT_W-1,x+(event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0))),Math.max(0,Math.min(PAINT_H-1,y+(event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0)))];if(p.stroke)paintMove(...p.cursor);say('Picture '+p.cursor.join(', '));return;}
                if(event.key===' '||event.key==='Enter'){event.preventDefault();if(p.stroke){paintMove(x,y);p.stroke=null;}else{paintStart(x,y);if(!['line','rect'].includes(p.tool))p.stroke=null;}return;}
            }
        }
        if(state.modal?.kind==='document'&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();saveDocument();return;}
        if(event.target===editor&&event.key!=='Tab'){if(event.key==='Enter'&&state.modal?.kind==='rename'){event.preventDefault();state.modal.buttons[0][1]();}return;}
        if(!state.modal&&event.key==='Enter'&&event.target.dataset?.key?.startsWith('file-')){event.preventDefault();const file=files.find(f=>f.id===Number(event.target.dataset.key.slice(5)));if(file)openFile(file);return;}
        if(event.key==='F1'){event.preventDefault();act('shortcuts');return;}
        if(state.modal&&state.modal.kind==='calculator'&&/^[0-9+*/=\-]$/.test(event.key)){event.preventDefault();calculate(event.key);return;}
        if(state.modal&&event.key==='Enter'&&event.target===desktop){event.preventDefault();state.modal.buttons[0][1]();return;}
        if(event.key==='Tab'){const list=[...controls.querySelectorAll('button:not(:disabled)')];if(editor)list.unshift(editor);if(paintSurface)list.unshift(paintSurface);if(list.length){event.preventDefault();let i=list.indexOf(document.activeElement);i=i<0?(event.shiftKey?list.length-1:0):(i+(event.shiftKey?-1:1)+list.length)%list.length;list[i].focus();}return;}
        if(!state.modal&&(event.key==='PageDown'||event.key==='PageUp')){event.preventDefault();act(event.key==='PageDown'?'page-next':'page-previous');return;}
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const list=[...controls.querySelectorAll('button:not(:disabled)')];let i=list.indexOf(document.activeElement);const step=event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1;list[(i+step+list.length)%list.length]?.focus();return;}
        if(!state.modal&&event.key==='Enter'&&event.target===desktop){event.preventDefault();act('open');}
    },true);
    // Pasting into the note pad must never execute commands in the hidden BASIC prompt.
    document.addEventListener('paste',event=>{if(state.phase!=='off')event.stopImmediatePropagation();},true);
    window.addEventListener('beforeunload',event=>{if(documentDirty()||paintDirty()){event.preventDefault();event.returnValue='';}});
    window.GEOS={boot,get active(){return state.phase!=='off';}};
})();


// Select the cursor-line element
const cursorLine = document.querySelector(".cursor-line");

// Track the input state
let inputBuffer = []; // Array to store characters with their colors
let currentTextColor = "#7C71DB"; // Default text color (LIGHT BLUE)
let programLines = {}; // Store program lines as key-value pairs
let variables = {}; // Store BASIC variables
let programCounter = 0; // Current line being executed
let running = false; // Program execution state
let programRunning = false; // Async program loop active (defer READY until done)
let keyQueue = []; // Keys waiting to be consumed by BASIC GET

// Define color codes
const colors = {
    0: "#000000",
    1: "#FFFFFF",
    2: "#880000",
    3: "#AAFFEE",
    4: "#CC44CC",
    5: "#00CC55",
    6: "#0000AA",
    7: "#EEEE77",
    8: "#DD8855",
    9: "#664400",
    10: "#FF7777",
    11: "#333333",
    12: "#777777",
    13: "#AAFF66",
    14: "#0088FF",
    15: "#BBBBBB"
};

// BASIC Parser and Executor
class BasicInterpreter {
    constructor() {
        this.variables = {};
        this.strings = {};
        this.program = {};
        this.stack = [];
        this.forStack = [];
        this.lastLine = 0;
        this.data = [];
        this.readPointer = 0;
    }

    // Parse a line of BASIC code
    parseLine(line) {
        line = line.trim().toUpperCase();
        
        // Check for line number
        const lineNumMatch = line.match(/^(\d+)\s*(.+)$/);
        if (lineNumMatch) {
            const lineNumber = parseInt(lineNumMatch[1]);
            const statement = lineNumMatch[2].trim();
            
            if (statement) {
                programLines[lineNumber] = statement;
            } else {
                delete programLines[lineNumber];
            }
            return { type: 'store', lineNumber };
        }
        
        // Direct command (no line number)
        return { type: 'command', statement: line };
    }

    // Execute a single statement
    executeStatement(statement) {
        statement = statement.trim();
        
        if (!statement) return;
        
        // ? shorthand for PRINT
        if (statement.startsWith('?')) {
            return this.executePrint(statement.substring(1));
        }

        // PRINT statement
        if (statement.startsWith('PRINT')) {
            return this.executePrint(statement.substring(5));
        }
        
        // POKE memory-mapped screen and text colors
        if (statement.startsWith('POKE ')) {
            return this.executePoke(statement.substring(5));
        }

        // GET reads one queued key into a string variable, or an empty string
        if (statement.startsWith('GET ')) {
            return this.executeGet(statement.substring(4));
        }

        // LET statement (explicit or implicit)
        if (statement.startsWith('LET ')) {
            return this.executeLet(statement.substring(4));
        }
        
        // Variable assignment
        if (statement.includes('=') && !statement.startsWith('IF') && !statement.startsWith('FOR ')) {
            return this.executeLet(statement);
        }
        
        // LIST command
        if (statement === 'LIST') {
            return this.executeList();
        }
        
        // RUN command
        if (statement === 'RUN') {
            return this.executeRun();
        }
        
        // NEW command
        if (statement === 'NEW') {
            return this.executeNew();
        }
        
        // GOTO command
        if (statement.startsWith('GOTO')) {
            return this.executeGoto(statement.substring(4));
        }

        // GOSUB command
        if (statement.startsWith('GOSUB')) {
            return this.executeGosub(statement.substring(5));
        }

        // RETURN command
        if (statement === 'RETURN') {
            return this.executeReturn();
        }

        // FOR command
        if (statement.startsWith('FOR ')) {
            return this.executeFor(statement.substring(4));
        }

        // NEXT command
        if (statement.startsWith('NEXT')) {
            return this.executeNext(statement.substring(4));
        }

        // IF/THEN command
        if (statement.startsWith('IF ')) {
            return this.executeIf(statement.substring(3));
        }

        // END/STOP halts the program
        if (statement === 'END' || statement === 'STOP') {
            running = false;
            return;
        }

        throw new Error(`?SYNTAX ERROR`);
    }

    executePrint(args) {
        args = args.trim();

        if (/^CHR\$\(\s*147\s*\);?$/.test(args)) {
            clearScreen();
            return;
        }

        if (!args) {
            this.outputLine('');
            return;
        }

        // Split on ; and , outside of quotes
        const parts = [];
        let cur = '', inQuote = false;
        for (const ch of args) {
            if (ch === '"') inQuote = !inQuote;
            if ((ch === ';' || ch === ',') && !inQuote) {
                parts.push({ text: cur, sep: ch });
                cur = '';
            } else {
                cur += ch;
            }
        }
        parts.push({ text: cur, sep: '' });

        let output = '';
        for (const { text, sep } of parts) {
            const t = text.trim();
            if (t) {
                if (t.startsWith('"') && t.endsWith('"')) {
                    output += t.slice(1, -1);
                } else {
                    output += this.evaluateExpression(t).toString();
                }
            }
            // Comma advances to the next 10-column tab stop, like a real C64
            if (sep === ',') {
                output += ' '.repeat(10 - (output.length % 10));
            }
        }

        this.outputLine(output);
    }

    executeLet(statement) {
        statement = statement.trim();
        const equals = statement.indexOf('=');
        if (equals === -1) throw new Error('?SYNTAX ERROR');
        const varName = statement.substring(0, equals).trim();
        const expr = statement.substring(equals + 1).trim();

        if (!this.isValidVariable(varName)) {
            throw new Error(`?SYNTAX ERROR`);
        }

        const value = this.evaluateExpression(expr);
        if (varName.endsWith('$')) {
            this.strings[varName] = String(value);
        } else {
            this.variables[varName] = value;
        }
    }

    executeGet(varName) {
        varName = varName.trim();
        if (!/^([A-Z][A-Z0-9]?\$)$/.test(varName)) {
            throw new Error('?SYNTAX ERROR');
        }
        this.strings[varName] = keyQueue.shift() || '';
    }

    executePoke(args) {
        const m = args.match(/^(\d+)\s*,\s*(.+)$/);
        if (!m) throw new Error('?SYNTAX ERROR');
        const address = Number(m[1]);
        const value = this.evaluateExpression(m[2]);
        if (!Number.isInteger(value) || value < 0 || value > 255) {
            throw new Error('?ILLEGAL QUANTITY ERROR');
        }
        if (address === 53280 || address === 53281 || address === 646) {
            if (value > 15) throw new Error('?ILLEGAL QUANTITY ERROR');
            if (address === 53280) {
                document.querySelector('.screen').style.borderColor = colors[value];
                document.body.style.backgroundColor = colors[value];
            } else if (address === 53281) {
                document.querySelector('.screen').style.backgroundColor = colors[value];
            } else {
                currentTextColor = colors[value];
                updateCursorColor(currentTextColor);
            }
        }
    }

    executeList() {
        const lineNumbers = Object.keys(programLines).map(Number).sort((a, b) => a - b);
        for (const lineNum of lineNumbers) {
            this.outputLine(`${lineNum} ${programLines[lineNum]}`);
        }
    }

    executeProgramLine(line) {
        const statements = [];
        let current = '';
        let inQuote = false;
        for (const ch of line) {
            if (ch === '"') inQuote = !inQuote;
            if (ch === ':' && !inQuote) {
                statements.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        statements.push(current.trim());

        for (const statement of statements) {
            const before = programCounter;
            this.executeStatement(statement);
            if (!running || programCounter !== before) break;
        }
    }

    executeRun() {
        const lineNumbers = Object.keys(programLines).map(Number).sort((a, b) => a - b);
        running = true;
        programRunning = true;
        programCounter = 0;
        this.stack = [];
        this.forStack = [];
        keyQueue = [];

        const step = () => {
            try {
                if (running && programCounter < lineNumbers.length) {
                    const lineNum = lineNumbers[programCounter];
                    const statement = programLines[lineNum];
                    this.lastLine = lineNum;
                    // 10 PRINT CHR$(205.5+RND(1)); : GOTO 10 maze easter egg
                    if (/CHR\$?\(\s*205/.test(statement) && /GOTO/.test(statement)) {
                        running = false;
                        programRunning = false;
                        startMaze();
                        return;
                    }
                    this.executeProgramLine(statement);
                    programCounter++;
                }
            } catch (error) {
                this.outputLine(error.message);
                running = false;
            }

            if (running && programCounter < lineNumbers.length) {
                requestAnimationFrame(step); // Let visual POKEs repaint between BASIC lines
            } else if (programRunning) {
                running = false;
                programRunning = false;
                addReadyPrompt();
            }
        };
        step();
    }

    executeNew() {
        programLines = {};
        variables = {};
        this.variables = {};
        this.strings = {};
        this.stack = [];
        this.forStack = [];
        keyQueue = [];
    }

    executeGoto(target) {
        const lineNum = parseInt(target.trim());
        const lineNumbers = Object.keys(programLines).map(Number).sort((a, b) => a - b);
        const index = lineNumbers.indexOf(lineNum);
        
        if (index === -1) {
            throw new Error(`?UNDEF'D STATEMENT ERROR`);
        }
        
        programCounter = index - 1; // -1 because the run loop increments after each statement
    }

    executeGosub(target) {
        const lineNum = parseInt(target.trim());
        const lineNumbers = Object.keys(programLines).map(Number).sort((a, b) => a - b);
        const index = lineNumbers.indexOf(lineNum);

        if (index === -1) {
            throw new Error(`?UNDEF'D STATEMENT ERROR`);
        }

        this.stack.push(programCounter); // resume here after RETURN
        programCounter = index - 1;
    }

    executeReturn() {
        if (this.stack.length === 0) {
            throw new Error('?RETURN WITHOUT GOSUB ERROR');
        }
        programCounter = this.stack.pop();
    }

    executeFor(args) {
        const m = args.match(/^([A-Z][A-Z0-9]*)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/);
        if (!m) {
            throw new Error('?SYNTAX ERROR');
        }
        const varName = m[1];
        const start = this.evaluateExpression(m[2]);
        const end = this.evaluateExpression(m[3]);
        const step = m[4] ? this.evaluateExpression(m[4]) : 1;
        this.variables[varName] = start;
        // Resume position for NEXT: the run loop's ++ lands on the line after FOR
        this.forStack.push({ var: varName, end, step, pc: programCounter });
    }

    executeNext(varArg) {
        const varName = varArg.trim();
        const entry = this.forStack[this.forStack.length - 1];
        if (!entry || (varName && entry.var !== varName)) {
            throw new Error('?NEXT WITHOUT FOR ERROR');
        }
        this.variables[entry.var] += entry.step;
        const v = this.variables[entry.var];
        if ((entry.step > 0 && v <= entry.end) || (entry.step < 0 && v >= entry.end)) {
            programCounter = entry.pc;
        } else {
            this.forStack.pop();
        }
    }

    executeIf(args) {
        const m = args.match(/^(.*?)\s+THEN\s+(.+)$/);
        if (m) {
            if (!this.evaluateExpression(m[1])) return;
            const target = m[2].trim();
            if (/^\d+$/.test(target)) {
                return this.executeGoto(target);
            }
            return this.executeStatement(target);
        }
        // IF cond GOTO n form
        const g = args.match(/^(.*?)\s+GOTO\s+(\d+)$/);
        if (!g) throw new Error('?SYNTAX ERROR');
        if (this.evaluateExpression(g[1])) {
            return this.executeGoto(g[2]);
        }
    }

    isVariable(name) {
        return /^[A-Z][A-Z0-9]*\$?$/.test(name);
    }

    isValidVariable(name) {
        return /^[A-Z][A-Z0-9]?\$?$/.test(name);
    }

    evaluateExpression(expr) {
        expr = expr.trim();

        // String literal
        if (expr.startsWith('"') && expr.endsWith('"')) {
            return expr.slice(1, -1);
        }

        // Variable reference
        if (this.isVariable(expr)) {
            return expr.endsWith('$') ? (this.strings[expr] || '') : (this.variables[expr] || 0);
        }
        
        // Number
        if (/^-?\d+(\.\d+)?$/.test(expr)) {
            return parseFloat(expr);
        }
        
        // Simple arithmetic (for now)
        try {
            // BASIC operators -> JS equivalents
            let processed = expr
                .replace(/\bAND\b/g, '&&')
                .replace(/\bOR\b/g, '||')
                .replace(/<>|<=|>=|=(?!=)/g, m => ({ '<>': '!==', '<=': '<=', '>=': '>=', '=': '===' }[m]));

            // Replace string variables before numeric variables ($ is not a word character)
            for (const [varName, value] of Object.entries(this.strings)) {
                const escapedName = varName.replace('$', '\\$');
                processed = processed.replace(new RegExp('\\b' + escapedName, 'g'), JSON.stringify(value));
            }

            // Replace variables with values (word-bounded so "A" doesn't mangle "AND")
            for (const [varName, value] of Object.entries(this.variables)) {
                processed = processed.replace(new RegExp('\\b' + varName + '\\b', 'g'), value);
            }

            // Evaluate simple expressions
            return Function('"use strict"; return (' + processed + ')')();
        } catch (e) {
            return 0;
        }
    }

    outputLine(text) {
        const outputLine = document.createElement("div");
        outputLine.className = "ready-line";
        const outputSpan = document.createElement('span');
        outputSpan.style.color = currentTextColor;
        const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        outputSpan.innerHTML = escaped.replace(/@GENXJAY\.COM/g,
            '<a href="https://bsky.app/profile/genxjay.com" target="_blank" style="color:#c9d487">@GENXJAY.COM</a>');
        outputLine.appendChild(outputSpan);
        cursorLine.parentNode.insertBefore(outputLine, cursorLine);
        // Cap scrollback so infinite loops don't grow the DOM forever
        const lines = cursorLine.parentNode.querySelectorAll('.ready-line, .easter-egg');
        if (lines.length > 4000) lines[0].remove();
        cursorLine.scrollIntoView({ block: 'end' });
    }
}

const basic = new BasicInterpreter();

let directoryLoaded = false; // LOAD"$",8 was issued; next LIST shows the disk directory
let mazeInterval = null; // 10 PRINT maze animation timer
let idleTimer = null; // Screensaver countdown
const IDLE_DELAY = 60000; // 60s idle -> maze screensaver

function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (window.GEOS && window.GEOS.active) return;
    idleTimer = setTimeout(() => {
        if (!mazeInterval && !programRunning) startMaze();
    }, IDLE_DELAY);
}

function glyphSupported(ch) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '32px C64_Pro_Mono, monospace';
    const missing = ctx.measureText('￿').width;
    const w = ctx.measureText(ch).width;
    return w > 0 && w !== missing;
}

function startMaze() {
    const diagA = glyphSupported('╱') ? '╱' : '/';
    const diagB = glyphSupported('╲') ? '╲' : '\\';
    let lineDiv = document.createElement('div');
    lineDiv.className = 'ready-line';
    cursorLine.parentNode.insertBefore(lineDiv, cursorLine);
    let col = 0;
    mazeInterval = setInterval(() => {
        const span = document.createElement('span');
        span.style.color = currentTextColor;
        span.textContent = Math.random() < 0.5 ? diagA : diagB;
        lineDiv.appendChild(span);
        if (++col >= 38) {
            col = 0;
            lineDiv = document.createElement('div');
            lineDiv.className = 'ready-line';
            cursorLine.parentNode.insertBefore(lineDiv, cursorLine);
        }
        cursorLine.scrollIntoView({ block: 'end' });
    }, 15);
}

function printDirectory() {
    basic.outputLine('0 "GENX JAY DISK  " 64 2A');
    basic.outputLine('12   "GENX JAY"       PRG');
    basic.outputLine('3    "BLUESKY"        PRG');
    basic.outputLine('664 BLOCKS FREE.');
}

function clearScreen() {
    document.querySelector('.boot-text').style.display = 'none';
    cursorLine.parentNode.querySelectorAll('.ready-line, .easter-egg').forEach(line => line.remove());
    cursorLine.scrollIntoView({ block: 'end' });
}

// Update cursor color function
function updateCursorColor(color) {
    const currentCursor = cursorLine.querySelector('.cursor');
    if (!currentCursor) return;
    currentCursor.style.color = color;
    currentCursor.style.backgroundColor = color; // Ensure the cursor matches text color
}

// Update cursor and text display
function updateCursorDisplay() {
    // Clear the cursor line
    cursorLine.innerHTML = '';
    
    // Add each character with its own color
    inputBuffer.forEach(charInfo => {
        const charSpan = document.createElement('span');
        charSpan.style.color = charInfo.color;
        charSpan.textContent = charInfo.char;
        cursorLine.appendChild(charSpan);
    });
    
    // Add the cursor at the end
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor';
    cursorSpan.textContent = '█';
    cursorLine.appendChild(cursorSpan);
    updateCursorColor(currentTextColor);
}

// Listen for keypress events
document.addEventListener("keydown", (event) => {
    resetIdleTimer();
    // Any keypress stops the 10 PRINT maze / screensaver
    if (mazeInterval) {
        clearInterval(mazeInterval);
        mazeInterval = null;
        inputBuffer = [];
        addReadyPrompt();
        cursorLine.innerHTML = '<span class="cursor">█</span>';
        updateCursorColor(currentTextColor);
        return;
    }

    // RUN/STOP: Escape breaks a running program
    if (programRunning && event.key === 'Escape') {
        running = false;
        programRunning = false;
        basic.outputLine('BREAK IN ' + (basic.lastLine || 0));
        inputBuffer = [];
        addReadyPrompt();
        cursorLine.innerHTML = '<span class="cursor">█</span>';
        updateCursorColor(currentTextColor);
        return;
    }

    // While a program runs, printable keys are consumed by BASIC GET
    if (programRunning && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        keyQueue.push(event.key.toUpperCase());
        return;
    }

    let key = event.key;

    // Handle ALT + 1-8 for color changes (using Alt to avoid browser tab switching)
    if (event.altKey && /^[1-8]$/.test(key)) {
        event.preventDefault(); // Prevent browser menu from appearing
        const colorIndex = parseInt(key, 10);
        currentTextColor = colors[colorIndex] || "#FFFFFF";
        // Update only the cursor color first
        updateCursorColor(currentTextColor);
        return;
    }

    key = key.toUpperCase();

    // Handle special keys
    if (key === "BACKSPACE") {
        if (inputBuffer.length > 0) {
            inputBuffer.pop(); // Remove the last character
            updateCursorDisplay();
        }
    } else if (key === "ENTER") {
        // Convert input buffer to plain text
        const inputText = inputBuffer.map(charInfo => charInfo.char).join('');
        
        // Create a new line with the current input
        const newLine = document.createElement("div");
        newLine.className = "ready-line";
        
        // Add each character with its own color
        inputBuffer.forEach(charInfo => {
            const charSpan = document.createElement('span');
            charSpan.style.color = charInfo.color;
            charSpan.textContent = charInfo.char;
            newLine.appendChild(charSpan);
        });
        
        cursorLine.parentNode.insertBefore(newLine, cursorLine);

        // Handle empty input
        if (inputText.trim() === '') {
            inputBuffer = [];
            cursorLine.innerHTML = '<span class="cursor">█</span>';
            updateCursorColor(currentTextColor);
            return;
        }
        
        // Handle numbered lines (BASIC program lines)
        if (/^\d+/.test(inputText)) {
            const match = inputText.match(/^(\d+)\s*(.*)$/);
            const lineNumber = parseInt(match[1], 10);
            const code = match[2].trim();
            if (code) {
                programLines[lineNumber] = code;
            } else {
                delete programLines[lineNumber]; // bare line number deletes the line
            }
            inputBuffer = [];
            cursorLine.innerHTML = '<span class="cursor">█</span>';
            updateCursorColor(currentTextColor);
            return;
        }
        
        // Handle commands that need a READY prompt after execution
        let needsReadyPrompt = true;
        
        if (inputText === 'RUN' && Object.keys(programLines).length === 0) {
            // Just show the Easter egg message without repeating the program lines
            const easterEggMessage = document.createElement("div");
            easterEggMessage.className = "easter-egg";
            const messageSpan = document.createElement('span');
            messageSpan.style.color = currentTextColor;
            messageSpan.innerHTML = 'HAHA NICE TRY, SHOW ME WHAT YOU DID ON BLUESKY <a href="https://bsky.app/profile/genxjay.com" target="_blank"><span class="inverse">@GENXJAY.COM</span></a>';
            easterEggMessage.appendChild(messageSpan);
            cursorLine.parentNode.insertBefore(easterEggMessage, cursorLine);
        }
        else if (inputText.startsWith('POKE 53280,')) {
            const colorIndex = parseInt(inputText.split(',')[1], 10);
            document.querySelector('.screen').style.borderColor = colors[colorIndex] || '#000000';
            document.body.style.backgroundColor = colors[colorIndex] || '#000000';
        }
        else if (inputText.startsWith('POKE 53281,')) {
            const colorIndex = parseInt(inputText.split(',')[1], 10);
            document.querySelector('.screen').style.backgroundColor = colors[colorIndex] || '#000000';
        }
        else if (/^POKE\s+646\s*,/.test(inputText)) {
            const colorIndex = Number(inputText.split(',')[1].trim());
            if (!Number.isInteger(colorIndex) || colorIndex < 0 || colorIndex > 15) {
                basic.outputLine('?ILLEGAL QUANTITY ERROR');
            } else {
                currentTextColor = colors[colorIndex];
                updateCursorColor(currentTextColor);
            }
        }
        else if (/^LOAD\s*"GEOS"\s*,\s*8\s*,\s*1\s*$/.test(inputText.trim())) {
            if (typeof window.GEOS?.boot !== 'function') {
                basic.outputLine('?GEOS UNAVAILABLE');
            } else {
                clearTimeout(idleTimer);
                cursorLine.style.visibility = 'hidden';
                window.GEOS.boot({
                    output: text => basic.outputLine(text),
                    onExit: () => {
                        inputBuffer = [];
                        cursorLine.style.visibility = '';
                        updateCursorDisplay();
                        addReadyPrompt();
                        resetIdleTimer();
                    }
                });
                needsReadyPrompt = false;
            }
        }
        else if (/^LOAD\s*"BLUESKY"\s*,\s*8/.test(inputText)) {
            basic.outputLine('SEARCHING FOR BLUESKY');
            basic.outputLine('FOUND "BLUESKY"');
            basic.outputLine('LOADING');
            window.open('https://bsky.app/profile/genxjay.com', '_blank');
        }
        else if (/^LOAD\s*"(\*|GENX JAY)"\s*,\s*8/.test(inputText)) {
            simulateLoadCommand(newLine);
            needsReadyPrompt = false;
        }
        else if (/^LOAD\s*"\$"\s*,\s*8/.test(inputText)) {
            basic.outputLine('SEARCHING FOR $');
            basic.outputLine('LOADING');
            directoryLoaded = true;
        }
        else if (/^SAVE\s*"([^"]+)"/.test(inputText)) {
            const name = inputText.match(/^SAVE\s*"([^"]+)"/)[1];
            basic.outputLine('SAVING ' + name);
            localStorage.setItem('c64prog_' + name, JSON.stringify(programLines));
        }
        else if (/^LOAD\s*"([^"]+)"\s*,\s*8/.test(inputText)) {
            const name = inputText.match(/^LOAD\s*"([^"]+)"\s*,\s*8/)[1];
            const saved = localStorage.getItem('c64prog_' + name);
            basic.outputLine('SEARCHING FOR ' + name);
            if (saved === null) {
                basic.outputLine('?FILE NOT FOUND ERROR');
            } else {
                basic.outputLine('FOUND "' + name + '"');
                basic.outputLine('LOADING');
                programLines = JSON.parse(saved);
            }
        }
        else if (inputText === 'LIST' && directoryLoaded && Object.keys(programLines).length === 0) {
            directoryLoaded = false;
            printDirectory();
        }
        else if (inputText === 'SYS 64738') {
            window.location.reload();
            return;
        }
        else {
            try {
                basic.executeStatement(inputText);
            } catch (error) {
                basic.outputLine(error.message);
            }
            if (programRunning || mazeInterval) needsReadyPrompt = false; // READY comes when the program/maze ends
        }
        
        // Add READY prompt if needed and reset for next input
        if (needsReadyPrompt) {
            addReadyPrompt();
        }
        
        // Clear the input buffer (set to empty array, not empty string)
        inputBuffer = [];
        cursorLine.innerHTML = '<span class="cursor">█</span>';
        updateCursorColor(currentTextColor);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
        // Add new character with current color (skip Ctrl/Cmd shortcuts like Ctrl+V/C/R)
        inputBuffer.push({
            char: key,
            color: currentTextColor
        });
        updateCursorDisplay();
    }
});

// Handle paste: feed each line through as if typed, submitting with Enter
document.addEventListener('paste', (event) => {
    const text = event.clipboardData.getData('text');
    if (!text) return;
    event.preventDefault();
    resetIdleTimer();

    // Stop the maze/screensaver if it's running
    if (mazeInterval) {
        clearInterval(mazeInterval);
        mazeInterval = null;
        addReadyPrompt();
    }

    const lines = text.replace(/\r/g, '').split('\n');
    lines.forEach((line, i) => {
        if (i === lines.length - 1 && line === '') return; // trailing newline
        inputBuffer = line.toUpperCase().split('').map(ch => ({ char: ch, color: currentTextColor }));
        updateCursorDisplay();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
});

function simulateLoadCommand(commandLine) {
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "ready-line";
    loadingMessage.style.color = currentTextColor;
    loadingMessage.textContent = "SEARCHING FOR *";
    commandLine.parentNode.insertBefore(loadingMessage, commandLine.nextSibling);

    setTimeout(() => {
        loadingMessage.textContent = 'FOUND "GENX JAY"';

        const loadingLine = document.createElement("div");
        loadingLine.className = "ready-line";
        loadingLine.style.color = currentTextColor;
        loadingLine.textContent = "LOADING";
        loadingMessage.parentNode.insertBefore(loadingLine, loadingMessage.nextSibling);

        setTimeout(() => {
            programLines = {
                10: 'PRINT "HELLO FROM THE GENX JAY DISK"',
                20: 'PRINT "FOLLOW ME ON BLUESKY: @GENXJAY.COM"'
            };
            addReadyPrompt();
        }, 2500);
    }, 1500);
}

function addReadyPrompt() {
    const blankLine = document.createElement("div");
    blankLine.className = "ready-line";
    blankLine.innerHTML = "&nbsp;";
    cursorLine.parentNode.insertBefore(blankLine, cursorLine);

    const readyLine = document.createElement("div");
    readyLine.className = "ready-line";
    const readySpan = document.createElement('span');
    readySpan.style.color = currentTextColor;
    readySpan.textContent = "READY.";
    readyLine.appendChild(readySpan);
    cursorLine.parentNode.insertBefore(readyLine, cursorLine);
    cursorLine.scrollIntoView({ block: 'end' });
}

resetIdleTimer();
