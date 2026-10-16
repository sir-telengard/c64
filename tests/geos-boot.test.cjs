const assert = require('node:assert/strict');
const { test } = require('node:test');
const { desktop } = require('./helpers/geos-harness.cjs');

for (const reducedMotion of [false, true]) {
    test(`loading messages remain visible in stages (reduced motion: ${reducedMotion})`, () => {
        const { api, document, output, advance } = desktop({ manualBoot: true, reducedMotion });
        const shell = document.body.children.find(node => node.className === 'geos-shell');
        assert.equal(api.state.phase, 'loading'); assert.equal(shell.hidden, true);
        assert.deepEqual(output, ['SEARCHING FOR GEOS']);
        advance(899); assert.equal(output.length, 1); assert.equal(shell.hidden, true);
        advance(1); assert.deepEqual(output, ['SEARCHING FOR GEOS', 'FOUND GEOS']);
        advance(900); assert.deepEqual(output, ['SEARCHING FOR GEOS', 'FOUND GEOS', 'LOADING']);
        assert.equal(api.state.phase, 'loading'); assert.equal(shell.hidden, true);
        advance(1799); assert.equal(shell.hidden, true);
        advance(1); assert.equal(api.state.phase, 'desktop'); assert.equal(shell.hidden, false);
    });
}

test('Escape cancels pending loading messages and desktop activation', () => {
    const { api, document, output, advance, key } = desktop({ manualBoot: true });
    advance(1000); key('Escape');
    assert.equal(api.state.phase, 'off');
    advance(10000);
    assert.deepEqual(output, ['SEARCHING FOR GEOS', 'FOUND GEOS']);
    assert.equal(document.body.children.find(node => node.className === 'geos-shell').hidden, true);
    assert.equal(api.state.phase, 'off');
});
