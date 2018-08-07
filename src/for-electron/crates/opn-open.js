const path = require('path');
const childProcess = require('child_process');
const isWsl = require('is-wsl');

module.exports = (target, opts) => {
  if (typeof target !== 'string') {
    return Promise.reject(new Error('Expected a `target`'));
  }

  opts = Object.assign({ wait: true }, opts);

  let cmd;
  let appArgs = [];
  let args = [];
  const cpOpts = {};

  if (Array.isArray(opts.app)) {
    appArgs = opts.app.slice(1);
    opts.app = opts.app[0];
  }

  if (process.platform === 'win32' || isWsl) {
    cmd = 'cmd' + (isWsl ? '.exe' : '');
    args.push('/c', 'start', '""', '/b');
    if (!cmd.indexOf('exe')) {
      target = target.replace(/&/g, '^&');
    }

    if (opts.wait) {
      args.push('/wait');
    }

    if (opts.app) {
      args.push(opts.app);
    }

    if (appArgs.length > 0) {
      args = args.concat(appArgs);
    }
  }

  args.push(target);

  const cp = childProcess.spawn(cmd, args, cpOpts);

  if (opts.wait) {
    return new Promise((resolve, reject) => {
      cp.once('error', reject);

      cp.once('close', code => {
        if (code > 0) {
          reject(new Error('Exited with code ' + code));
          return;
        }

        resolve(cp);
      });
    });
  }

  cp.unref();

  return Promise.resolve(cp);
};
