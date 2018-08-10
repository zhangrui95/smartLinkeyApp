const { ipcRenderer } = require('electron');

setInterval(() => {
  console.log('+1s');
}, 1000);

function send_event(cid) {
  console.log(cid);
  ipcRenderer.send('huaci-choice', cid);
  document.getElementById('app').className = 'animated bounceOut';
  setTimeout(() => {
    window.close();
  }, 1000);
}

ipcRenderer.on('please-close', () => {
  console.log('main tell me close');
  window.close();
});
