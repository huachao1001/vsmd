function initClose() {
  function closePreview() {
    if (window.vscode) {
      window.vscode.postMessage({ type: 'closePreview' });
    }
    console.log('[VSMD] Close preview requested');
  }

  document.getElementById('btn-close').addEventListener('click', closePreview);
}
