const fs = require('fs');
const path = require('path');

const home = (req, res) => {
  let filepath = path.join(__dirname, '..', 'public', 'index.html');
  fs.readFile(filepath, (err, data) => {
    if (err) console.log(err);
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(data);
  });
}

const publicFiles = (req, res) => {
  let filepath = path.join(__dirname, '..', 'public', req.url);
  let extension = req.url.split('.')[1];
  fs.readFile(filepath, (err, data) => {
    if (err) console.log(err);
    res.writeHead(200, {'content-type': 'text/' + extension});
    res.end(data);
  });
}

module.exports = { home, publicFiles }
