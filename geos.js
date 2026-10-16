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
    const files = [
        ['GEOS','system',12,'system'],['GEOBOOT','system',4,'system'],['DESK TOP','application',22,'desktop'],['CONFIGURE','application',8,'configure'],
        ['preference mgr','accessory',3,'preferences'],['pad color mgr','accessory',2,'colors'],['COMM 1351','input driver',2,'mouse'],['MPS-801','printer driver',4,'printer'],
        ['note pad','accessory',3,'note'],['calculator','accessory',3,'calculator'],['alarm clock','accessory',2,'clock'],['READ ME','document',1,'readme']
    ].map(([name,type,size,icon],id)=>({id,name,type,size,icon,locked:type==='system'}));
    const state = { phase:'off', page:0, view:'icon', diskOpen:true, diskName:'GEOS 2.0', selected:new Set(), menu:null, hover:-1, modal:null, trash:null, note:'', pattern:0 };
    let root, desktop, canvas, ctx, controls, status, editor, callbacks, clockTimer;
    let timers = [], focusKey = null, calc = { display:'0', left:null, op:null, fresh:true };
    const menus = {
        geos:[['GEOS info','geos-info'],['deskTop info','desktop-info'],null,['select printer','printer'],['select input','input'],null,['preference mgr','preferences'],['pad color mgr','colors'],['alarm clock','clock'],['note pad','note'],['calculator','calculator']],
        file:[['open','open','O'],['duplicate','duplicate','D'],['rename','rename','R'],['info','info','Q'],['delete','delete'],null,['quit','quit','Z']],
        view:[['by icon','view-icon'],['by size','view-size'],['by type','view-type'],['by date','view-date'],['by name','view-name']],
        disk:[['open','disk-open'],['close','disk-close'],['rename','disk-rename'],['info','disk-info'],['validate','validate']],
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
        el.addEventListener('click',action);
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
        const list=state.trash?files.filter(f=>f.id!==state.trash.id):[...files];
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
    function selectFile(file,event) {if(event.shiftKey){if(state.selected.has(file.id))state.selected.delete(file.id);else state.selected.add(file.id);}else{state.selected.clear();state.selected.add(file.id);}say(file.name+' selected. Press Enter to open.');render();}
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
        if(state.diskOpen){const used=available().reduce((sum,f)=>sum+f.size,0);text(available().length+' files',5,30);text(used+' Kbytes used',68,30);text((165-used)+' Kbytes free',172,30);
            if(state.view==='icon')pageFiles().forEach((file,i)=>{const x=9+(i%4)*63,y=45+Math.floor(i/4)*43;icon(file.icon,x+19,y);label(file.name,x,y+24,61,state.selected.has(file.id));const el=control('file-'+file.id,file.name,x,y,61,35,e=>selectFile(file,e),{doubleClick:()=>openFile(file),selected:state.selected.has(file.id)});el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();openFile(file);}});});
            else pageFiles().forEach((file,i)=>{const y=42+i*10;if(state.selected.has(file.id))fill(3,y,257,10,INK);const c=state.selected.has(file.id)?PAPER:INK;text(file.name,7,y+1,c);text(file.type,106,y+1,c);text(file.size+'K',232,y+1,c);control('file-'+file.id,file.name,3,y,257,10,e=>selectFile(file,e),{doubleClick:()=>openFile(file),selected:state.selected.has(file.id)});});
        }
        for(let x=6;x<239;x+=12){box(x,138,7,9);fill(x+2,140,3,1);}
        fill(239,128,24,15);line(239,142,262,128);text(String(state.page+1),246,132);
        control('page-next','Next page',239,128,24,15,()=>act('page-next'),{disabled:!state.diskOpen||state.page>=pages()-1});
        control('page-previous','Previous page',1,128,22,10,()=>act('page-previous'),{disabled:!state.diskOpen||state.page===0});
        icon('drive',281,26);text('A',286,31);label('GEOS',273,48,43,state.diskOpen);
        control('drive-a','Open GEOS disk in drive A',274,23,43,36,()=>act('disk-open'));
        icon('trash',281,157);if(state.trash)fill(287,166,9,7,INK);control('trash','Waste basket',274,153,43,35,()=>state.trash?dialog('Waste basket',[state.trash.name,'Restore this file?'],[['Restore',()=>{state.trash=null;closeModal();}],['Cancel',closeModal]]):dialog('Waste basket',['The waste basket is empty.']));
        text('GEOS',276,186);text('2.0',284,194);
        text('deskTop',8,185);text('V2.0',8,194);
    }
    function drawMenu(addControls=true) {
        const names=Object.keys(menus),index=names.indexOf(state.menu);let x=menuWidths.slice(0,index).reduce((a,b)=>a+b,0);const items=menus[state.menu],w=state.menu==='geos'?113:state.menu==='file'?94:96;x=Math.min(x,W-w-3);
        const h=items.reduce((sum,item)=>sum+(item?12:4),0)+2;fill(x+2,14,w,h,INK);fill(x,12,w,h);box(x,12,w,h);
        let y=13;items.forEach((item,i)=>{if(!item){line(x+1,y+1,x+w-2,y+1);y+=4;return;}const [name,action,shortcut]=item;const active=i===state.hover;if(active)fill(x+1,y,w-2,12,INK);text(name,x+4,y+2,active?PAPER:INK);if(shortcut)text('C='+shortcut,x+w-25,y+2,active?PAPER:INK);
            if(addControls)control('item-'+action,name,x+1,y,w-2,12,()=>act(action),{role:'menuitem',hover:()=>{if(state.hover!==i){state.hover=i;drawMenu(false);}}});y+=12;});
    }
    function dialog(title,lines,buttons=[['OK',closeModal]],kind='message') {state.menu=null;state.modal={title,lines,buttons,kind};say(title+'. '+lines.join(' '));render();focusFirst();}
    function closeModal() {state.modal=null;if(editor){editor.remove();editor=null;}render();const target=controls.querySelector('[data-key="menu-geos"]');if(target)target.focus();}
    function focusFirst() {const target=editor||controls.querySelector('[data-modal="true"]');if(target)target.focus();}
    function drawModal() {
        const m=state.modal;let x=34,y=42,w=252,h=116;if(m.kind==='calculator'){x=82;y=25;w=156;h=165;}if(m.kind==='note'){x=40;y=24;w=240;h=161;}
        // The active dialog blocks every desktop control, including keyboard focus.
        controls.replaceChildren();fill(x+3,y+3,w,h,INK);fill(x,y,w,h);box(x,y,w,h);box(x+2,y+2,w-4,h-4);fill(x+3,y+3,w-6,12,INK);center(m.title,x+4,y+5,w-8,PAPER);
        const modalControl=(key,name,bx,by,bw,fn)=>{button(key,name,bx,by,bw,fn);controls.lastElementChild.dataset.modal='true';};
        if(m.kind==='calculator') {
            fill(x+10,y+23,w-20,16);box(x+10,y+23,w-20,16);const display=calc.display.slice(0,18);text(display,x+w-15-width(display),y+28);
            const keys=['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'];keys.forEach((key,i)=>modalControl('calc-'+key,key,x+10+(i%4)*35,y+47+Math.floor(i/4)*23,29,()=>calculate(key)));
            modalControl('modal-close','Close',x+48,y+h-20,60,closeModal);
        } else if(m.kind==='note') {
            if(!editor){editor=element('textarea','geos-editor');editor.setAttribute('aria-label','Note pad text');editor.maxLength=2000;editor.value=state.note;editor.addEventListener('input',()=>{state.note=editor.value;try{localStorage.setItem('c64-geos-note',state.note);}catch(e){say('Note is kept for this session. Browser storage is unavailable.');}});desktop.appendChild(editor);}
            Object.assign(editor.style,{left:(x+8)+'px',top:(y+22)+'px',width:(w-16)+'px',height:'108px'});
            modalControl('modal-close','Close',x+w-67,y+h-21,58,closeModal);
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
        dialog(title,['Enter a new name:'],[['OK',()=>{const name=editor.value.trim();if(!name){say('Enter a name.');return;}save(name);closeModal();}],['Cancel',closeModal]],'rename');state.modal.value=value;editor.value=value;editor.select();
    }
    function openFile(file) {
        state.menu=null;
        if(['note','calculator','clock','preferences','colors','readme'].includes(file.icon)){act(file.icon);return;}
        if(file.icon==='desktop'){state.page=0;state.selected.clear();render();return;}
        if(file.icon==='configure'){dialog('CONFIGURE 2.0',['Drive A: 1541   Device 8','Input: mouse / keyboard','64K RAM']);return;}
        dialog(file.name,[file.type==='system'?'This is a GEOS system file.':'This is a GEOS device driver.','It is used by the system.']);
    }
    function act(action) {
        state.menu=null;state.hover=-1;
        const selected=selectedFiles(),file=selected[0];
        if(action.startsWith('view-')){state.view=action.slice(5);state.page=0;state.selected.clear();}
        else switch(action) {
            case 'geos-info':dialog('GEOS info',['GEOS 64   Version 2.0','Graphic Environment','Operating System','Berkeley Softworks 1988']);return;
            case 'desktop-info':dialog('deskTop info',['deskTop   Version 2.0','A browser recreation for','GENX JAY','jasonstum.com']);return;
            case 'open':if(file){openFile(file);return;}dialog('Open',['Select a file first.']);return;
            case 'info':if(!file){dialog('File info',['Select a file first.']);return;}dialog('File info',[file.name,file.type,file.size+' Kbytes',file.locked?'write protected':'not write protected']);return;
            case 'rename':if(!file){dialog('Rename',['Select a file first.']);return;}if(file.locked){dialog('Rename',['This system file is protected.']);return;}rename('Rename file',file.name,name=>{file.name=name;});return;
            case 'duplicate':if(!file){dialog('Duplicate',['Select a file first.']);return;}if(available().reduce((n,f)=>n+f.size,0)+file.size>165){dialog('Duplicate',['Disk full.']);return;}files.push({...file,id:Math.max(...files.map(f=>f.id))+1,name:('copy '+file.name).slice(0,16),locked:false});break;
            case 'delete':if(!file){dialog('Delete',['Select a file first.']);return;}if(file.locked){dialog('Delete',['This system file is protected.']);return;}dialog('Delete file',[file.name,'Move to the waste basket?'],[['Delete',()=>{state.trash=file;state.selected.clear();state.page=Math.min(state.page,pages()-1);closeModal();}],['Cancel',closeModal]]);return;
            case 'disk-open':state.diskOpen=true;break;
            case 'disk-close':state.diskOpen=false;state.selected.clear();break;
            case 'disk-rename':rename('Rename disk',state.diskName,name=>{state.diskName=name;});return;
            case 'disk-info':dialog('Disk info',[state.diskName,'Drive A: 1541','Device 8','165 Kbytes total']);return;
            case 'validate':dialog('Validate',['Disk validated.','No errors found.']);return;
            case 'select-all':if(state.diskOpen)pageFiles().forEach(f=>state.selected.add(f.id));break;
            case 'select-none':state.selected.clear();break;
            case 'page-next':if(state.diskOpen)state.page=Math.min(pages()-1,state.page+1);state.selected.clear();break;
            case 'page-previous':if(state.diskOpen)state.page=Math.max(0,state.page-1);state.selected.clear();break;
            case 'page-first':state.page=0;state.selected.clear();break;
            case 'page-last':state.page=pages()-1;state.selected.clear();break;
            case 'printer':dialog('Select printer',['MPS-801','Printer driver selected.']);return;
            case 'input':dialog('Select input',['Mouse / touch / keyboard','Input driver selected.']);return;
            case 'preferences':dialog('Preference Manager',['Pointer: mouse / touch','Display: 320 x 200','Tab: select   Enter: open','Esc: close   F1: shortcuts']);return;
            case 'colors':dialog('Pad Color Manager',['Choose a desktop pattern.'],[['Change',()=>{state.pattern=state.pattern?0:1;render();}],['Close',closeModal]]);return;
            case 'clock':{const now=new Date();dialog('Alarm Clock',[now.toLocaleDateString('en-US'),now.toLocaleTimeString('en-US'), 'System clock']);return;}
            case 'calculator':calc={display:'0',left:null,op:null,fresh:true};dialog('Calculator',[],[['Close',closeModal]],'calculator');return;
            case 'note':try{state.note=localStorage.getItem('c64-geos-note')||state.note;}catch(e){/* Session-only note when storage is blocked. */}dialog('Note Pad',[],[['Close',closeModal]],'note');return;
            case 'readme':dialog('READ ME',['You found the hidden disk!','Double-click files to open.','Turn the corner for page 2.','options > BASIC to return.']);return;
            case 'shortcuts':dialog('Shortcuts',['Tab / arrows: select controls','Enter / Space: activate','Page Up / Down: turn page','Esc: close   Alt+B: BASIC']);return;
            case 'quit':dialog('Return to BASIC',['Leave GEOS and return to BASIC?'],[['OK',leave],['Cancel',closeModal]]);return;
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
        desktop.append(canvas,controls,status);viewport.append(desktop);monitor.append(viewport);root.append(monitor);document.body.append(root);
        desktop.addEventListener('click',e=>{if(e.target===canvas||e.target===controls){state.menu=null;deselect();}});
        window.addEventListener('resize',fit);
    }
    function leave() {
        timers.forEach(clearTimeout);timers=[];clearInterval(clockTimer);state.phase='off';state.menu=null;state.modal=null;
        if(root)root.hidden=true;if(editor){editor.remove();editor=null;}
        document.body.classList.remove('geos-active');callbacks.onExit();
    }
    function boot(options) {
        if(state.phase!=='off')return;callbacks=options;state.phase='loading';setup();
        state.page=0;state.view='icon';state.diskOpen=true;state.selected.clear();state.menu=null;
        options.output('SEARCHING FOR GEOS');
        const delay=matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
        timers.push(setTimeout(()=>options.output('FOUND GEOS'),delay));
        timers.push(setTimeout(()=>options.output('LOADING'),delay*2));
        timers.push(setTimeout(()=>{state.phase='desktop';root.hidden=false;document.body.classList.add('geos-active');fit();render();desktop.focus();say('GEOS 2.0 desktop. Tab to explore menus and files.');clockTimer=setInterval(()=>{if(!state.modal&&!state.menu)render();},30000);},delay*3));
    }
    document.addEventListener('keydown',event=>{
        if(state.phase==='off')return;
        // Browser shortcuts remain available. Stop BASIC from receiving GEOS keys.
        event.stopImmediatePropagation();
        if(state.phase==='loading'){if(event.key==='Escape'){event.preventDefault();leave();}return;}
        if(event.key==='Escape'){event.preventDefault();if(state.modal)closeModal();else if(state.menu){state.menu=null;render();}else act('quit');return;}
        if(event.altKey&&event.key.toLowerCase()==='b'){event.preventDefault();act('quit');return;}
        if(event.target===editor){if(event.key==='Enter'&&state.modal?.kind==='rename'){event.preventDefault();state.modal.buttons[0][1]();}return;}
        if(!state.modal&&event.key==='Enter'&&event.target.dataset?.key?.startsWith('file-')){event.preventDefault();const file=files.find(f=>f.id===Number(event.target.dataset.key.slice(5)));if(file)openFile(file);return;}
        if(event.key==='F1'){event.preventDefault();act('shortcuts');return;}
        if(state.modal&&state.modal.kind==='calculator'&&/^[0-9+*/=\-]$/.test(event.key)){event.preventDefault();calculate(event.key);return;}
        if(state.modal&&event.key==='Enter'&&event.target===desktop){event.preventDefault();state.modal.buttons[0][1]();return;}
        if(event.key==='Tab'){const list=[...controls.querySelectorAll('button:not(:disabled)')];if(editor)list.unshift(editor);if(list.length){event.preventDefault();let i=list.indexOf(document.activeElement);i=i<0?(event.shiftKey?list.length-1:0):(i+(event.shiftKey?-1:1)+list.length)%list.length;list[i].focus();}return;}
        if(!state.modal&&(event.key==='PageDown'||event.key==='PageUp')){event.preventDefault();act(event.key==='PageDown'?'page-next':'page-previous');return;}
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const list=[...controls.querySelectorAll('button:not(:disabled)')];let i=list.indexOf(document.activeElement);const step=event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1;list[(i+step+list.length)%list.length]?.focus();return;}
        if(!state.modal&&event.key==='Enter'&&event.target===desktop){event.preventDefault();act('open');}
    },true);
    // Pasting into the note pad must never execute commands in the hidden BASIC prompt.
    document.addEventListener('paste',event=>{if(state.phase!=='off')event.stopImmediatePropagation();},true);
    window.GEOS={boot,get active(){return state.phase!=='off';}};
})();
