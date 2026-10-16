const assert = require('node:assert/strict');
const { test } = require('node:test');
const { desktop } = require('./helpers/geos-harness.cjs');
const KEY = 'c64-geos-disk';

function click(env, key) {
    const button = env.api.controls.children.find(node => node.dataset.key === key);
    assert.ok(button, 'Visible control: ' + key); button.click();
}
function type(env, text) { env.api.editor.value = text; env.api.editor.listeners.get('input')[0](); }
function nameDocument(env, name) {
    click(env, 'document-save'); assert.equal(env.api.state.modal.title, 'Save document');
    env.api.editor.value = name; env.key('Enter', env.api.editor);
}
function create(env, name = 'MY DOCUMENT', text = 'First draft') {
    env.api.act('new-text'); type(env, text); nameDocument(env, name);
    assert.equal(env.api.state.modal.kind, 'document');
    assert.equal(env.api.state.documentEdit.message, 'Saved to disk.');
}
function open(env, name) {
    env.api.state.selected.clear(); env.api.state.selected.add(env.file(name).id); env.api.openFile(env.file(name));
}

test('create a named document, reload, and reopen through its Note Pad association', () => {
    const env = desktop(); create(env); click(env, 'modal-close');
    const file = env.file('MY DOCUMENT'); assert.equal(file.geosType, 7); assert.equal(file.parentApplication, 'note pad');
    assert.ok(env.api.state.selected.has(file.id));
    const loaded = desktop({ storage: env.storage }); open(loaded, file.name);
    assert.equal(loaded.api.state.modal.kind, 'document'); assert.equal(loaded.api.editor.readOnly, false);
    assert.equal(loaded.api.editor.value, 'First draft');
});

test('editing is a draft until Save, and Ctrl+S updates the existing file', () => {
    const env = desktop(); create(env); const id = env.file('MY DOCUMENT').id;
    type(env, 'Revised text'); assert.equal(env.file('MY DOCUMENT').content, 'First draft');
    assert.equal(env.api.state.modal.title, 'MY DOCUMENT *');
    env.key('s', env.api.editor, { ctrlKey: true });
    assert.equal(env.file('MY DOCUMENT').content, 'Revised text'); assert.equal(env.file('MY DOCUMENT').id, id);
    assert.equal(env.api.state.modal.title, 'MY DOCUMENT');
    assert.equal(JSON.parse(env.storage.get(KEY)).files.find(file => file.id === id).content, 'Revised text');
});

test('Save as turns the scratch note into an independent named document', () => {
    const env = desktop(); env.api.launchById('note'); type(env, 'Scratch text'); click(env, 'document-save-as');
    env.api.editor.value = 'FROM SCRATCH'; env.key('Enter', env.api.editor);
    assert.equal(env.file('FROM SCRATCH').content, 'Scratch text');
    type(env, 'Document revision'); click(env, 'document-save'); click(env, 'modal-close');
    assert.equal(env.file('note pad').content, 'Scratch text');
    assert.equal(env.file('FROM SCRATCH').content, 'Document revision');
});

test('canceling scratch Save as returns to the original scratch note', () => {
    const env = desktop(); env.api.launchById('note'); type(env, 'Keep scratch'); click(env, 'document-save-as');
    env.key('Escape', env.api.editor);
    assert.equal(env.api.state.modal.kind, 'note'); assert.equal(env.api.editor.value, 'Keep scratch');
    assert.equal(env.api.state.documentEdit, null);
});

test('blank and duplicate filenames are rejected without replacing existing files', () => {
    const env = desktop(); env.api.act('new-text'); type(env, 'Do not overwrite'); click(env, 'document-save');
    const before = env.storage.get(KEY);
    for (const name of [' ', 'read me', 'note pad']) {
        env.api.editor.value = name; env.key('Enter', env.api.editor);
        assert.equal(env.api.state.modal.kind, 'rename'); assert.equal(env.storage.get(KEY), before);
        assert.match(env.api.state.modal.lines[1], /required|already used/);
    }
    env.key('Escape'); assert.equal(env.api.state.modal.kind, 'document'); assert.equal(env.api.editor.value, 'Do not overwrite');
});

test('unsaved Close offers cancel, discard, and save without losing the draft', () => {
    const env = desktop(); create(env); type(env, 'Unsaved revision'); click(env, 'modal-close');
    assert.equal(env.api.state.modal.title, 'Unsaved changes'); env.api.state.modal.buttons[2][1]();
    assert.equal(env.api.editor.value, 'Unsaved revision');
    click(env, 'modal-close'); env.api.state.modal.buttons[1][1]();
    assert.equal(env.api.state.modal, null); assert.equal(env.file('MY DOCUMENT').content, 'First draft');
    open(env, 'MY DOCUMENT'); type(env, 'Saved while closing'); click(env, 'modal-close'); env.api.state.modal.buttons[0][1]();
    assert.equal(env.api.state.modal, null); assert.equal(env.file('MY DOCUMENT').content, 'Saved while closing');
});

