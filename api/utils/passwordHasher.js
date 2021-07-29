const bcrypt = require('bcrypt')
const db = require('../db/knex')

const passwordHasher = async (password) => {
    const letNewPassword = await bcrypt.hash(password, 10);
    
    return password;
}

const comparePassword = async (username, password) => {
    let user = await db('user')
    .where('username', username)
    .select('password')
    .first()

    let check = await bcrypt.compare(password, user.password)

    return check;
}

module.exports = { passwordHasher, comparePassword };

