const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const { getRandomInt } = require("../helpers/generate");
const Op = db.Sequelize.Op;
const { setAsync, getAsync} = require('../helpers/redis');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const {sendMessageSMSByTwilio} = require("../helpers/twitlio");
const {REDIS_CACHE} = require("../constant");
const {getUserByName, getUserByPhone} = require("../services/user.service")
exports.signup = (req, res) => {
    const code = getRandomInt(1000, 9999);
    console.log(code);
  // Save User to Database
  User.create({
    username: req.body.username,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    phone: req.body.phone,
    codecountry: req.body.codecountry,
    password: bcrypt.hashSync(req.body.password, 8),
    status: false
  }).then(async user => {
      const code = getRandomInt(1000, 9999);
      await setAsync(REDIS_CACHE.PREFIX_SIGNUP + req.body.username, code, 'EX', REDIS_CACHE.TIME_EX);
      await sendMessageSMSByTwilio(code, req.body.phone)
      res.send({ message: "User registered successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.verify = async (req, res) => {
    const username = req.body.username;
    const code = req.body.code;
    const codeRedis = await getAsync(REDIS_CACHE.PREFIX_SIGNUP + username);
    if(!codeRedis){
        return res.status(410).send({ message: "Code expired." })
    }
    if(codeRedis == code){
        User.update({
            status: true,
        },{ where: { username: username}}).then(
            res.send({ message: "Active user successfully!" })
        ).catch(
            res.status(500).send({ message: err.message })
        )
    }
}

exports.signin = async(req, res) => {
  var user = await getUserByName(req.body.username);
  if(!user){
      user = await getUserByPhone(req.body.username);
  }
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

  res.status(200).send({
    user : {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      codecountry: user.codecountry
   },
    accessToken: token
  });
};
