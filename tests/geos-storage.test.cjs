const assert = require('node:assert/strict');
const { test } = require('node:test');
const { desktop } = require('./helpers/geos-harness.cjs');
const KEY = 'c64-geos-disk', BACKUP = 'c64-geos-disk-backup', RECOVERY = 'c64-geos-disk-recovery';
const plain = value => JSON.parse(JSON.stringify(value));

function select(env, name) {
    env.api.state.selected.clear(); env.api.state.selected.add(env.file(name).id);
}
function rename(env, name, next) {
    select(env, name); env.api.act('rename'); env.api.editor.value = next; env.api.state.modal.buttons[0][1]();
}
function note(env, value) {
    env.api.launchById('note'); env.api.editor.value = value;
    env.api.editor.listeners.get('input')[0](); env.api.closeModal();
}

test('file changes, disk name, pattern, associations and note survive a fresh page', () => {
    const env = desktop();
    rename(env, 'READ ME', 'WELCOME'); select(env, 'WELCOME'); env.api.act('duplicate');
    note(env, 'Persistent note');
    env.api.act('disk-rename'); env.api.editor.value = 'MY GEOS DISK'; env.api.state.modal.buttons[0][1]();
    env.api.act('colors'); env.api.state.modal.buttons[0][1](); env.api.closeModal();
    const loaded = desktop({ storage: env.storage });
    assert.ok(loaded.file('WELCOME')); assert.ok(loaded.file('copy WELCOME'));
    assert.equal(loaded.file('copy WELCOME').parentApplication, 'TEXT READER');
    assert.equal(loaded.api.state.diskName, 'MY GEOS DISK'); assert.equal(loaded.api.state.pattern, 1);
    loaded.api.launchById('note'); assert.equal(loaded.api.editor.value, 'Persistent note');
    loaded.api.closeModal(); loaded.api.openFile(loaded.file('WELCOME'));
    assert.equal(loaded.api.state.modal.kind, 'reader');
});

test('waste basket and restoration persist without permanently removing the file', () => {
    const env = desktop(); select(env, 'calculator'); env.api.act('delete'); env.api.state.modal.buttons[0][1]();
    const loaded = desktop({ storage: env.storage });
    assert.equal(loaded.api.state.trash.name, 'calculator'); assert.ok(loaded.file('calculator'));
    loaded.api.controls.children.find(node => node.dataset.key === 'trash').click();
    loaded.api.state.modal.buttons[0][1]();
    const restored = desktop({ storage: env.storage });
    assert.equal(restored.api.state.trash, null); restored.api.openFile(restored.file('calculator'));
    assert.equal(restored.api.state.modal.kind, 'calculator');
});

test('legacy Note Pad is migrated once and BASIC saves are untouched', () => {
    const storage = new Map([['c64-geos-note', 'Legacy note'], ['c64prog_DEMO', '{"10":"PRINT 1"}']]);
    const env = desktop({ storage }); env.api.launchById('note'); assert.equal(env.api.editor.value, 'Legacy note'); env.api.closeModal();
    note(env, '');
    const loaded = desktop({ storage }); loaded.api.launchById('note'); assert.equal(loaded.api.editor.value, '');
    assert.equal(storage.get('c64-geos-note'), 'Legacy note'); assert.equal(storage.get('c64prog_DEMO'), '{"10":"PRINT 1"}');
    assert.equal(JSON.parse(storage.get(KEY)).version, 2);
});

test('version 1 note migrates into the filesystem and original save becomes backup', () => {
    const saved = plain(desktop().api.diskSnapshot()); saved.version = 1; saved.note = 'Version one note';
    delete saved.disk.pattern; delete saved.trashId;
    delete saved.files.find(file => file.applicationId === 'note').content;
    const raw = JSON.stringify(saved), storage = new Map([[KEY, raw]]);
    const env = desktop({ storage }); env.api.launchById('note'); assert.equal(env.api.editor.value, saved.note);
    assert.equal(JSON.parse(storage.get(KEY)).version, 2); assert.equal(storage.get(BACKUP), raw);
});

