function initMobile() {
  var isMobileMode = false;

  function toggleMobile() {
    isMobileMode = !isMobileMode;
    var content = document.querySelector('.vsmd-content');
    if (isMobileMode) {
      content.classList.add('mobile');
      document.getElementById('btn-mobile').classList.add('active');
    } else {
      content.classList.remove('mobile');
      document.getElementById('btn-mobile').classList.remove('active');
    }
    console.log('[VSMD] Mobile mode toggled, isMobile:', isMobileMode);
    
    if (window.vsmd.vscode) {
      window.vsmd.vscode.postMessage({ type: 'mobileModeChanged', isMobile: isMobileMode });
    }
  }

  document.getElementById('btn-mobile').addEventListener('click', toggleMobile);
}
