(function() {
  var vscode = window.acquireVsCodeApi ? acquireVsCodeApi() : null;
  window.vscode = vscode;

  var t_webview_start = Date.now();

  console.log('[VSMD] Webview script start, DOMContentLoaded:', document.readyState);

  // 主题相关变量
  var userThemeOverride = false;

  // 监听来自extension的主题设置消息
  window.addEventListener('message', function(event) {
    var message = event.data;
    if (message && message.type === 'setTheme') {
      if (!userThemeOverride) {
        setDarkMode(message.isDark);
      }
    }
  });

  function setDarkMode(isDark) {
    var container = document.querySelector('.vsmd-container');
    if (!container) {
      console.log('[VSMD] setDarkMode: container not found');
      return;
    }
    
    // 注入主题CSS
    var styleId = 'vsmd-theme-override';
    var existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();
    
    var themeCss = isDark ? window.__themeDarkCss : window.__themeLightCss;
    var styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = themeCss;
    document.body.appendChild(styleEl);
    
    // 设置类名
    document.documentElement.classList.remove('vsmd-preview-dark', 'vsmd-preview-light');
    if (isDark) {
      document.documentElement.classList.add('vsmd-preview-dark');
    } else {
      document.documentElement.classList.add('vsmd-preview-light');
    }
    
    // 直接用style属性设置scrollbar-color
    if (isDark) {
      document.documentElement.style.setProperty('scrollbar-color', '#555 #252526', 'important');
      document.body.style.setProperty('scrollbar-color', '#555 #252526', 'important');
    } else {
      document.documentElement.style.setProperty('scrollbar-color', '#888 #f5f5f5', 'important');
      document.body.style.setProperty('scrollbar-color', '#888 #f5f5f5', 'important');
    }
    
    // Swap hljs theme
    var hljsStyle = document.getElementById('hljs-themed-style');
    if (hljsStyle && window.__hljsLightCss && window.__hljsDarkCss) {
      var newStyle = hljsStyle.cloneNode(false);
      newStyle.textContent = isDark ? window.__hljsDarkCss : window.__hljsLightCss;
      hljsStyle.replaceWith(newStyle);
    }
  }

  // 初始化
  function init() {
    var t1 = Date.now();
    console.log('[VSMD] init() start, elapsed since script start:', t1 - t_webview_start, 'ms');

    initMobile();
    var t2 = Date.now();
    console.log('[VSMD] initMobile:', t2 - t1, 'ms');

    initClose();
    var t3 = Date.now();
    console.log('[VSMD] initClose:', t3 - t2, 'ms');

    initHighlight();
    var t4 = Date.now();
    console.log('[VSMD] initHighlight:', t4 - t3, 'ms');

    initThemeToggle();
    var t5 = Date.now();
    console.log('[VSMD] initThemeToggle:', t5 - t4, 'ms');

    // 请求当前VSCode主题
    if (vscode) {
      vscode.postMessage({ type: 'getTheme' });
    }

    console.log('[VSMD] Preview ready, total init time:', t5 - t_webview_start, 'ms');
  }

  function initThemeToggle() {
    
    document.getElementById('btn-theme').addEventListener('click', function() {
      document.getElementById('theme-overlay').classList.add('show');
      populateThemeList();
    });
    
    document.getElementById('close-theme').addEventListener('click', function() {
      document.getElementById('theme-overlay').classList.remove('show');
    });
    
    document.getElementById('theme-overlay').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
      }
    });
  }
  
  function populateThemeList() {
    var currentTheme = document.querySelector('.vsmd-container').getAttribute('data-theme') || 'default';
    var isCustomTheme = currentTheme.startsWith('custom:');
    
    var modeList = document.getElementById('theme-mode-list');
    var marketSection = document.getElementById('theme-market-section');
    var marketList = document.getElementById('theme-market-list');
    
    modeList.innerHTML = '';
    marketList.innerHTML = '';
    
    var modes = [
      { id: 'default', name: '跟随系统' },
      { id: 'light', name: '浅色模式' },
      { id: 'dark', name: '深色模式' }
    ];
    
    var activeMode = isCustomTheme ? 'default' : currentTheme;
    
    modes.forEach(function(mode) {
      var item = document.createElement('div');
      item.className = 'vsmd-theme-radio-item' + (mode.id === activeMode ? ' active' : '');
      item.setAttribute('data-theme-id', mode.id);
      item.innerHTML = '<input type="radio" name="theme-mode"' + (mode.id === activeMode ? ' checked' : '') + '>' +
                       '<span class="theme-name">' + mode.name + '</span>';
      item.addEventListener('click', function() {
        if (mode.id === 'default') {
          userThemeOverride = false;
          vscode.postMessage({ type: 'getTheme' });
        } else {
          userThemeOverride = true;
          setDarkMode(mode.id === 'dark');
        }
        setTheme(mode.id);
        document.getElementById('theme-overlay').classList.remove('show');
      });
      modeList.appendChild(item);
    });
    
    if (window.__themes && window.__themes.length > 0) {
      marketSection.style.display = 'block';
      
      var defaultItem = document.createElement('div');
      defaultItem.className = 'vsmd-theme-market-item' + (isCustomTheme ? '' : ' active');
      defaultItem.setAttribute('data-theme-id', 'market-default');
      defaultItem.innerHTML = '<span class="theme-name">默认主题</span>';
      defaultItem.addEventListener('click', function() {
        removeCustomThemeStyle();
        setTheme('default');
        populateThemeList();
        document.getElementById('theme-overlay').classList.remove('show');
      });
      marketList.appendChild(defaultItem);
      
      window.__themes.forEach(function(theme) {
        var item = document.createElement('div');
        var themeId = 'custom:' + theme.name;
        item.className = 'vsmd-theme-market-item' + (currentTheme === themeId ? ' active' : '');
        item.setAttribute('data-theme-id', themeId);
        item.innerHTML = '<span class="theme-name">' + theme.name + '</span>';
        item.addEventListener('click', function() {
          userThemeOverride = true;
          applyCustomTheme(theme.name);
          setTheme(themeId);
          populateThemeList();
          document.getElementById('theme-overlay').classList.remove('show');
        });
        marketList.appendChild(item);
      });
    } else {
      marketSection.style.display = 'none';
    }
  }
  
  function setTheme(themeId) {
    var container = document.querySelector('.vsmd-container');
    container.setAttribute('data-theme', themeId);
    
    if (themeId === 'default') {
      userThemeOverride = false;
      vscode.postMessage({ type: 'getTheme' });
      removeCustomThemeStyle();
    } else if (themeId === 'light' || themeId === 'dark') {
      userThemeOverride = true;
      setDarkMode(themeId === 'dark');
      removeCustomThemeStyle();
    }
  }
  
  function applyCustomTheme(themeName) {
    var styleId = 'vsmd-custom-theme';
    var existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();
    
    if (!window.__themes) return;
    
    for (var i = 0; i < window.__themes.length; i++) {
      if (window.__themes[i].name === themeName && window.__themes[i].cssContent) {
        var styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = window.__themes[i].cssContent;
        document.body.appendChild(styleEl);
        break;
      }
    }
  }
  
  function removeCustomThemeStyle() {
    var style = document.getElementById('vsmd-custom-theme');
    if (style) style.remove();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
