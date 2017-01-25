const https = require('https');
const fs = require('fs');
const handler = require('./src/handler.js');
const port = process.env.PORT || 3000;

const options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
}

const server = https.createServer(options, handler);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
