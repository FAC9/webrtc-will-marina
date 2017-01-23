const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
}
const port = process.env.PORT || 3000;

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("hello world\n");
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
