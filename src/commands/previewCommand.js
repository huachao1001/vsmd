const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { getHtml } = require('../preview/webviewHtml');
const { logger } = require('../utils/logger');

logger.log('Extension loaded');

async function fetchExternalCss(url) {
    if (!url) {
        return '';
    }
    
    if (url.startsWith('https://')) {
        return new Promise((resolve) => {
            https.get(url, (res) => {
                if (res.statusCode !== 200) {
                    logger.warn('Failed to fetch external CSS:', res.statusCode, url);
                    resolve('');
                    return;
                }
                
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', (err) => {
                logger.warn('Error fetching external CSS:', err.message);
                resolve('');
            });
        });
    }
    
    if (fs.existsSync(url)) {
        try {
            return fs.readFileSync(url, 'utf8');
        } catch (e) {
            logger.warn('Failed to read local CSS file:', url, e.message);
            return '';
        }
    }
    
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (workspaceRoot) {
        const fullPath = path.join(workspaceRoot, url);
        if (fs.existsSync(fullPath)) {
            try {
                return fs.readFileSync(fullPath, 'utf8');
            } catch (e) {
                logger.warn('Failed to read local CSS file:', fullPath, e.message);
            }
        }
    }
    
    return '';
}

function debugLog(msg) {
    const logFile = path.join(__dirname, '..', '..', 'vsmd-debug.log');
    const timestamp = new Date().toISOString();
    const logMsg = '[' + timestamp + '] ' + msg + '\n';
    try {
        fs.appendFileSync(logFile, logMsg);
    } catch (e) {
        // ignore
    }
}

function clearDebugLog() {
    const logFile = path.join(__dirname, '..', '..', 'vsmd-debug.log');
    try {
        fs.writeFileSync(logFile, '');
    } catch (e) {
        // ignore
    }
}

async function getThemesInfo() {
    clearDebugLog();
    debugLog('[getThemesInfo] Starting...');
    
    const config = vscode.workspace.getConfiguration('vsmd');
    const configuredDir = config.get('themesDirectory', '');
    
    let themesDir = configuredDir || getDefaultThemesDir();
    debugLog('[getThemesInfo] Using themesDir: ' + themesDir);
    
    if (!fs.existsSync(themesDir)) {
        debugLog('[getThemesInfo] Directory does not exist, creating with defaults...');
        createDefaultThemes(themesDir);
    }
    
    let resolvedPath = themesDir;
    
    if (!path.isAbsolute(themesDir)) {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (workspaceRoot) {
            resolvedPath = path.join(workspaceRoot, themesDir);
        } else {
            debugLog('[getThemesInfo] Relative path but no workspace');
            return [];
        }
    }
    
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
        debugLog('[getThemesInfo] Path invalid');
        return [];
    }
    
    try {
        const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });
        const themeDirs = entries.filter(e => e.isDirectory());
        
        debugLog('[getThemesInfo] Subdirs: ' + themeDirs.map(e => e.name).join(', '));
        
        const themes = [];
        for (const entry of themeDirs) {
            const themePath = path.join(resolvedPath, entry.name);
            const mainCss = path.join(themePath, 'theme.css');
            
            if (fs.existsSync(mainCss)) {
                themes.push({
                    name: entry.name,
                    path: themePath,
                    cssPath: mainCss
                });
            }
        }
        
        debugLog('[getThemesInfo] Themes found: ' + themes.length);
        return themes;
    } catch (e) {
        debugLog('[getThemesInfo] Error: ' + e.message);
        return [];
    }
}

