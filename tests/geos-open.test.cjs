const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');

// Exercise the production GEOS closure with a small DOM/canvas substitute.
// This checks controller and rendered-control behavior, not browser layout.
function desktop() {
    let document;
    const context2d = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) });
    class Element {
        constructor(tag) {
            this.tagName = tag; this.children = []; this.dataset = {}; this.attributes = {};
            this.style = { setProperty(key, value) { this[key] = value; } };
            this.listeners = new Map(); this.classList = { add() {}, remove() {} };
        }
        appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
        append(...children) { children.forEach(child => this.appendChild(child)); }
        contains(child) { return child === this || this.children.some(node => node.contains(child)); }
        replaceChildren(...children) {
            if (this.contains(document.activeElement)) document.activeElement = document.body;
            this.children.forEach(child => { child.parentNode = null; });
            this.children = []; this.append(...children);
        }
        remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; }
        setAttribute(key, value) { this.attributes[key] = value; }
        removeAttribute(key) { delete this.attributes[key]; }
        addEventListener(key, fn) { if (!this.listeners.has(key)) this.listeners.set(key, []); this.listeners.get(key).push(fn); }
        focus() { document.activeElement = this; }
        select() {}
        getContext() { return context2d; }
        get lastElementChild() { return this.children.at(-1); }
        querySelectorAll(selector) {
            const nodes = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
            if (selector === '*') return nodes;
            if (selector === 'button:not(:disabled)') return nodes.filter(child => child.tagName === 'button' && !child.disabled);
            const key = selector.match(/^\[data-key="([^"]+)"\]$/);
            if (key) return nodes.filter(child => child.dataset.key === key[1]);
            if (selector === '[data-modal="true"]') return nodes.filter(child => child.dataset.modal === 'true');
            throw new Error('Unsupported test selector: ' + selector);
        }
        querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    }
    const documentListeners = new Map();
    document = { createElement: tag => new Element(tag), addEventListener(key, fn) { documentListeners.set(key, fn); } };
    document.body = new Element('body'); document.activeElement = document.body;
    const timers = [], storage = new Map();
    const sandbox = {
        document, innerWidth: 1024, innerHeight: 768,
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
        matchMedia: () => ({ matches: true }),
        setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {}, setInterval() {}, clearInterval() {},
        addEventListener() {}
    };
    sandbox.window = sandbox;
    const source = fs.readFileSync(require.resolve('../script.js'), 'utf8');
    const end = source.indexOf('\n})();');
    assert.ok(end > 0, 'GEOS closure found');
    const geos = source.slice(0, end) + '\n globalThis.geosTest = {files,state,act,openFile,closeModal,launchById,applications,selectFile,get editor(){return editor},get controls(){return controls}};\n})();';
    vm.runInNewContext(geos, sandbox);
    sandbox.GEOS.boot({ output() {}, onExit() {} });
    timers.splice(0).forEach(fn => fn());
    const api = sandbox.geosTest;
    return { api, storage, document, file: name => api.files.find(file => file.name === name),
        key: (key, target = document.activeElement) => documentListeners.get('keydown')({ key, target, preventDefault() {}, stopImmediatePropagation() {} }) };
}

test('behavior follows GEOS type and application ID independently of the icon', () => {
    const { api, file } = desktop();
    const calculator = file('calculator'); calculator.icon = 'system';
    api.openFile(calculator);
    assert.equal(api.state.modal.kind, 'calculator');
    assert.equal(api.state.launch.fileId, calculator.id);
    api.closeModal();
    const configure = file('CONFIGURE'); configure.geosType = 14;
    api.openFile(configure);
    assert.equal(api.state.modal.title, 'CONFIGURE 2.0');
});

test('menu Open rejects multiple selection instead of opening the first item', () => {
    const { api, file } = desktop();
    api.state.selected.add(file('calculator').id); api.state.selected.add(file('note pad').id);
    api.act('open');
    assert.match(api.state.modal.lines.join(' '), /No multiple file operation/);
    assert.equal(api.state.launch, null);
    api.closeModal();
    api.openFile(file('calculator'));
    assert.match(api.state.modal.lines.join(' '), /No multiple file operation/);
});

test('documents resolve a parent application and render full read-only content', () => {
    const { api, file } = desktop();
    const document = file('READ ME');
    document.icon = 'mouse'; document.content = Array(30).fill('A complete line of text');
    api.state.page = 1; api.state.view = 'name'; api.state.selected.add(document.id);
    api.openFile(document);
    assert.equal(api.state.launch.fileId, file('TEXT READER').id);
    assert.equal(api.state.launch.documentId, document.id);
    assert.equal(api.state.modal.kind, 'reader');
    assert.equal(api.editor.readOnly, true);
    assert.equal(api.editor.value.split('\n').length, 30);
    api.closeModal();
    assert.equal(api.editor, null); assert.equal(api.state.launch, null);
    assert.equal(api.state.page, 1); assert.equal(api.state.view, 'name');
    assert.deepEqual(Array.from(api.state.selected), [document.id]);
});

