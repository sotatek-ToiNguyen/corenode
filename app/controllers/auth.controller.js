const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const { getRandomInt } = require("../helpers/generate");
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const {sendMessageSMSByTwilio} = require("../helpers/twitlio");

exports.signup = (req, res) => {
    const code = getRandomInt(1000, 9999);
    console.log(code);
  // Save User to Database
  User.create({
    username: req.body.username,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    phone: req.body.phone,
    code: req.body.code,
    password: bcrypt.hashSync(req.body.password, 8),
    status: false
  }).then(async user => {
      const code = getRandomInt(1000, 9999);
      console.log(code);
      await sendMessageSMSByTwilio(code, req.body.phone)
      res.send({ message: "User registered successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400*3 // 3 days
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
