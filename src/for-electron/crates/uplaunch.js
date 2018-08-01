const { spawn } = require('child_process');
// const { exec } = require('child_process');

const fs = require('fs');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

function uplaunch(exe_path) {
  const child = spawn('cscript.exe', [exe_path + '/uplaunch.vbs'], {
    detached: true,
    stdio: ['ignore', out, err],
  });
  child.unref();

  return child;
}

exports.uplaunch = uplaunch;
