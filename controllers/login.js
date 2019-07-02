const mongoose = require('mongoose');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const connUri = process.env.MONGO_LOCAL_CONN_URL;
const jwt = require('jsonwebtoken');
module.exports = {
  login: (req, res) => {
    const { name, password } = req.body;
    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      let result = {};
      let status = 200;
      if (!err) {
        User.findOne({ name }, (err, user) => {
          if (!err && user) {
            // We could compare passwords in our model instead of below as well
            bcrypt.compare(password, user.password).then(match => {
              if (match) {
                status = 200;
                // Create a token
                const payload = { user: user.name, type: user.type };
                const options = { expiresIn: '2d', issuer: 'http://localhost:3000/' };
                const secret = process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, options);
                result.token = token;
                result.status = status;
                result.result = user;
                result.result.token = token;
              } else {
                status = 401;
                result.status = status;
                result.error = `Authentication error`;
              }
              res.status(status).send(result);
            }).catch(err => {
              status = 500;
              result.status = status;
              result.error = err;
              res.status(status).send(result);
            });
          } else {
            status = 404;
            result.status = status;
            result.error = err;
            res.status(status).send(result);
          }
        });
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
    }, mongoose.disconnect());
  }
}