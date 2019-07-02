const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/users');

const connUri = process.env.MONGO_LOCAL_CONN_URL;

module.exports = {
  add: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, async (err) => {
      let result = {};
      let status = 201;
      const { name, password, type, adress, companyName, KRSNumber, NIPNumber, REGONNumber } = req.body;
      if (!err && req.body.type === "admin") {
        if ((KRSNumber && KRSNumber !== "")) {
          let baseURL = "https://api-v3.mojepanstwo.pl/"
          try {
            //TODO zmień na NIP 
            let requestAPI = await axios.create({
              baseURL
            }).post("dane/krs_podmioty.json?conditions[krs_podmioty.krs]=" + KRSNumber)
            if (requestAPI.data.Dataobject[0] != undefined) {
              let check = requestAPI.data.Dataobject[0].data['krs_podmioty.data_wyrejestrowania_przedsiebiorcy']
              if (check === null) {
                const user = new User({ name, password, type, adress, companyName, KRSNumber, NIPNumber, REGONNumber });
                user.save((err, user) => {
                  if (!err) {
                    result.status = status;
                    result.result = user.name;
                    result.message = "Success"
                  } else {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    result.message = "Something goes wrong with DB saving."
                  }
                  res.status(status).send(result);
                });
              }
            } else {
              status = 500;
              result.status = status;
              result.error = err;
              result.message = "Company not active/found."
              res.status(status).send(result);
            }
          } catch (err) {
            console.log(err)
          }
        } else {
          status = 500;
          result.status = status;
          result.error = err;
          result.message = "Admin requires KRSNumber"
          res.status(status).send(result);
        }
      } else if (!err && req.body.type === "user") {
        const { name, password, type } = req.body;
        const user = new User({ name, password, type });
        user.save((err, user) => {
          if (!err) {
            result.status = status;
            result.result = user.name;
            result.message = "Success"
          } else {
            status = 500;
            result.status = status;
            result.error = err;
            result.message = "Something goes wrong with DB saving."
          }
          res.status(status).send(result);
        });
      } else{
        status = 500;
        result.status = status;
        result.error = err;
        result.message = "Wrong type of user you sneaky boy."
        res.status(status).send(result);
      }
    }, mongoose.disconnect());
  },
  getAll: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      let result = {};
      let status = 200;
      if (!err) {
        const payload = req.decoded;
        if (payload && payload.type === 'superAdmin') {
          User.find({}, (err, users) => {
            if (!err) {
              result.status = status;
              result.error = err;
              result.result = users;
            } else {
              status = 500;
              result.status = status;
              result.error = err;
            }
            res.status(status).send(result);
          });
        } else {
          status = 401;
          result.status = status;
          result.error = `Authentication error`;
          res.status(status).send(result);
        }
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
    }, mongoose.disconnect());
  }
}
