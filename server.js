const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
}
const port = process.env.PORT || 3000;

const handler = (req, res) => {
  let extension = req.url.split('.')[1] || "html";
  let headers = {'content-type': 'text/' + extension};
  res.writeHead(200, headers);

  if(req.url === '/') {
    let filepath = path.join(__dirname, 'public', 'index.html');
    console.log(req.url, filepath);
    fs.readFile(filepath, (err, data) => {
      if (err) throw err;
      res.end(data);
    });
  } else {
    let filepath = path.join(__dirname, 'public', 'main.css');
    console.log(req.rul, filepath);
    fs.readFile(filepath, (err, data) => {
      if (err) throw err;
      res.end(data);
    });
  }
}

const server = https.createServer(options, handler);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
