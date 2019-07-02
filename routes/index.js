const users = require('./users');
const login = require('./login');
const event = require('./event');
module.exports = (router) => {
  users(router);
  login(router);
  event(router);
  return router;
};