test('corrupt and future-version saves are preserved while a valid backup is recoverable', () => {
    const good = plain(desktop().api.diskSnapshot()); good.disk.name = 'RECOVERED DISK';
    for (const bad of ['{broken', JSON.stringify({ ...good, version: 99 })]) {
        const backup = JSON.stringify(good), storage = new Map([[KEY, bad], [BACKUP, backup]]);
        const env = desktop({ storage }); assert.equal(env.api.state.diskName, good.disk.name);
        assert.match(env.api.state.storageIssue, /recovery/);
        rename(env, 'READ ME', 'SESSION CHANGE'); assert.equal(storage.get(KEY), bad); assert.equal(storage.get(BACKUP), backup);
        env.api.act('disk-previous'); env.api.state.modal.buttons[0][1]();
        assert.equal(env.api.state.modal.title, 'Disk imported'); assert.equal(storage.get(RECOVERY), bad);
        assert.equal(JSON.parse(storage.get(KEY)).disk.name, good.disk.name);
        assert.equal(env.api.state.storageIssue, '');
    }
});

test('unreadable primary and backup do not overwrite either original', () => {
    const storage = new Map([[KEY, 'broken primary'], [BACKUP, 'broken backup']]);
    const env = desktop({ storage }); assert.ok(env.file('READ ME'));
    note(env, 'Session note'); assert.equal(storage.get(KEY), 'broken primary'); assert.equal(storage.get(BACKUP), 'broken backup');
});

test('storage denial keeps a usable session and allows a downloadable backup', async () => {
    const env = desktop({ failRead: () => true });
    assert.match(env.api.state.storageIssue, /unavailable/); note(env, 'Session only');
    env.api.launchById('note'); assert.equal(env.api.editor.value, 'Session only'); env.api.closeModal();
    env.api.act('disk-export');
    const backup = JSON.parse(await env.downloads[0].text());
    assert.equal(backup.files.find(file => file.applicationId === 'note').content, 'Session only');
});

test('quota failure retains the last saved disk and session edits', () => {
    let full = false;
    const env = desktop({ failWrite: () => full }); const previous = env.storage.get(KEY); full = true;
    rename(env, 'READ ME', 'UNSAVED'); assert.ok(env.file('UNSAVED'));
    assert.equal(env.storage.get(KEY), previous); assert.match(env.api.state.storageIssue, /could not be saved/);
    full = false; assert.equal(env.api.persistDisk(), true);
    assert.ok(desktop({ storage: env.storage }).file('UNSAVED'));
});

test('another tab cannot be silently overwritten by a stale desktop', () => {
    const first = desktop(), second = desktop({ storage: first.storage });
    rename(first, 'READ ME', 'FIRST TAB'); const saved = first.storage.get(KEY);
    rename(second, 'READ ME', 'SECOND TAB');
    assert.match(second.api.state.storageIssue, /Another tab/); assert.equal(first.storage.get(KEY), saved);
    assert.ok(second.file('SECOND TAB')); assert.ok(desktop({ storage: first.storage }).file('FIRST TAB'));
});

test('an import confirmation cannot overwrite a save made in another tab', () => {
    const first = desktop(), second = desktop({ storage: first.storage });
    const imported = plain(first.api.diskSnapshot()); imported.disk.name = 'NEW IMPORT';
    second.api.previewImport(JSON.stringify(imported)); rename(first, 'READ ME', 'OTHER TAB SAVE');
    const saved = first.storage.get(KEY), backup = first.storage.get(BACKUP);
    second.api.state.modal.buttons[0][1]();
    assert.equal(second.api.state.modal.title, 'Import canceled');
    assert.equal(first.storage.get(KEY), saved); assert.equal(first.storage.get(BACKUP), backup);
});

test('duplicated notes retain independent content through a reload', () => {
    const env = desktop(); note(env, 'Original note'); select(env, 'note pad'); env.api.act('duplicate');
    const copy = env.file('copy note pad'); assert.equal(copy.content, 'Original note');
    select(env, copy.name); env.api.openFile(copy); env.api.editor.value = 'Copy note';
    env.api.editor.listeners.get('input')[0](); env.api.closeModal();
    const loaded = desktop({ storage: env.storage });
    assert.equal(loaded.file('note pad').content, 'Original note'); assert.equal(loaded.file('copy note pad').content, 'Copy note');
});

