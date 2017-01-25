const directory = require('./directory');
const { home, publicFiles, poll, send } = require('./routes.js');

const handler = (req, res) => {
  let urlDir = req.url.split('/')[1];
  console.log('urldir ', urlDir, ' req ', req.url);
  if(req.url === '/') {
    home(req, res);
  }
  else if (urlDir === 'poll'){
    poll(req, res);
  }
  else if (urlDir === 'send'){
    send(req, res);
  }
  else {
    publicFiles(req, res);
  }
}

module.exports = handler;
