const vscode = require('vscode');
const path = require('path');
const fs = require('fs');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // it's a thingy that does things on hover, yes. We register it.
    let hoverProvider = vscode.languages.registerHoverProvider('*', {
        provideHover(document, position, token) {
            // Get the entire line at the current position
            const line = document.lineAt(position.line).text;

            // Cringe regex
            const guidMatch = line.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

            if (guidMatch) {
                const guid = guidMatch[0];

                //console.log('Hovered GUID:', guid);  // Log the GUID

                if (guid) {
                    const infoResult  = lookupInfoForGUID(guid);
                    //console.log('Tag Info for GUID:', tagInfo);  // Log the tag info

                    if (infoResult && infoResult.Info) {
                        const info = infoResult.Info;

                        const preferredOrder = ['Name', 'LocalizedName', 'Description', 'SlotName', 'Type'];

                        let hoverText = '';
                        for (const field of preferredOrder) {
                            if (info.hasOwnProperty(field)) {
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

    context.subscriptions.push(hoverProvider);
}

function lookupInfoForGUID(guid) {
    const FilePath = path.join(__dirname, 'AllDump.json');

    try {
        const Data = JSON.parse(fs.readFileSync(FilePath, 'utf8'));

        // Search for the GUID in the tags data...
        if (Data.hasOwnProperty(guid)) {
            const Info = Data[guid];
            
            // Return the tag information corresponding to the GUID
            return {
                Info
            };
        }

        return null;
    } catch (error) {
        console.error('Error reading tags file:', error);
        return null;
    }
}

// Idk wtf this is but guide had it
function deactivate() {}

module.exports = {
    activate,
    deactivate
};