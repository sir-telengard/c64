const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Exercise the production GEOS closure with a small DOM/canvas substitute.
// This checks controller and rendered-control behavior, not browser layout.
function desktop(options = {}) {
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
        click() { for (const fn of this.listeners.get('click') ?? []) fn({ detail: 0 }); }
        focus() { document.activeElement = this; }
        select() {}
        getBoundingClientRect() { return { left: 32, top: 52, width: 256, height: 112 }; }
        setPointerCapture() {}
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
    const timers = new Map(), storage = options.storage ?? new Map(), downloads = [], output = [];
    let now = 0, nextTimer = 1;
    function advance(ms) {
        const end = now + ms;
        while (true) {
            const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
            if (!next) break;
            timers.delete(next[0]); now = next[1].at; next[1].fn();
        }
        now = end;
    }
    const windowListeners = new Map();
    const sandbox = {
        document, innerWidth: 1024, innerHeight: 768,
        localStorage: { getItem: key => { if (options.failRead?.(key)) throw new Error('Storage denied'); return storage.get(key) ?? null; },
            setItem: (key, value) => { if (options.failWrite?.(key, value)) throw new Error('Storage quota exceeded'); storage.set(key, String(value)); } },
        Blob, URL: { createObjectURL: blob => { downloads.push(blob); return 'blob:test'; }, revokeObjectURL() {} },
        matchMedia: () => ({ matches: options.reducedMotion ?? true }),
        setTimeout: (fn, delay = 0) => { const id = nextTimer++; timers.set(id, { fn, at: now + delay }); return id; },
        clearTimeout: id => timers.delete(id), setInterval() {}, clearInterval() {},
        addEventListener: (name, fn) => windowListeners.set(name, fn)
    };
    sandbox.window = sandbox;
    const source = fs.readFileSync(require.resolve('../../script.js'), 'utf8');
    const end = source.indexOf('\n})();');
    assert.ok(end > 0, 'GEOS closure found');
    const geos = source.slice(0, end) + '\n globalThis.geosTest = {files,state,act,openFile,closeModal,launchById,applications,selectFile,diskSnapshot,decodeDisk,persistDisk,previewImport,exportDisk,parseD64,previewD64,get mountedD64(){return mountedD64},get d64Picker(){return d64Picker},get painting(){return painting},get paintSurface(){return paintSurface},get picker(){return diskPicker},get editor(){return editor},get controls(){return controls}};\n})();';
    vm.runInNewContext(geos, sandbox);
    sandbox.GEOS.boot({ output: text => output.push(text), onExit() {} });
    if (!options.manualBoot) advance(4000);
    const api = sandbox.geosTest;
    return { api, storage, document, downloads, output, advance, file: name => api.files.find(file => file.name === name),
        key: (key, target = document.activeElement, modifiers = {}) => documentListeners.get('keydown')({ key, target, preventDefault() {}, stopImmediatePropagation() {}, ...modifiers }),
        unload: () => { const event = { prevented: false, preventDefault() { this.prevented = true; } }; windowListeners.get('beforeunload')?.(event); return event; } };
}

module.exports = { desktop };
