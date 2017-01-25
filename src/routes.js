const fs = require('fs');
const path = require('path');
const directory = require('./directory')

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

const poll = (req, res) => {
  let userId = req.url.split('/')[1];
  if (!directory[userId]) {
    directory[userId] = {
      messages: []
    }
  }
  let data = JSON.stringify({
    directory: Object.keys(directory),
    messages: directory[userId].messages
  })
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(data);
}

module.exports = { home, publicFiles, poll }
