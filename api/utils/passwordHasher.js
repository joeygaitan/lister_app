const bcrypt = require('bcrypt')
const db = require('../db/knex')

const passwordHasher = async (password) => {
    const letNewPassword = await bcrypt.hash(password, 10);
    console.log(letNewPassword)
    return letNewPassword;
}

const comparePassword = async (username, password) => {
    let user = await db('user')
    .where('username', username)
    .first()

    console.log(user)

    let check = await bcrypt.compare(password, user.password)

    return check;
}

console.log(passwordHasher("1234"))

// module.exports = { passwordHasher, comparePassword };

