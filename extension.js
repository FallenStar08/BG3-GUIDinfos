const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

let index = {}; // Index for quick lookups
let decorationType; // Decoration type for displaying information

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    loadIndex(); // Load index when the extension is activated

    // Register hover provider
    let hoverProvider = vscode.languages.registerHoverProvider('*', {
        provideHover(document, position) {
            // Get the entire line at the current position
            const line = document.lineAt(position.line).text;

            // Cringe regex
            const guidMatch = line.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

            if (guidMatch) {
                const guid = guidMatch[0];

                if (guid) {
                    const info = index[guid];

                    if (info) {
                        const preferredOrder = ['Name', 'LocalizedName', 'Description', 'TechnicalDescription', 'SlotName', 'Type', 'ResourceType'];

                        let hoverText = '';
                        // Add fields in preferred order
                        for (const field of preferredOrder) {
                            if (info.hasOwnProperty(field) && info[field] !== "") {
                                hoverText += `**${field} :** ${info[field]}\n\n`;
                            }
                        }

                        // Add any remaining fields not in the preferred order
                        for (const field in info) {
                            if (!preferredOrder.includes(field) && info.hasOwnProperty(field) && info[field] !== "") {
                                hoverText += `**${field} :** ${info[field]}\n\n`;
                            }
                        }
                        return new vscode.Hover(hoverText);
                    }
                }
            }

            return null;
        }
    });

    // Create decoration type
    decorationType = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline',
    });

    // Register an event listener for when the active text editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDecorations(editor);
        }
    });

    // Initially update decorations when the extension is activated
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        updateDecorations(editor);
    }

    // Add subscriptions to context
    context.subscriptions.push(hoverProvider);
}

/**
 * Loads the index from the JSON file.
 */
function loadIndex() {
    const filePath = path.join(__dirname, 'SD_DUMP.json');

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        index = data;
    } catch (error) {
        console.error('Error reading data file:', error);
    }
}

/**
 * Update decorations for the active text editor.
 * @param {vscode.TextEditor} editor The active text editor.
 */
function updateDecorations(editor) {
    const decorations = [];
    const document = editor.document;

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        const guidMatches = line.text.matchAll(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g);

        if (guidMatches) {
            for (const match of guidMatches) {
                const guid = match[0];
                if (guid && index[guid]) {
                    // Add decoration for matched GUID text
                    const startIndex = match.index;
                    const endIndex = startIndex + guid.length;
                    decorations.push({
                        range: new vscode.Range(lineIndex, startIndex, lineIndex, endIndex),
                    });
                }
            }
        }
    }

    // Set decorations for the active editor
    editor.setDecorations(decorationType, decorations);
}

// Idk wtf this is but guide had it
function deactivate() { }

module.exports = {
    activate,
    deactivate
};