test('saving an unnamed document while closing preserves the draft when naming is canceled', () => {
    const env = desktop(); env.api.act('new-text'); type(env, 'Unnamed draft'); click(env, 'modal-close');
    env.api.state.modal.buttons[0][1](); assert.equal(env.api.state.modal.kind, 'rename'); env.key('Escape');
    assert.equal(env.api.state.modal.kind, 'document'); assert.equal(env.api.editor.value, 'Unnamed draft');
    click(env, 'modal-close'); env.api.state.modal.buttons[0][1](); env.api.editor.value = 'SAVED ON CLOSE'; env.key('Enter');
    assert.equal(env.api.state.modal, null); assert.equal(env.file('SAVED ON CLOSE').content, 'Unnamed draft');
});

test('New and return to BASIC respect unsaved changes', () => {
    const env = desktop(); create(env); type(env, 'Keep editing'); click(env, 'document-new');
    env.api.state.modal.buttons[2][1](); assert.equal(env.api.editor.value, 'Keep editing');
    env.api.act('quit'); env.key('Escape'); assert.equal(env.api.state.phase, 'desktop'); assert.equal(env.api.editor.value, 'Keep editing');
    env.api.act('quit'); env.api.state.modal.buttons[0][1]();
    assert.equal(env.api.state.phase, 'off'); assert.equal(env.file('MY DOCUMENT').content, 'Keep editing');
});

test('document copies edit independently and survive a JSON backup round trip', async () => {
    const env = desktop(); create(env); click(env, 'modal-close'); env.api.act('duplicate');
    open(env, 'copy MY DOCUMENT'); type(env, 'Copy only'); click(env, 'document-save'); click(env, 'modal-close');
    assert.equal(env.file('MY DOCUMENT').content, 'First draft'); assert.equal(env.file('copy MY DOCUMENT').content, 'Copy only');
    env.api.act('disk-export'); const exported = await env.downloads.at(-1).text();
    const imported = desktop(); imported.api.previewImport(exported); imported.api.state.modal.buttons[0][1](); imported.api.closeModal();
    open(imported, 'copy MY DOCUMENT'); assert.equal(imported.api.editor.value, 'Copy only');
});

test('repeated Duplicate creates distinct document names and identities', () => {
    const env = desktop(); create(env); click(env, 'modal-close');
    env.api.act('duplicate'); env.api.act('duplicate');
    const docs = env.api.files.filter(file => file.geosType === 7 && file.parentApplication === 'note pad');
    assert.equal(docs.length, 3); assert.equal(new Set(docs.map(file => file.name)).size, 3);
    assert.equal(new Set(docs.map(file => file.id)).size, 3);
    assert.ok(docs.every(file => file.name.length <= 16 && file.content === 'First draft'));
});

test('storage failure keeps the draft, preserves saved content and allows text export', async () => {
    let full = false; const env = desktop({ failWrite: () => full }); create(env);
    const before = env.storage.get(KEY); full = true; type(env, 'Recover this draft'); click(env, 'document-save');
    assert.match(env.api.state.documentEdit.message, /Not saved/); assert.equal(env.api.editor.value, 'Recover this draft');
    assert.equal(env.file('MY DOCUMENT').content, 'First draft'); assert.equal(env.storage.get(KEY), before);
    click(env, 'document-export'); assert.equal(await env.downloads.at(-1).text(), 'Recover this draft');
    full = false; click(env, 'document-save'); assert.equal(env.file('MY DOCUMENT').content, 'Recover this draft');
});

test('a full disk rejects a new document without losing its text', () => {
    const env = desktop(); const remaining = 165 - env.api.files.reduce((sum, file) => sum + file.size, 0);
    env.api.files.push({ ...env.file('calculator'), id: 999, name: 'FILLER', size: remaining }); env.api.persistDisk();
    const before = env.storage.get(KEY); env.api.act('new-text'); type(env, 'Still here'); nameDocument(env, 'NO SPACE');
    assert.match(env.api.state.documentEdit.message, /Disk full/); assert.equal(env.api.editor.value, 'Still here');
    assert.equal(env.file('NO SPACE'), undefined); assert.equal(env.storage.get(KEY), before);
});

test('document size uses UTF-8 bytes, and a protected document opens read-only', () => {
    const env = desktop(); create(env, 'UNICODE', '🙂'.repeat(300)); assert.equal(env.file('UNICODE').size, 2);
    click(env, 'modal-close'); env.file('UNICODE').locked = true; open(env, 'UNICODE');
    assert.equal(env.api.state.modal.kind, 'reader'); assert.equal(env.api.editor.readOnly, true);
    assert.equal(env.api.state.documentEdit, null);
});

test('unsaved documents guard reload and Tab stays inside the editor controls', () => {
    const env = desktop(); env.api.act('new-text'); type(env, 'Unsaved'); assert.equal(env.unload().prevented, true);
    env.key('Tab', env.api.editor); assert.equal(env.document.activeElement.dataset.key, 'document-new');
    click(env, 'document-save'); env.api.editor.value = 'RELOAD SAFE'; env.key('Enter');
    assert.equal(env.unload().prevented, false);
});