function createDefaultThemes(themesDir) {
    try {
        fs.mkdirSync(themesDir, { recursive: true });
        
        const defaultThemes = {
            'dark-elegant': `.vsmd-content-inner h1 {
  font-size: 2rem;
  border-bottom: 2px solid #569cd6;
  padding-bottom: 0.3em;
}
.vsmd-content-inner h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #3c3c3c;
}
.vsmd-content-inner h3 { color: #569cd6; }
.vsmd-content-inner pre {
  background-color: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
}
.vsmd-content-inner :not(pre) > code {
  background-color: #2d2d2d;
  color: #ce9178;
  padding: 2px 6px;
  border-radius: 4px;
}
.vsmd-content-inner blockquote {
  border-left: 4px solid #569cd6;
  background-color: #252526;
  padding: 10px 20px;
  color: #9cdcfe;
}
.vsmd-content-inner table, 
.vsmd-content-inner th, 
.vsmd-content-inner td { border: 1px solid #3c3c3c; }
.vsmd-content-inner th { background-color: #2d2d2d; color: #569cd6; }
.vsmd-content-inner a { color: #569cd6; }
.vsmd-content-inner hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #569cd6, transparent);
  margin: 2em 0;
}`,
            'github-style': `.vsmd-content-inner h1 { font-size: 1.75rem; border-bottom: 1px solid #d8e2f0; }
.vsmd-content-inner h2 { font-size: 1.5rem; border-bottom: 1px solid #e1e4e8; }
.vsmd-content-inner pre { background-color: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; }
.vsmd-content-inner :not(pre) > code {
  background-color: rgba(27, 31, 35, 0.05);
  color: #24292e;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
.vsmd-content-inner blockquote { border-left: 4px solid #dfe2e5; background-color: #f6f8fa; color: #6a737d; }
.vsmd-content-inner table, 
.vsmd-content-inner th, 
.vsmd-content-inner td { border: 1px solid #e1e4e8; }
.vsmd-content-inner th { background-color: #f6f8fa; font-weight: 600; }
.vsmd-content-inner a { color: #0366d6; }
.vsmd-content-inner hr { background-color: #e1e4e8; }`
        };
        
        for (const [name, css] of Object.entries(defaultThemes)) {
            const themePath = path.join(themesDir, name);
            fs.mkdirSync(themePath, { recursive: true });
            fs.writeFileSync(path.join(themePath, 'theme.css'), css);
            debugLog('[createDefaultThemes] Created theme: ' + name);
        }
        
        debugLog('[createDefaultThemes] Done, created ' + Object.keys(defaultThemes).length + ' themes');
    } catch (e) {
        debugLog('[createDefaultThemes] Error: ' + e.message);
    }
}

function getDefaultThemesDir() {
    const os = require('os');
    return path.join(os.homedir(), '.vsmd', 'themes');
}

function getThemesCss(themes) {
    for (const theme of themes) {
        try {
            const content = fs.readFileSync(theme.cssPath, 'utf8');
            theme.cssContent = content;
            debugLog('[getThemesCss] Loaded: ' + theme.name + ' (' + content.length + ' bytes)');
        } catch (e) {
            debugLog('[getThemesCss] Error: ' + e.message);
            theme.cssContent = '';
        }
    }
    return themes;
}

let panels = new Map();
let currentDocUri = null;
let changeListener = null;
let scrollInterval = null;
let lastEditorScrollTop = -1;
let themeDisposable = null;

function getPanelTypeId(filePath) {
    return 'vsmdPreview';
}

function createPreviewPanel(filePath) {
    const panelTypeId = getPanelTypeId(filePath);
    const panel = vscode.window.createWebviewPanel(
        panelTypeId,
        path.basename(filePath),
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
    );

    panel.webview.onDidReceiveMessage((message) => {
        logger.log('Webview message:', message.type, 'filePath:', filePath);

        if (message.type === 'log') {
            logger[message.level](message.message);
        } else if (message.type === 'closePreview') {
            const panelToClose = panels.get(filePath);
            if (panelToClose) {
                panelToClose.dispose();
                panels.delete(filePath);
            }
        } else if (message.type === 'getTheme') {
            const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
            panel.webview.postMessage({ type: 'setTheme', isDark: isDark });
            logger.log('Sent initial theme, isDark:', isDark);
        }
    });

    return panel;
}

async function updatePreview(context, panel, editor, filePath) {
    if (!panel || !editor) return;

    const t0 = Date.now();
    logger.log('Updating preview for:', filePath);

    const content = editor.document.getText();
    const { renderMarkdown } = require('../renderer/markedSetup');

    const t1 = Date.now();

    let htmlContent = renderMarkdown(content);

    const t2 = logger.timing('updatePreview renderMarkdown', t1);

    htmlContent = convertImgPaths(panel, htmlContent, filePath);

    const t3 = logger.timing('updatePreview convertImgPaths', t2);
    
    const themes = await getThemesInfo();
    debugLog('[updatePreview] themes found: ' + JSON.stringify(themes.map(t => t.name)));
    const themesWithCss = getThemesCss(themes);

    panel.webview.html = getHtml(htmlContent, { themes: themesWithCss });

    const t4 = logger.timing('updatePreview set webview.html', t3);
    logger.info('updatePreview total', t4 - t0, 'ms');
}

