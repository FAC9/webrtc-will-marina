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
  let userId = req.url.split('/')[2];
  console.log("Receiving polling request from ", userId);
  if (!directory[userId]) {
    directory[userId] = {
      messages: []
    }
  }
  let data = JSON.stringify({
    directory: Object.keys(directory),
    messages: directory[userId].messages
  })
  res.writeHead(200, {'content-type': 'application/json', 'Access-Control-Allow-Origin': '*'});
  res.end(data);
  directory[userId].messages.length = 0;
}

const send = (req, res) => {
  let from = req.url.split('/')[2];
  let to = req.url.split('/')[3];
  let body = "";
  req.on('data', (chunk) => {
    body += chunk;
  })
  req.on('end', (chunk) => {
    if (chunk) {
      body += chunk;
    }
    console.log("Receiving send request - send video from ", from, " to ", to);
    let recipient = directory[to];
    if (recipient) {
      console.log(body);
      recipient.messages.push({from, data: body});
      res.writeHead(200, {'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
      res.end("success");
    }
    else {
      res.writeHead(404, {'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
      res.end("Unknown destination");
    }
  })
}

module.exports = { home, publicFiles, poll, send }
