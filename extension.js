const vscode = require('vscode');
const { registerCommands, restorePreview } = require('./src/commands/previewCommand');
const { logger } = require('./src/utils/logger');

function activate(context) {
    logger.log('activate() called');
    try {
        logger.log('Activating extension');
        registerCommands(context);
        logger.log('Commands registered');

        logger.log('Extension activated successfully');
    } catch (e) {
        logger.error('Activation error:', e.message, e.stack);
    }
}

module.exports = { activate };