test('pointer double-click survives button redraw in icon and list views', () => {
    for (const view of ['icon', 'name']) {
        const { api, file } = desktop();
        api.act('view-' + view); api.act('page-last');
        const document = file('READ ME'), key = 'file-' + document.id;
        const button = () => api.controls.children.find(node => node.dataset.key === key);
        const first = button(); assert.ok(first);
        first.listeners.get('click')[0]({ detail: 1, timeStamp: 1000, shiftKey: false });
        assert.equal(api.state.modal, null); assert.notEqual(button(), first);
        button().listeners.get('click')[0]({ detail: 1, timeStamp: 1250, shiftKey: false });
        assert.equal(api.state.modal.kind, 'reader');
    }
});

test('keyboard Enter uses the dispatcher and Escape restores document focus', () => {
    const { api, file, key, document } = desktop();
    api.act('page-last'); const readme = file('READ ME'); api.state.selected.add(readme.id);
    const target = api.controls.children.find(node => node.dataset.key === 'file-' + readme.id);
    key('Enter', target);
    assert.equal(api.state.modal.kind, 'reader'); key('Escape');
    assert.equal(api.state.modal, null); assert.equal(api.state.page, 1);
    assert.equal(document.activeElement.dataset.key, 'file-' + readme.id);
});

test('keyboard-generated clicks and Shift-clicks do not accidentally launch a file', () => {
    const { api, file } = desktop(); const calculator = file('calculator');
    for (const event of [
        { detail: 0, timeStamp: 1000 }, { detail: 0, timeStamp: 1100 },
        { detail: 1, timeStamp: 1200, shiftKey: true }, { detail: 1, timeStamp: 1300, shiftKey: true }
    ]) api.selectFile(calculator, event);
    assert.equal(api.state.modal, null); assert.equal(api.state.launch, null);
});

test('missing parent offers cancellation and retry rechecks current availability', () => {
    const { api, file } = desktop();
    const reader = file('TEXT READER'), document = file('READ ME');
    api.state.trash = reader; api.state.selected.add(document.id);
    api.openFile(document);
    assert.equal(api.state.modal.title, 'Application not found'); assert.equal(api.state.launch, null);
    api.state.modal.buttons[1][1]();
    assert.equal(api.state.modal, null); assert.ok(api.state.selected.has(document.id));
    api.openFile(document);
    api.state.trash = null;
    api.state.modal.buttons[0][1]();
    assert.equal(api.state.modal.kind, 'reader');
});

test('renamed parent, wrong parent disk, and a non-application never launch a document', () => {
    for (const change of [
        (reader, document) => { reader.name = 'RENAMED READER'; },
        (reader, document) => { document.parentDiskId = 'another-disk'; },
        (reader, document) => { reader.geosType = 5; }
    ]) {
        const { api, file } = desktop(); change(file('TEXT READER'), file('READ ME'));
        api.openFile(file('READ ME'));
        assert.equal(api.state.modal.title, 'Application not found'); assert.equal(api.state.launch, null);
    }
});

test('system files, boot files, drivers and unassociated documents cannot be opened', () => {
    for (const name of ['GEOS', 'GEOBOOT', 'COMM 1351', 'MPS-801', 'READ ME']) {
        const { api, file } = desktop(); const target = file(name); delete target.parentApplication;
        api.openFile(target);
        assert.match(api.state.modal.lines.join(' '), /can't be opened from the deskTop/);
        assert.equal(api.state.launch, null);
    }
});

test('unknown browser application is distinct from an unsupported GEOS file type', () => {
    const { api, file } = desktop(); file('CONFIGURE').applicationId = 'not-implemented';
    api.openFile(file('CONFIGURE'));
    assert.equal(api.state.modal.title, 'Application unavailable'); assert.equal(api.state.launch, null);
});

test('note editing remains separate from the reader and persists across close', () => {
    const { api, file, storage } = desktop();
    api.launchById('note');
    assert.equal(api.editor.readOnly, false);
    api.editor.value = 'Saved note'; api.editor.listeners.get('input')[0]();
    api.closeModal(); api.openFile(file('READ ME'));
    assert.equal(api.editor.readOnly, true); assert.notEqual(api.editor.value, 'Saved note');
    api.closeModal(); api.launchById('note');
    assert.equal(api.editor.value, 'Saved note'); assert.equal(storage.get('c64-geos-note'), 'Saved note');
});

test('closed disk and deleted files do not launch, and empty selection is handled', () => {
    const { api, file } = desktop();
    api.act('open'); assert.match(api.state.modal.lines.join(' '), /Select a file/); api.closeModal();
    api.state.diskOpen = false; api.openFile(file('calculator'));
    assert.equal(api.state.launch, null); api.closeModal(); api.state.diskOpen = true;
    api.state.trash = file('calculator'); api.openFile(file('calculator'));
    assert.equal(api.state.launch, null);
});
