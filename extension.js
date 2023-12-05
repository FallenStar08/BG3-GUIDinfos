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
                    const tagInfo = lookupTagInfoForGUID(guid);
                    //console.log('Tag Info for GUID:', tagInfo);  // Log the tag info

                    if (tagInfo) {
                        const name = tagInfo.Name;
                        const description = tagInfo.Description;

                        let hoverText = `**Name :** ${name}`;
                        if (description) {
                            hoverText += `\n\n**Description:** ${description}`;
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

function lookupTagInfoForGUID(guid) {
    const tagsFilePath = path.join(__dirname, 'AllTags.json');

    try {
        const tagsData = JSON.parse(fs.readFileSync(tagsFilePath, 'utf8'));

        // Search for the GUID in the tags data...
        for (const tagName in tagsData) {
            if (tagsData.hasOwnProperty(tagName)) {
                const tagInfo = tagsData[tagName];
                if (tagInfo.UUID === guid) {
                    // Return the tag information corresponding to the GUID...
                    return {
                        Name: tagName,
                        Description: tagInfo.Description
                    };
                }
            }
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