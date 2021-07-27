const db = require("../db/knex");
const bcrypt = require('bcrypt')
const { AuthenticationError } = require('apollo-server-express');
const { CreateToken } = require('../utils/authentication')
const { tryCatcher } = require("../utils/errorHandling")

const resolvers = {
    Query: {
        GetSelf: async (parent, args, context) => {
            if (context.user) {
                try {
                    const data = await db('user')
                    .select('username', 'gender', 'bio', 'email', 'gender', 'status', 'age')
                    .where('id', context.user.id)
                    .first()

                    console.log(data)
                    return data;
                }
                catch {
                    throw new AuthenticationError('not logged in');
                }
            }
        } 
    },

    Mutation: {
        SignUp: async (parent, args) => {
            args.password = await bcrypt.hash(args.password, 10);
            const user = await db("user")
            .insert(args)
            .first()
            
            const token = CreateToken(user)

            return { token, user }
        },

        Login: async (parent, { username, password }) => {

            const [user, error] = await tryCatcher(db('user')
            .select('username', 'gender', 'bio', 'email', 'gender', 'status', 'age', 'password')
            .where('username', username)
            .first(), "failed to find user")
            
            const [check, error1] = await tryCatcher(bcrypt.compare(password, user.password), "failed to compare passwords")

            if (check)
            {
                const token = CreateToken(user)
                delete user.password

                return { token, user }
            }
        }
    }
}

module.exports = resolvers;