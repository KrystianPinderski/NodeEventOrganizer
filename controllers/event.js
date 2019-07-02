const mongoose = require('mongoose');
const Event = require('../models/event');
const Users = require('../models/users');
const axios = require('axios');
const connUri = process.env.MONGO_LOCAL_CONN_URL;

module.exports = {
  add: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
      let result = {};
      let status = 201;
      if (!err) {
        const { title, date, organizer, city, street, lon, lat, description, tags, link } = req.body;
        const event = new Event({ title, date, organizer, city, street, lon, lat, description, tags, link });
        event.save((err, event) => {
          if (!err) {
            result.status = status;
            result.result = event;
            result.message = "Success"
          } else {
            status = 500;
            result.status = status;
            result.error = err;
          }
          res.status(status).send(result);
        });
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
    }, mongoose.disconnect());
  },
  getAll: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, async (err) => {
      let result = {};
      let status = 200;
      if (!err) {
        const payload = req.decoded;
        let userFind = false;
        await Users.find({ name: payload.user }, (err, users) => {
          if (!err) {
            if (users.length >= 1) {
              userFind = true;
            } else {
              status = 404;
              result.status = status;
              result.error = err;
              result.message = "Authentication fail."
              res.status(status).send(result);
            }
          } else {
            status = 500;
            result.status = status;
            result.error = err;
            result.message = "Error with DB.";
            res.status(status).send(result);
          }
        });
        if (userFind) {
          Event.find({}, (err, events) => {
            if (!err) {
              result.status = status;
              result.error = err;
              result.result = events;
            } else {
              status = 500;
              result.status = status;
              result.error = err;
            }
            res.status(status).send(result);
          });
        } else {
          status = 404;
          result.status = status;
          result.error = err;
          result.message = "Authentication fail."
          res.status(status).send(result);
        }
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
    }, mongoose.disconnect());
  },
  deleteMatching: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, async (err) => {
      let result = {};
      let status = 200;
      await Event.findById(req.body.id, (error, id) => {
        if (!error) {
          Event.deleteOne({ _id: id }, function (err) {
            if (!err) {
              result.status = status;
              result.message = "Success"
              res.status(status).send(result);
            } else {
              status = 500;
              result.status = status;
              result.message = ""
              result.error = err;
              res.status(status).send(result);
            }
          });
        } else {
          status = 404;
          result.status = status;
          result.message = "Id not found."
          result.error = error;
          res.status(status).send(result);
        }
      })
    }, mongoose.disconnect())
  },
  updateEvent: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true }, async (err) => {
      let result = {};
      let status = 200;
      let allChecked = false;
      if (req.body.city != null || req.body.street != null) {
        if (!req.body.city) {
          await Event.findById(req.body.id, (err, id) => {
            req.body.city = id.city
          })
        }
        if (!req.body.street) {
          await Event.findById(req.body.id, (err, id) => {
            req.body.street = id.street
          })
        }
        if (req.body.city && req.body.street) {
          await axios.create({ baseURL: "https://nominatim.openstreetmap.org/" })
            .get(encodeURI("search/" + req.body.street + "," + req.body.city + "?format=json&polygon=1&addressdetails=1"))
            .then(function (response) {
              if (response.data.length <= 0) {
                status = 404;
                result.status = status;
                result.message = "City or street not found."
                res.status(status).send(result);
              } else {
                req.body.lon = response.data[0].lon
                req.body.lat = response.data[0].lat
                allChecked = true;
              }
            }).catch(function (err) {
              console.log("Error", err)
            })
        }
      } else {
        allChecked = true;
      }
      if (allChecked) {
        await Event.findByIdAndUpdate(req.body.id, req.body, { new: true }, (err, event) => {
          if (!err) {
            result.status = status;
            result.message = "Success"
            res.status(status).send(result);
          } else {
            status = 500;
            result.status = status;
            result.message = ""
            result.error = err;
            res.status(status).send(result);
          }
        })
      }
    }, mongoose.disconnect())
  }
}
