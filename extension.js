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

                //console.log('Hovered GUID:', guid);  // Log GUID

                if (guid) {
                    const infoResult  = lookupInfoForGUID(guid);
                    //console.log('Tag Info for GUID:', tagInfo);  // Log info

                    if (infoResult && infoResult.Info) {
                        const info = infoResult.Info;
                        //stupid shit but good enough for now
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



/**
 * Looks up information for a given GUID.
 *
 * @param {string} guid - The GUID to look up information for.
 * @returns {Object|null} Returns an object containing information for the given GUID, or null if the GUID is not found or an error occurs.
 * @throws {Error} Throws an error if there is an issue reading the data file.
 */
function lookupInfoForGUID(guid) {
    const FilePath = path.join(__dirname, 'AllDump.json');

    try {
        const Data = JSON.parse(fs.readFileSync(FilePath, 'utf8'));

        // Search for the GUID in the data...
        if (Data.hasOwnProperty(guid)) {
            const Info = Data[guid];
            
            // Return information corresponding to the GUID
            return {
                Info
            };
        }
        return null;
        //pretend it's complex enough to have errors to catch
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