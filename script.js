// Select the cursor and cursor-line elements
const cursor = document.querySelector(".cursor");
const cursorLine = document.querySelector(".cursor-line");

// Track the input state
let inputBuffer = []; // Array to store characters with their colors
let currentTextColor = "#7C71DB"; // Default text color (LIGHT BLUE)
let programLines = {}; // Store program lines as key-value pairs
let variables = {}; // Store BASIC variables
let programCounter = 0; // Current line being executed
let running = false; // Program execution state
let programRunning = false; // Async program loop active (defer READY until done)

// Define color codes
const colors = {
    0: "#000000",
    1: "#FFFFFF",
    2: "#880000",
    3: "#AAFFEE",
    4: "#CC44CC",
    5: "#00CC55",
    6: "#0000AA",
    7: "#EEEE77",
    8: "#DD8855",
    9: "#664400",
    10: "#FF7777",
    11: "#333333",
    12: "#777777",
    13: "#AAFF66",
    14: "#0088FF",
    15: "#BBBBBB"
};

// BASIC Parser and Executor
class BasicInterpreter {
    constructor() {
        this.variables = {};
        this.strings = {};
        this.program = {};
        this.stack = [];
        this.data = [];
        this.readPointer = 0;
    }

    // Parse a line of BASIC code
    parseLine(line) {
        line = line.trim().toUpperCase();
        
        // Check for line number
        const lineNumMatch = line.match(/^(\d+)\s*(.+)$/);
        if (lineNumMatch) {
            const lineNumber = parseInt(lineNumMatch[1]);
            const statement = lineNumMatch[2].trim();
            
            if (statement) {
                programLines[lineNumber] = statement;
            } else {
                delete programLines[lineNumber];
            }
            return { type: 'store', lineNumber };
        }
        
        // Direct command (no line number)
        return { type: 'command', statement: line };
    }

    // Execute a single statement
    executeStatement(statement) {
        statement = statement.trim();
        
        if (!statement) return;
        
        // ? shorthand for PRINT
        if (statement.startsWith('?')) {
            return this.executePrint(statement.substring(1));
        }

        // PRINT statement
        if (statement.startsWith('PRINT')) {
            return this.executePrint(statement.substring(5));
        }
        
        // LET statement (explicit or implicit)
        if (statement.startsWith('LET ')) {
            return this.executeLet(statement.substring(4));
        }
        
        // Variable assignment
        if (statement.includes('=') && !statement.startsWith('IF')) {
            return this.executeLet(statement);
        }
        
        // LIST command
        if (statement === 'LIST') {
            return this.executeList();
        }
        
        // RUN command
        if (statement === 'RUN') {
            return this.executeRun();
        }
        
        // NEW command
        if (statement === 'NEW') {
            return this.executeNew();
        }
        
        // GOTO command
        if (statement.startsWith('GOTO')) {
            return this.executeGoto(statement.substring(4));
        }
        
        throw new Error(`?SYNTAX ERROR`);
    }

    executePrint(args) {
        args = args.trim();
        let output = '';
        
        if (!args) {
            output = '';
        } else if (args.startsWith('"') && args.endsWith('"')) {
            // String literal
            output = args.slice(1, -1);
        } else if (this.isVariable(args)) {
            // Variable
            const value = this.variables[args] || 0;
            output = value.toString();
        } else {
            // Number or expression (simplified)
            output = this.evaluateExpression(args).toString();
        }
        
        this.outputLine(output);
    }

    executeLet(statement) {
        statement = statement.trim();
        const [varName, expr] = statement.split('=').map(s => s.trim());
        
        if (!this.isValidVariable(varName)) {
            throw new Error(`?SYNTAX ERROR`);
        }
        
        const value = this.evaluateExpression(expr);
        this.variables[varName] = value;
    }

    executeList() {
        const lineNumbers = Object.keys(programLines).map(Number).sort((a, b) => a - b);
        for (const lineNum of lineNumbers) {
            this.outputLine(`${lineNum} ${programLines[lineNum]}`);
        }
    }

