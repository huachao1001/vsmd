const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

const baseDir = __dirname;

const DEBUG = false;
const DEBUG_HTML_PATH = path.join(__dirname, '..', '..', 'vsmd-debug.html');

function safeRead(dir, file) {
    try {
        return fs.readFileSync(path.join(dir, file), 'utf8');
    } catch (e) {
        logger.error('Failed to read:', path.join(dir, file), e.message);
        return '/* Error reading file: ' + file + ' */';
    }
}

function saveDebugHtml(html) {
    if (!DEBUG) return;
    try {
        fs.writeFileSync(DEBUG_HTML_PATH, html, 'utf8');
    } catch (e) {
        // 静默失败
    }
}

function getCss() {
    const cssDir = path.join(baseDir, 'css');
    const mdModules = [
        '_md-heading.css',
        '_md-paragraph.css',
        '_md-code.css',
        '_md-blockquote.css',
        '_md-table.css',
        '_md-list.css',
        '_md-link.css',
        '_md-image.css',
        '_md-hr.css'
    ];
    
    const mdModulesCss = mdModules.map(f => '/* ' + f + ' */\n' + safeRead(cssDir, f)).join('\n');
    
    const files = [
        '_variables.css',
        '_base.css', 
        '_layout.css',
        '/* MD Content Modules */\n' + mdModulesCss,
        '_component.css'
    ];
    
    let css = files.map(f => {
        if (f.startsWith('/* ')) return f;
        return safeRead(cssDir, f);
    }).join('\n');
    
    return css;
}

function getThemeCss() {
    const themesDir = path.join(baseDir, 'css', 'themes', 'default');
    const lightCss = safeRead(themesDir, 'light.css');
    const darkCss = safeRead(themesDir, 'dark.css');
    return { light: lightCss, dark: darkCss };
}

function getJs() {
    const jsDir = path.join(baseDir, 'js');
    const hljsBrowser = safeRead(jsDir, 'hljs.browser.js');
    
    const hljsDir = path.join(baseDir, 'css', 'hljs');
    const hljsLightCss = safeRead(hljsDir, 'atom-one-light.css');
    const hljsDarkCss = safeRead(hljsDir, 'atom-one-dark.css');
    
    const themeCss = getThemeCss();
    
    const themeVars = 'window.__hljsLightCss=' + JSON.stringify(hljsLightCss) + 
                      ';window.__hljsDarkCss=' + JSON.stringify(hljsDarkCss) +
                      ';window.__themeLightCss=' + JSON.stringify(themeCss.light) +
                      ';window.__themeDarkCss=' + JSON.stringify(themeCss.dark) + ';';
    
    const files = [
        'main.js',
        'highlight.js',
        'mobile.js',
        'qrcode.js',
        'close.js'
    ];
    
    const otherJs = files.map(f => safeRead(jsDir, f)).join('\n\n');
    
    return hljsBrowser + '\n' + themeVars + '\n\n' + otherJs;
}

function loadSvg(name) {
    const svgPath = path.join(baseDir, 'svg', name + '.svg');
    try {
        let svg = fs.readFileSync(svgPath, 'utf8');
        svg = svg.replace(/<\?xml[^>]*\?>/, '').replace(/<!DOCTYPE[^>]*>/, '').trim();
        svg = '<svg class="icon" viewBox="0 0 1024 1024" width="20" height="20">' + 
              svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1] + 
              '</svg>';
        return svg;
    } catch (e) {
        logger.error('Failed to load SVG:', name, e.message);
        return '';
    }
}

function getHtml(content, options = {}) {
    const template = safeRead(baseDir, 'template.html');
    
    const hljsDir = path.join(baseDir, 'css', 'hljs');
    const hljsLightCss = safeRead(hljsDir, 'atom-one-light.css');
    
    const themes = options.themes || [];
    
    let result = template
        .replace('{{CSS}}', getCss())
        .replace('{{JS}}', getJs())
        .replace('{{SVG_THEME}}', loadSvg('theme'))
        .replace('{{SVG_PHONE}}', loadSvg('phone'))
        .replace('{{SVG_EXIT}}', loadSvg('exit'));
    
    result = result.replace('window.__hljsLightCss=', 
        'window.__themes=' + JSON.stringify(themes) + ';window.__hljsLightCss=');
    
    result = result.replace('</head>', '<style id="hljs-themed-style">\n' + hljsLightCss + '\n</style>\n</head>');
    
    result = result.replace('{{CONTENT}}', content);
    
    saveDebugHtml(result);
    
    return result;
}

module.exports = { getHtml };
