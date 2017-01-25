const directory = require('./directory');
const { home, publicFiles } = require('./routes.js');

const handler = (req, res) => {
  if(req.url === '/') {
    home(req, res);
  } else {
    publicFiles(req, res);
  }
}
module.exports = handler;
