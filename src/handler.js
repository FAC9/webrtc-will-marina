const directory = require('./directory');
const { home, publicFiles, poll } = require('./routes.js');

const handler = (req, res) => {
  let urlDir = req.url.split('/')[0];
  if(req.url === '/') {
    home(req, res);
  }
  else if (urlDir === 'poll'){
    poll(req, res);
  }
  else {
    publicFiles(req, res);
  }
}
module.exports = handler;