test('export/import round trip requires confirmation and previous disk can be restored', async () => {
    const source = desktop(); rename(source, 'READ ME', 'IMPORTED DOC'); note(source, 'Imported note'); source.api.act('disk-export');
    const backup = await source.downloads[0].text();
    const target = desktop(); const before = target.storage.get(KEY);
    target.api.previewImport(backup); assert.equal(target.api.state.modal.title, 'Import disk'); assert.equal(target.storage.get(KEY), before);
    target.api.state.modal.buttons[1][1](); assert.equal(target.api.state.modal, null); assert.ok(target.file('READ ME'));
    target.api.previewImport(backup); target.api.state.modal.buttons[0][1]();
    assert.ok(target.file('IMPORTED DOC')); assert.equal(target.storage.get(BACKUP), before);
    const loaded = desktop({ storage: target.storage }); loaded.api.launchById('note'); assert.equal(loaded.api.editor.value, 'Imported note');
    loaded.api.closeModal(); loaded.api.act('disk-previous'); loaded.api.state.modal.buttons[0][1]();
    assert.ok(loaded.file('READ ME')); assert.equal(loaded.file('IMPORTED DOC'), undefined);
});

test('invalid imports leave both current files and saved bytes untouched', () => {
    const env = desktop(), valid = plain(env.api.diskSnapshot()), before = env.storage.get(KEY);
    const mutations = [
        data => { data.version = 99; }, data => { data.files[1].id = data.files[0].id; },
        data => { data.files[0].size = 166; }, data => { data.files[0].diskId = 'wrong-disk'; },
        data => { data.files[0].content = { not: 'text' }; }, data => { data.trashId = data.files[0].id; },
        data => { data.files[0].structure = 'executable'; }, data => { data.disk.name = ''; }
    ];
    for (const mutate of mutations) {
        const data = plain(valid); mutate(data); env.api.previewImport(JSON.stringify(data));
        assert.equal(env.api.state.modal.title, 'Import failed'); assert.equal(env.storage.get(KEY), before);
        assert.deepEqual(plain(env.api.diskSnapshot()), valid); env.api.closeModal();
    }
});

test('import storage failure does not replace the current in-memory or saved disk', () => {
    let full = false;
    const env = desktop({ failWrite: key => full && key === KEY }); const before = env.storage.get(KEY);
    const imported = plain(env.api.diskSnapshot()); imported.disk.name = 'IMPORT TARGET';
    env.api.previewImport(JSON.stringify(imported)); full = true; env.api.state.modal.buttons[0][1]();
    assert.equal(env.api.state.modal.title, 'Import not saved'); assert.equal(env.storage.get(KEY), before);
    assert.equal(env.api.state.diskName, 'GEOS 2.0');
});

test('file picker reads backups and a late read cannot interrupt a return to BASIC', async () => {
    const env = desktop(), backup = JSON.stringify(env.api.diskSnapshot());
    env.api.picker.files = [{ size: backup.length, text: async () => backup }];
    await env.api.picker.listeners.get('change')[0](); assert.equal(env.api.state.modal.title, 'Import disk');
    env.api.closeModal(); let resolve;
    env.api.picker.files = [{ size: backup.length, text: () => new Promise(done => { resolve = done; }) }];
    const pending = env.api.picker.listeners.get('change')[0]();
    env.api.act('quit'); env.api.state.modal.buttons[0][1](); resolve(backup); await pending;
    assert.equal(env.api.state.phase, 'off'); assert.equal(env.api.state.modal, null);
});

test('trash continues to reserve disk capacity so it can always be restored', () => {
    const env = desktop(); select(env, 'calculator'); env.api.act('delete'); env.api.state.modal.buttons[0][1]();
    select(env, 'TEXT READER');
    for (let i = 0; i < 80; i++) env.api.act('duplicate');
    assert.equal(env.api.state.modal.title, 'Duplicate');
    const saved = JSON.parse(env.storage.get(KEY)); assert.ok(saved.files.reduce((sum, file) => sum + file.size, 0) <= 165);
    assert.equal(saved.trashId, env.file('calculator').id);
});
