const { config }  = require("dotenv");
config();
const db = require("../app/models/index");
const bcrypt = require("bcryptjs");

const User = db.user;
db.sequelize.sync({force: false}).then(() => {
  console.log('Drop and Resync Database with { force: true }');
  initial();
});
function initial() {
  User.create({
    id: 1,
    username: "@admin",
    firstname: "John",
    lastname: "admin",
    phone: "039-881-1085",
    status: true,
    codecountry: 'VN',
    password: bcrypt.hashSync('123456', 8),
  });
}