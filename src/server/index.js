const {app: server} = require('./js/server');

const PORT = 8080;
server.listen(PORT, function() {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Server working dir is '${__dirname}'`);
  // Note(!): env is prepared by the server module.
  // TODO: Check for relevant API keys here. Don't echo!
});
