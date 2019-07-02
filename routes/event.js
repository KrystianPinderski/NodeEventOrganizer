const controller = require('../controllers/event');
const validateToken = require('../utils').validateToken;
module.exports = (router) => {
  router.route('/Event')
    .post(controller.add)
    .get(validateToken, controller.getAll)
    .delete(controller.deleteMatching)
    .put(controller.updateEvent)
};