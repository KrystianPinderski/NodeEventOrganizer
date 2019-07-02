const controller = require('../controllers/login');
const bcrypt = require('bcrypt');
module.exports = (router) => {
    router.route('/login')
      .post(controller.login)
};