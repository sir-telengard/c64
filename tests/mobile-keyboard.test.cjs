const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
    const handlers = {}, taps = {}, keys = [];
    const keyboard = {
        style: {}, value: '', setAttribute() {}, setSelectionRange() {},
        addEventListener(name, fn) { handlers[name] = fn; },
        focus() { this.focused = true; }
    };
    const window = { GEOS: { active: false } };
    const document = {
        querySelector() { return { addEventListener(name, fn) { taps[name] = fn; } }; },
        createElement() { return keyboard; }, body: { appendChild() {} },
        dispatchEvent(event) { keys.push(event.key); }
    };
    const source = fs.readFileSync(require.resolve('../script.js'), 'utf8');
    vm.runInNewContext(source.slice(source.indexOf('// A real editable control')).split('// Mobile presentation only.')[0], {
        document, window, KeyboardEvent: function (_, options) { Object.assign(this, options); }
    });
    const fire = (name, values = {}) => {
        const event = { preventDefault() { this.prevented = true; }, stopPropagation() {}, ...values };
        handlers[name](event); return event;
    };
    return { keyboard, keys, fire, window, tap: target => taps.click({ target: { closest: () => target } }) };
}

test('tapping BASIC focuses an editable control; links and GEOS do not', () => {
    const h = setup(); h.tap(null); assert.equal(h.keyboard.focused, true);
    h.keyboard.focused = false; h.tap({}); assert.equal(h.keyboard.focused, false);
    h.window.GEOS.active = true; h.tap(null); assert.equal(h.keyboard.focused, false);
});

test('native input and multiline paste forward text once and reset the sentinel', () => {
    const h = setup(); h.keyboard.value = ' print "HI"\r\nRUN'; h.fire('input');
    assert.equal(h.keys.join('|'), [...'print "HI"', 'Enter', ...'RUN'].join('|'));
    assert.equal(h.keyboard.value, ' ');
    h.fire('input'); assert.equal(h.keys.length, 14);
});

test('IME composition waits for committed text and ignores trailing empty input', () => {
    const h = setup(); h.fire('compositionstart'); h.keyboard.value = ' abc';
    h.fire('input', { isComposing: true }); assert.deepEqual(h.keys, []);
    h.fire('compositionend'); h.fire('input'); assert.deepEqual(h.keys, ['a', 'b', 'c']);
});

test('soft keyboard deletion and return are consumed without duplicate native edits', () => {
    const h = setup();
    assert.equal(h.fire('beforeinput', { inputType: 'deleteContentBackward' }).prevented, true);
    assert.equal(h.fire('beforeinput', { inputType: 'insertParagraph' }).prevented, true);
    assert.deepEqual(h.keys, ['Backspace', 'Enter']);
});

test('hardware printable keys use native input while special keys are forwarded once', () => {
    const h = setup(); h.fire('keydown', { key: 'a' }); assert.deepEqual(h.keys, []);
    h.keyboard.value = ' a'; h.fire('input'); h.fire('keydown', { key: 'Enter' });
    assert.deepEqual(h.keys, ['a', 'Enter']);
    h.fire('keydown', { key: 'Enter', isComposing: true });
    assert.deepEqual(h.keys, ['a', 'Enter']);
});