    executeRun() {
        const lineNumbers = Object.keys(programLines).map(Number).sort((a, b) => a - b);
        running = true;
        programRunning = true;
        programCounter = 0;

        const step = () => {
            try {
                let chunk = 0;
                while (running && programCounter < lineNumbers.length) {
                    const lineNum = lineNumbers[programCounter];
                    const statement = programLines[lineNum];
                    this.lastLine = lineNum;
                    // 10 PRINT CHR$(205.5+RND(1)); : GOTO 10 maze easter egg
                    if (/CHR\$?\(\s*205/.test(statement) && /GOTO/.test(statement)) {
                        running = false;
                        programRunning = false;
                        startMaze();
                        return;
                    }
                    this.executeStatement(statement);
                    programCounter++;
                    if (++chunk >= 500) {
                        setTimeout(step, 0);
                        return;
                    }
                }
            } catch (error) {
                this.outputLine(error.message);
            }
            if (programRunning) {
                running = false;
                programRunning = false;
                addReadyPrompt();
            }
        };
        step();
    }

    executeNew() {
        programLines = {};
        variables = {};
        this.variables = {};
    }

    executeGoto(target) {
        const lineNum = parseInt(target.trim());
        const lineNumbers = Object.keys(programLines).map(Number).sort((a, b) => a - b);
        const index = lineNumbers.indexOf(lineNum);
        
        if (index === -1) {
            throw new Error(`?UNDEF'D STATEMENT ERROR`);
        }
        
        programCounter = index - 1; // -1 because the run loop increments after each statement
    }

    isVariable(name) {
        return /^[A-Z][A-Z0-9]*$/.test(name);
    }

    isValidVariable(name) {
        return /^[A-Z][A-Z0-9]*$/.test(name) && name.length <= 2;
    }

    evaluateExpression(expr) {
        expr = expr.trim();
        
        // Variable reference
        if (this.isVariable(expr)) {
            return this.variables[expr] || 0;
        }
        
        // Number
        if (/^-?\d+(\.\d+)?$/.test(expr)) {
            return parseFloat(expr);
        }
        
        // Simple arithmetic (for now)
        try {
            // Replace variables with values
            let processed = expr;
            for (const [varName, value] of Object.entries(this.variables)) {
                processed = processed.replace(new RegExp(varName, 'g'), value);
            }
            
            // Evaluate simple expressions
            return Function('"use strict"; return (' + processed + ')')();
        } catch (e) {
            return 0;
        }
    }

    outputLine(text) {
        const outputLine = document.createElement("div");
        outputLine.className = "ready-line";
        const outputSpan = document.createElement('span');
        outputSpan.style.color = currentTextColor;
        const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        outputSpan.innerHTML = escaped.replace(/@GENXJAY\.COM/g,
            '<a href="https://bsky.app/profile/genxjay.com" target="_blank" style="color:#c9d487">@GENXJAY.COM</a>');
        outputLine.appendChild(outputSpan);
        cursorLine.parentNode.insertBefore(outputLine, cursorLine);
        // Cap scrollback so infinite loops don't grow the DOM forever
        const lines = cursorLine.parentNode.querySelectorAll('.ready-line, .easter-egg');
        if (lines.length > 4000) lines[0].remove();
        cursorLine.scrollIntoView({ block: 'end' });
    }
}

const basic = new BasicInterpreter();

let directoryLoaded = false; // LOAD"$",8 was issued; next LIST shows the disk directory
let mazeInterval = null; // 10 PRINT maze animation timer

function glyphSupported(ch) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '32px C64_Pro_Mono, monospace';
    const missing = ctx.measureText('￿').width;
    const w = ctx.measureText(ch).width;
    return w > 0 && w !== missing;
}

function startMaze() {
    const diagA = glyphSupported('╱') ? '╱' : '/';
    const diagB = glyphSupported('╲') ? '╲' : '\\';
    let lineDiv = document.createElement('div');
    lineDiv.className = 'ready-line';
    cursorLine.parentNode.insertBefore(lineDiv, cursorLine);
    let col = 0;
    mazeInterval = setInterval(() => {
        const span = document.createElement('span');
        span.style.color = currentTextColor;
        span.textContent = Math.random() < 0.5 ? diagA : diagB;
        lineDiv.appendChild(span);
        if (++col >= 38) {
            col = 0;
            lineDiv = document.createElement('div');
            lineDiv.className = 'ready-line';
            cursorLine.parentNode.insertBefore(lineDiv, cursorLine);
        }
        cursorLine.scrollIntoView({ block: 'end' });
    }, 15);
}

