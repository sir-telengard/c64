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
    const timers = [], storage = options.storage ?? new Map(), downloads = [];
    const sandbox = {
        document, innerWidth: 1024, innerHeight: 768,
        localStorage: { getItem: key => { if (options.failRead?.(key)) throw new Error('Storage denied'); return storage.get(key) ?? null; },
            setItem: (key, value) => { if (options.failWrite?.(key, value)) throw new Error('Storage quota exceeded'); storage.set(key, String(value)); } },
        Blob, URL: { createObjectURL: blob => { downloads.push(blob); return 'blob:test'; }, revokeObjectURL() {} },
        matchMedia: () => ({ matches: true }),
        setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {}, setInterval() {}, clearInterval() {},
        addEventListener() {}
    };
    sandbox.window = sandbox;
    const source = fs.readFileSync(require.resolve('../../script.js'), 'utf8');
    const end = source.indexOf('\n})();');
    assert.ok(end > 0, 'GEOS closure found');
    const geos = source.slice(0, end) + '\n globalThis.geosTest = {files,state,act,openFile,closeModal,launchById,applications,selectFile,diskSnapshot,decodeDisk,persistDisk,previewImport,exportDisk,get picker(){return diskPicker},get editor(){return editor},get controls(){return controls}};\n})();';
    vm.runInNewContext(geos, sandbox);
    sandbox.GEOS.boot({ output() {}, onExit() {} });
    timers.splice(0).forEach(fn => fn());
    const api = sandbox.geosTest;
    return { api, storage, document, downloads, file: name => api.files.find(file => file.name === name),
        key: (key, target = document.activeElement) => documentListeners.get('keydown')({ key, target, preventDefault() {}, stopImmediatePropagation() {} }) };
}

module.exports = { desktop };
