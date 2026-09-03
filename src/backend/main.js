const vscode = require('vscode');

function activate(context) {
    const disposable = vscode.commands.registerCommand('vsmd.togglePreview', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        vscode.commands.executeCommand('markdown.showPreviewToSide', editor.document.uri);
    });
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