function printDirectory() {
    basic.outputLine('0 "GENX JAY DISK  " 64 2A');
    basic.outputLine('12   "GENX JAY"       PRG');
    basic.outputLine('3    "BLUESKY"        PRG');
    basic.outputLine('664 BLOCKS FREE.');
}

// Update cursor color function
function updateCursorColor(color) {
    cursor.style.color = color;
    cursor.style.backgroundColor = color; // Ensure the cursor matches text color
}

// Update cursor and text display
function updateCursorDisplay() {
    // Clear the cursor line
    cursorLine.innerHTML = '';
    
    // Add each character with its own color
    inputBuffer.forEach(charInfo => {
        const charSpan = document.createElement('span');
        charSpan.style.color = charInfo.color;
        charSpan.textContent = charInfo.char;
        cursorLine.appendChild(charSpan);
    });
    
    // Add the cursor at the end
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor';
    cursorSpan.textContent = '█';
    cursorLine.appendChild(cursorSpan);
    updateCursorColor(currentTextColor);
}

// Listen for keypress events
document.addEventListener("keydown", (event) => {
    // Any keypress stops the 10 PRINT maze
    if (mazeInterval) {
        clearInterval(mazeInterval);
        mazeInterval = null;
        inputBuffer = [];
        addReadyPrompt();
        cursorLine.innerHTML = '<span class="cursor">█</span>';
        updateCursorColor(currentTextColor);
        return;
    }

    // RUN/STOP: Escape breaks a running program
    if (programRunning && event.key === 'Escape') {
        running = false;
        programRunning = false;
        basic.outputLine('BREAK IN ' + (basic.lastLine || 0));
        inputBuffer = [];
        addReadyPrompt();
        cursorLine.innerHTML = '<span class="cursor">█</span>';
        updateCursorColor(currentTextColor);
        return;
    }

    let key = event.key;

    // Handle ALT + 1-8 for color changes (using Alt to avoid browser tab switching)
    if (event.altKey && /^[1-8]$/.test(key)) {
        event.preventDefault(); // Prevent browser menu from appearing
        const colorIndex = parseInt(key, 10);
        currentTextColor = colors[colorIndex] || "#FFFFFF";
        // Update only the cursor color first
        updateCursorColor(currentTextColor);
        return;
    }

    key = key.toUpperCase();

    // Handle special keys
    if (key === "BACKSPACE") {
        if (inputBuffer.length > 0) {
            inputBuffer.pop(); // Remove the last character
            updateCursorDisplay();
        }
    } else if (key === "ENTER") {
        // Convert input buffer to plain text
        const inputText = inputBuffer.map(charInfo => charInfo.char).join('');
        
        // Create a new line with the current input
        const newLine = document.createElement("div");
        newLine.className = "ready-line";
        
        // Add each character with its own color
        inputBuffer.forEach(charInfo => {
            const charSpan = document.createElement('span');
            charSpan.style.color = charInfo.color;
            charSpan.textContent = charInfo.char;
            newLine.appendChild(charSpan);
        });
        
        cursorLine.parentNode.insertBefore(newLine, cursorLine);

        // Handle empty input
        if (inputText.trim() === '') {
            inputBuffer = [];
            cursorLine.innerHTML = '<span class="cursor">█</span>';
            updateCursorColor(currentTextColor);
            return;
        }
        
        // Handle numbered lines (BASIC program lines)
        if (/^\d+/.test(inputText)) {
            const match = inputText.match(/^(\d+)\s*(.*)$/);
            const lineNumber = parseInt(match[1], 10);
            const code = match[2].trim();
            if (code) {
                programLines[lineNumber] = code;
            } else {
                delete programLines[lineNumber]; // bare line number deletes the line
            }
            inputBuffer = [];
            cursorLine.innerHTML = '<span class="cursor">█</span>';
            updateCursorColor(currentTextColor);
            return;
        }
        
        // Handle commands that need a READY prompt after execution
        let needsReadyPrompt = true;
        
        if (inputText === 'RUN' && Object.keys(programLines).length === 0) {
            // Just show the Easter egg message without repeating the program lines
            const easterEggMessage = document.createElement("div");
            easterEggMessage.className = "easter-egg";
            const messageSpan = document.createElement('span');
            messageSpan.style.color = currentTextColor;
            messageSpan.innerHTML = 'HAHA NICE TRY, SHOW ME WHAT YOU DID ON BLUESKY <a href="https://bsky.app/profile/genxjay.com" target="_blank"><span class="inverse">@GENXJAY.COM</span></a>';
            easterEggMessage.appendChild(messageSpan);
            cursorLine.parentNode.insertBefore(easterEggMessage, cursorLine);
        }
        else if (inputText.startsWith('POKE 53280,')) {
            const colorIndex = parseInt(inputText.split(',')[1], 10);
            document.querySelector('.screen').style.borderColor = colors[colorIndex] || '#000000';
            document.body.style.backgroundColor = colors[colorIndex] || '#000000';
        }
        else if (inputText.startsWith('POKE 53281,')) {
            const colorIndex = parseInt(inputText.split(',')[1], 10);
            document.querySelector('.screen').style.backgroundColor = colors[colorIndex] || '#000000';
        }
        else if (/^LOAD\s*"BLUESKY"\s*,\s*8/.test(inputText)) {
            basic.outputLine('SEARCHING FOR BLUESKY');
            basic.outputLine('FOUND "BLUESKY"');
            basic.outputLine('LOADING');
            window.open('https://bsky.app/profile/genxjay.com', '_blank');
        }
        else if (/^LOAD\s*"(\*|GENX JAY)"\s*,\s*8/.test(inputText)) {
            simulateLoadCommand(newLine);
            needsReadyPrompt = false;
        }
        else if (/^LOAD\s*"\$"\s*,\s*8/.test(inputText)) {
            basic.outputLine('SEARCHING FOR $');
            basic.outputLine('LOADING');
            directoryLoaded = true;
        }
        else if (inputText === 'LIST' && directoryLoaded && Object.keys(programLines).length === 0) {
            directoryLoaded = false;
            printDirectory();
        }
        else if (inputText === 'SYS 64738') {
            window.location.reload();
            return;
        }
        else {
            try {
                basic.executeStatement(inputText);
            } catch (error) {
                basic.outputLine(error.message);
            }
            if (programRunning || mazeInterval) needsReadyPrompt = false; // READY comes when the program/maze ends
        }
        
        // Add READY prompt if needed and reset for next input
        if (needsReadyPrompt) {
            addReadyPrompt();
        }
        
        // Clear the input buffer (set to empty array, not empty string)
        inputBuffer = [];
        cursorLine.innerHTML = '<span class="cursor">█</span>';
        updateCursorColor(currentTextColor);
    } else if (key.length === 1) {
        // Add new character with current color
        inputBuffer.push({
            char: key,
            color: currentTextColor
        });
        updateCursorDisplay();
    }
});

