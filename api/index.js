require('dotenv').config();
const { app, startServer } = require('../server');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await startServer();
    isConnected = true;
  }
  return app(req, res);
};
