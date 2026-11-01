// Mobile presentation only. Unwrap the original screen when returning to desktop.
(() => {
    const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse) and (max-height: 600px)');
    const screen = document.querySelector('.screen');
    let monitor, controls, hint;
    const send = key => document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    const command = text => {
        if (window.GEOS?.active || programRunning) return;
        if (mazeInterval) send('Escape');
        inputBuffer = [...text].map(char => ({ char, color: currentTextColor }));
        updateCursorDisplay();
        send('Enter');
    };
    const fit = () => {
        if (!monitor) return;
        const viewport = window.visualViewport;
        const width = Math.max(1, Math.min(
            (viewport?.width || window.innerWidth) - 24,
            Math.max(120, (viewport?.height || window.innerHeight) - 132) * 4 / 3
        ));
        monitor.style.width = width + 'px';
        monitor.style.height = width * 3 / 4 + 'px';
        monitor.style.setProperty('--mobile-scale', width / 1280);
        if (document.activeElement?.getAttribute('aria-label') === 'C64 command input') {
            screen.scrollTop = screen.scrollHeight;
        }
    };
    const update = () => {
        if (!mobile.matches) {
            if (monitor) {
                monitor.replaceWith(screen);
                controls.remove(); hint.remove();
                monitor = controls = hint = null;
            }
            return;
        }
        if (monitor) { fit(); return; }
        monitor = document.createElement('div');
        monitor.className = 'mobile-monitor';
        screen.before(monitor); monitor.appendChild(screen);
        controls = document.createElement('nav');
        controls.className = 'mobile-controls';
        controls.setAttribute('aria-label', 'C64 touch controls');
        const actions = [
            ['Keyboard', () => document.querySelector('[aria-label="C64 command input"]').focus({ preventScroll: true })],
            ['Directory', () => { command('LOAD"$",8'); command('LIST'); }],
            ['Run', () => command('RUN')],
            ['Run/Stop', () => send('Escape')]
        ];
        for (const [label, action] of actions) {
            const button = document.createElement('button');
            button.type = 'button'; button.textContent = label;
            // Keep an already-open keyboard from closing when using the controls.
            button.addEventListener('pointerdown', event => event.preventDefault());
            button.addEventListener('click', action);
            controls.appendChild(button);
        }
        hint = document.createElement('p');
        hint.className = 'mobile-hint';
        hint.textContent = 'Tap the screen to type · Rotate for a larger screen';
        monitor.after(controls, hint);
        fit();
    };
    mobile.addEventListener('change', update);
    window.addEventListener('resize', fit);
    window.visualViewport?.addEventListener('resize', fit);
    update();
})();