function simulateLoadCommand(commandLine) {
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "ready-line";
    loadingMessage.textContent = "SEARCHING FOR *";
    commandLine.parentNode.insertBefore(loadingMessage, commandLine.nextSibling);

    setTimeout(() => {
        loadingMessage.textContent = 'FOUND "GENX JAY"';

        const loadingLine = document.createElement("div");
        loadingLine.className = "ready-line";
        loadingLine.textContent = "LOADING";
        loadingMessage.parentNode.insertBefore(loadingLine, loadingMessage.nextSibling);

        setTimeout(() => {
            programLines = {
                10: 'PRINT "HELLO FROM THE GENX JAY DISK"',
                20: 'PRINT "FOLLOW ME ON BLUESKY: @GENXJAY.COM"'
            };
            addReadyPrompt();
        }, 2500);
    }, 1500);
}

function addReadyPrompt() {
    const blankLine = document.createElement("div");
    blankLine.className = "ready-line";
    blankLine.innerHTML = "&nbsp;";
    cursorLine.parentNode.insertBefore(blankLine, cursorLine);

    const readyLine = document.createElement("div");
    readyLine.className = "ready-line";
    const readySpan = document.createElement('span');
    readySpan.style.color = currentTextColor;
    readySpan.textContent = "READY.";
    readyLine.appendChild(readySpan);
    cursorLine.parentNode.insertBefore(readyLine, cursorLine);
    cursorLine.scrollIntoView({ block: 'end' });
}