function convertImgPaths(panel, htmlContent, filePath) {
    if (!panel) return htmlContent;

    return htmlContent.replace(/<img\s+src=["']([^"']+)["']/gi, (match, src) => {
        if (src.startsWith('http://') || src.startsWith('https://')) {
            return match;
        }

        const docDir = filePath ? path.dirname(filePath) : '';

        let imgPath;
        if (src.startsWith('/') || src.match(/^[a-zA-Z]:/)) {
            imgPath = src;
        } else {
            imgPath = path.join(docDir, src);
        }

        try {
            const imgUri = vscode.Uri.file(imgPath);
            const webviewUri = panel.webview.asWebviewUri(imgUri);
            return `<img src="${webviewUri}"`;
        } catch (e) {
            return match;
        }
    });
}

function parseHeadings(content) {
    const lines = content.split('\n');
    const headings = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^(#{1,6})\s+(.+)/);
        if (match) {
            headings.push({
                level: match[1].length,
                text: match[2].trim(),
                line: i
            });
        }
    }
    
    return headings;
}

function syncScroll(panel, content) {
    if (!panel || !panel.webview) return;
    
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const scrollTop = editor.scrollTop;
    if (scrollTop === lastEditorScrollTop) return;
    lastEditorScrollTop = scrollTop;
    
    const scrollHeight = editor.getScrollHeight();
    const clientHeight = editor.getClientHeight();
    
    if (scrollHeight <= clientHeight) return;
    
    const cursorLine = editor.selection.active.line;
    const totalLines = content.split('\n').length;
    const headings = parseHeadings(content);
    
    let targetPercent = 0;
    
    if (headings.length > 0) {
        let currentHeadingIndex = 0;
        for (let i = 0; i < headings.length; i++) {
            if (headings[i].line <= cursorLine) {
                currentHeadingIndex = i;
            } else {
                break;
            }
        }
        
        const headingLine = headings[currentHeadingIndex].line;
        const nextHeadingLine = headings[currentHeadingIndex + 1] 
            ? headings[currentHeadingIndex + 1].line 
            : totalLines - 1;
        
        const positionInSection = (cursorLine - headingLine) / Math.max(1, nextHeadingLine - headingLine);
        const headingPercent = currentHeadingIndex / Math.max(1, headings.length - 1);
        const nextHeadingPercent = headings[currentHeadingIndex + 1] 
            ? (currentHeadingIndex + 1) / (headings.length - 1) 
            : 1;
        
        targetPercent = headingPercent + (nextHeadingPercent - headingPercent) * positionInSection;
    } else {
        targetPercent = scrollTop / (scrollHeight - clientHeight);
    }
    
    targetPercent = Math.min(1, Math.max(0, targetPercent));
    
    const jsCode = `(function() {
        var content = document.getElementById('preview-body');
        if (content) {
            var maxScroll = content.scrollHeight - content.clientHeight;
            content.scrollTop = maxScroll * ${targetPercent.toFixed(4)};
        }
    })();`;
    
    panel.webview.executeJavaScript(jsCode);
}

function startScrollSync(filePath) {
    if (scrollInterval) {
        clearInterval(scrollInterval);
    }

    lastEditorScrollTop = -1;
    let scrollFilePath = filePath;

    logger.log('Scroll sync started for:', scrollFilePath);

    scrollInterval = setInterval(() => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const docUri = editor.document.uri.toString();
        if (docUri !== currentDocUri) return;

        const scrollTop = editor.scrollTop;
        if (scrollTop !== lastEditorScrollTop) {
            lastEditorScrollTop = scrollTop;
            const content = editor.document.getText();
            const panel = panels.get(scrollFilePath);
            if (panel) {
                syncScroll(panel, content);
            }
        }
    }, 50);
}

function stopScrollSync() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
}

