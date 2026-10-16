const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const geosSource = fs.readFileSync(path.join(__dirname, '..', 'geos.js'), 'utf8');

function startupHarness(fault){
 var pending=new Map(), nextId=0, exits=0, messages=[], listeners={};
 var context2d={fillRect(){if(fault==='drawing')throw Error('Drawing failed');},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
 var doc={activeElement:null,addEventListener(name,fn){listeners[name]=fn;}};
 class E {constructor(tag){this.tag=tag;this.style={setProperty(){}};this.dataset={};this.children=[];this.classList={add(){},remove(){}};}setAttribute(){}removeAttribute(){}append(...items){this.children.push(...items);}appendChild(item){this.children.push(item);}replaceChildren(){this.children=[];}addEventListener(){}remove(){}focus(){doc.activeElement=this;}getContext(){return fault==='canvas'?null:context2d;}querySelectorAll(){return this.children;}querySelector(){return null;}}
 doc.createElement=tag=>new E(tag);doc.body=new E('body');
 var win={addEventListener(){}};var sandbox={window:win,document:doc,console:{error(){}},innerWidth:1280,innerHeight:720,getComputedStyle(){return {position:fault==='stylesheet'?'static':'fixed'};},matchMedia(){return {matches:false};},setTimeout(fn,delay){var id=++nextId;pending.set(id,{fn,delay});return id;},clearTimeout(id){pending.delete(id);},setInterval(){return ++nextId;},clearInterval(){},localStorage:{getItem(){return null;},setItem(){}}};
 vm.runInNewContext(geosSource,sandbox);win.GEOS.boot({output:line=>messages.push(line),onExit:()=>exits++});
 return {win,listeners,messages,get exits(){return exits;},flush(){for(var [id,item]of [...pending].sort((a,b)=>a[1].delay-b[1].delay)){if(pending.has(id)){pending.delete(id);item.fn();}}}};
}

for (const fault of ['stylesheet', 'canvas', 'drawing']) {
    test('restores BASIC input after ' + fault + ' failure', () => {
        const h = startupHarness(fault);
        h.flush();
        assert.equal(h.win.GEOS.active, false);
        assert.equal(h.exits, 1);
        assert.ok(h.messages.includes('?GEOS LOAD ERROR - PLEASE REFRESH'));
        let blocked = false;
        h.listeners.keydown({key: 'A', stopImmediatePropagation() { blocked = true; }});
        assert.equal(blocked, false);
    });
}
test('starts the desktop through the normal loading sequence', () => {
    const h = startupHarness(null);
    h.flush();
    assert.equal(h.win.GEOS.active, true);
    assert.equal(h.exits, 0);
    assert.deepEqual(h.messages, ['SEARCHING FOR GEOS', 'FOUND GEOS', 'LOADING']);
});
test('cancelling loading prevents delayed desktop startup', () => {
    const h = startupHarness(null);
    h.listeners.keydown({key: 'Escape', stopImmediatePropagation() {}, preventDefault() {}});
    h.flush();
    assert.equal(h.win.GEOS.active, false);
    assert.equal(h.exits, 1);
});
