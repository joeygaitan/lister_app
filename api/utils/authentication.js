const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
require('dotenv').config()

module.exports = {
    Authenticate: function ({ req }) 
    {
        let token = req.body.token || req.query.token || req.headers.authorization;
        
        if (req.headers.authorization) 
        {
            token = token.split(' ').pop().trim();
        }

        if (!token)
        {
            return req
        }

        try 
        {
            const { data } = jwt.verify(token, secret, { maxAge: process.env.EXPIRATION })
            delete data.password;
            req.user = data
        }
        catch
        {
            console.log("Wrong token :/")
        }

        return req;
    },

    CreateToken: function ({username, email, id})
    {
        return jwt.sign({data: {username, email, id}}, process.env.SECRET, { expiresIn: process.env.EXPIRATION })
    }
};
