(function () {
  var COPY_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>';
  var CHECK_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>';

  function flash(btn) {
    btn.classList.add('copied');
    btn.innerHTML = CHECK_ICON;
    setTimeout(function () {
      btn.classList.remove('copied');
      btn.innerHTML = COPY_ICON;
    }, 1200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); resolve(); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  }

  function addButtons() {
    var pres = document.querySelectorAll('.markdown-body pre');
    for (var i = 0; i < pres.length; i++) {
      (function (pre) {
        if (pre.querySelector('.vsmd-copy-btn')) return;
        var code = pre.querySelector('code');
        if (!code) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vsmd-copy-btn';
        btn.setAttribute('aria-label', '复制代码');
        btn.title = '复制代码';
        btn.innerHTML = COPY_ICON;
        btn.addEventListener('click', function () {
          copyText(code.innerText.replace(/\u00a0/g, ' ')).then(
            function () { flash(btn); },
            function () { flash(btn); }
          );
        });
        pre.appendChild(btn);
      })(pres[i]);
    }
  }

  function init() {
    addButtons();
    var target = document.querySelector('.markdown-body') || document.body;
    var observer = new MutationObserver(function () { addButtons(); });
    observer.observe(target, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
