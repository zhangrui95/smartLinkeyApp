const { spawn } = require('child_process');
const { exec } = require('child_process');

const fs = require('fs');
const out = fs.openSync('./out2.log', 'a');
const err = fs.openSync('./out2.log', 'a');

function upversion(latest_version) {
  let contentText = fs.readFileSync('./guid.txt', 'utf-8');
  contentText = contentText.replace(/[\r\n]/g, '');
  console.log(contentText);

  let cmd = '.\\bin\\update_version.exe ' + contentText + ' ' + latest_version;
  console.log(cmd);
  let child = exec(cmd);
  // const child = spawn(".\\bin\\update_version.exe", [contentText, latest_version], {'detached': true, stdio: [ 'ignore', out, err ]});
  // child.unref();

  child.on('exit', function(code, signal) {
    console.log('update_version exited with ' + `code ${code} and signal ${signal}`);
    if (code === 0) {
      console.log('update version success');
    }
  });
}

exports.upversion = upversion;
