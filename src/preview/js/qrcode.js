function initQrcode() {
  function showQrcode() {
    document.getElementById('qrcode-overlay').classList.add('show');
    console.log('[VSMD] QRCode overlay shown');
  }
  
  function hideQrcode() {
    document.getElementById('qrcode-overlay').classList.remove('show');
    console.log('[VSMD] QRCode overlay hidden');
  }
  
  document.getElementById('btn-qrcode').addEventListener('click', showQrcode);
  document.getElementById('close-qrcode').addEventListener('click', hideQrcode);
  document.getElementById('qrcode-overlay').addEventListener('click', function(e) {
    if (e.target === this) hideQrcode();
  });
}
