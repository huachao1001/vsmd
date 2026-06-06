function initHighlight() {
  var codeBlocks = document.querySelectorAll('pre code');
  console.log('[VSMD] Highlighting code blocks, count:', codeBlocks.length);
  console.log('[VSMD] hljs available:', typeof window.hljs);

  var MAX_BLOCKS = 100;
  var MAX_TIME = 5000;
  var startTime = Date.now();

  if (window.hljs) {
    try {
      var processedCount = 0;
      codeBlocks.forEach(function(block, index) {
        if (processedCount >= MAX_BLOCKS) {
          console.log('[VSMD] Max blocks reached, skipping rest');
          return;
        }
        if (Date.now() - startTime > MAX_TIME) {
          console.log('[VSMD] Max time reached, skipping rest');
          return;
        }

        var langMatch = block.className.match(/language-(\w+)/);
        var lang = langMatch ? langMatch[1] : '';

        if (!lang || lang === '-') {
          lang = 'bash';
          block.className = 'language-bash';
        }

        var pre = block.parentNode;
        var wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        var copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.textContent = '复制';
        copyBtn.onclick = function() {
          var code = block.textContent || '';
          navigator.clipboard.writeText(code).then(function() {
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            setTimeout(function() {
              copyBtn.textContent = '复制';
              copyBtn.classList.remove('copied');
            }, 2000);
          }).catch(function(err) {
            console.error('[VSMD] Copy failed:', err);
            copyBtn.textContent = '失败';
          });
        };
        wrapper.appendChild(copyBtn);

        if (window.hljs.getLanguage(lang)) {
          try {
            window.hljs.highlightElement(block);
            console.log('[VSMD] Block', index, 'highlighted with', lang);
          } catch (e) {
            console.error('[VSMD] highlightElement error for', lang, ':', e.message);
            block.classList.add('hljs');
          }
        } else {
          block.classList.add('hljs');
          console.log('[VSMD] Block', index, 'language not supported:', lang);
        }
        processedCount++;
      });
      console.log('[VSMD] Code highlighting complete, processed:', processedCount);
    } catch (e) {
      console.error('[VSMD] highlight error:', e.message);
    }
  } else {
    console.log('[VSMD] hljs not loaded yet');
  }
}
