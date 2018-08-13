const Progress = require('progress');
const request = require('request-promise');
const url = require('url');
const R = require('ramda');
const exitHook = require('exit-hook');
const fs = require('fs-extra');
const path = require('path');

const REMOTE_URL = 'https://www.gstatic.com/prettyearth/';

process.stderr.write('\x1B[?25l');
exitHook(() => process.stderr.write('\x1B[?25h'));

const bar = new Progress('[:bar] :percent', {
  total: 10000,
  complete: '#',
  clear: true,
});

// eslint-disable-next-line arrow-body-style
const reducer = (accumulator, current) => {
  return accumulator.then(() => request(url.resolve(REMOTE_URL, `${current}.json`))
    .then(JSON.parse)
    .then(({ dataUri }) => {
      const filename = path.resolve(__dirname, 'wallpapers', `${current}.jpg`);
      const data = dataUri.replace(/^data:image\/jpeg;base64,/, '');
      return fs.writeFile(filename, data, 'base64');
    })
    .catch((error) => { if (error.statusCode !== 404) throw new Error(error); })
    .catch((error) => { console.log(`${current} failed: ${error.statusCode}`); })
    .then(() => bar.tick()));
};

R.range(0, 10000).reduce(reducer, Promise.resolve());
