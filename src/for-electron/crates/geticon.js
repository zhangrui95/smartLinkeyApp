const child_process = require('child_process');
const _ = require('lodash');
const iconProcess = child_process.spawn('./IconExtractor.exe', ['-x']);

// setInterval(() => {
//   var json = JSON.stringify({context: 'SomeContextLikeAName', path: 'C:/Users/Public/Desktop/Google Chrome.lnk'}) + "\n";
//   iconProcess.stdin.write(json);
// }, 3000);

var iconDataBuffer = '';

iconProcess.stdout.on('data', function(data) {
  var str = new Buffer(data, 'utf8').toString('utf8');

  iconDataBuffer += str;

  //Bail if we don't have a complete string to parse yet.
  if (!_.endsWith(str, '\n')) {
    return;
  }

  //We might get more than one in the return, so we need to split that too.
  _.each(iconDataBuffer.split('\n'), function(buf) {
    if (!buf || buf.length == 0) {
      return;
    }

    try {
      // console.log(buf);
      let data = JSON.parse(buf);
      let mainWindow = require('electron').BrowserWindow.fromId(1);
      mainWindow.webContents.send('tool-icon', data.Base64ImageData);
    } catch (ex) {
      console.log(ex);
    }
  });
});

exports.iconProcess = iconProcess;