async function showPreview(context) {
    logger.log('[showPreview] FUNCTION ENTRY');
    const editor = vscode.window.activeTextEditor;
    logger.log('[showPreview] START');
    logger.log('[showPreview] activeTextEditor:', editor?.document?.uri?.fsPath);
    logger.log('[showPreview] panels size:', panels.size);

    if (!editor) {
        logger.log('[showPreview] No active editor, returning');
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const filePath = editor.document.uri.fsPath;
    logger.log('[showPreview] filePath:', filePath);

    if (!filePath.endsWith('.md')) {
        logger.log('[showPreview] Not markdown file, returning');
        vscode.window.showInformationMessage('Only markdown files are supported');
        return;
    }

    const existingPanel = panels.get(filePath);
    if (existingPanel) {
        logger.log('[showPreview] Panel exists for same file, focusing');
        existingPanel.reveal();
        return;
    }

    const t0 = Date.now();
    logger.log('[showPreview] Creating new panel for:', filePath);

    const t1 = logger.timing('pre-createPreviewPanel', t0);

    const panel = createPreviewPanel(filePath);
    logger.log('[showPreview] Panel created');
    panels.set(filePath, panel);
    logger.log('[showPreview] Panels map updated, size:', panels.size);

    const t2 = logger.timing('createPreviewPanel', t1);

    const content = editor.document.getText();
    const { renderMarkdown } = require('../renderer/markedSetup');

    const t3 = logger.timing('require + getText', t2);

    let htmlContent = renderMarkdown(content);

    const t4 = logger.timing('renderMarkdown', t3);
    logger.info('renderMarkdown input length:', content.length, 'output length:', htmlContent.length);

    htmlContent = convertImgPaths(panel, htmlContent, filePath);

    const t5 = logger.timing('convertImgPaths', t4);
    
    const themes = await getThemesInfo();
    debugLog('[showPreview] themes found: ' + JSON.stringify(themes.map(t => t.name)));
    const themesWithCss = getThemesCss(themes);

    const html = getHtml(htmlContent, { themes: themesWithCss });

    const t6 = logger.timing('getHtml', t5);

    panel.webview.html = html;

    logger.log('[showPreview] Webview html set, panel.webview.html assigned');

    const t7 = logger.timing('set webview.html', t6);
    logger.info('TOTAL showPreview', t7 - t0, 'ms');

    disposeListeners();

    currentDocUri = editor.document.uri.toString();

    changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
        const panelForFile = panels.get(filePath);
        if (e.document.uri.toString() === currentDocUri && panelForFile) {
            const currentEditor = vscode.window.activeTextEditor;
            if (currentEditor) {
                updatePreview(context, panelForFile, currentEditor, filePath);
            }
        }
    });

    themeDisposable = vscode.window.onDidChangeActiveColorTheme(() => {
        panels.forEach((p) => {
            const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
            p.webview.postMessage({ type: 'setTheme', isDark: isDark });
        });
        logger.log('VSCode theme changed, broadcasting to all panels');
    });

    startScrollSync(filePath);

    panel.onDidDispose(() => {
        logger.log('[onDidDispose] Panel disposed for:', filePath);
        panels.delete(filePath);
        disposeListeners();
        stopScrollSync();
        if (themeDisposable) {
            themeDisposable.dispose();
            themeDisposable = null;
        }
    });

    logger.log('[showPreview] END, returning panel');
    return panel;
}

function togglePreview(context) {
    const t0 = Date.now();
    logger.log('Toggle preview clicked');

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const filePath = editor.document.uri.fsPath;

    if (filePath.endsWith('.md')) {
        const existingPanel = panels.get(filePath);
        if (existingPanel) {
            logger.log('Closing panel for:', filePath);
            existingPanel.dispose();
            panels.delete(filePath);
        } else {
            const t1 = Date.now();
            logger.log('Calling showPreview, delay:', t1 - t0, 'ms');
            showPreview(context);
        }
    } else {
        vscode.window.showInformationMessage('Only markdown files are supported');
    }
}

function disposeListeners() {
    if (changeListener) {
        changeListener.dispose();
        changeListener = null;
    }
}

function registerCommands(context) {
    const disposable = vscode.commands.registerCommand('vsmd.togglePreview', function () {
        togglePreview(context);
    });
    context.subscriptions.push(disposable);
}

module.exports = { registerCommands };
