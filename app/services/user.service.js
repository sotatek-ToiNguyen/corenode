const db = require("../models");
const User = db.user;

getUserByName = async(username) => {
    const user = await User.findOne({
        where: {
            status: true,
            username: username
        }
    })
    if(user){
        return user.dataValues;
    }
}
getUserByPhone = async(phone) => {
    const user = await User.findOne({
        where: {
            status: true,
            phone: phone
        }
    })
    if(user){
        return user.dataValues;
    }
}
module.exports = {
    getUserByName,
    getUserByPhone
}