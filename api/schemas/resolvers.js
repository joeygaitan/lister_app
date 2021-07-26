const db = require("../db/knex");
const bcrypt = require('bcrypt')
const { CreateToken } = require('../utils/authentication')

const resolvers = {
    Query: {
        GetSelf: async (parent, args, context) => {
            if (context.user) {
                try {
                    const data = await db('user')
                    .select('username, gender', 'bio', 'email', 'gender', 'status', 'age')
                    .where('id', context.id)

                    return data;
                }
                catch {
                    return ("failed to find user. Context failed failed to find the user :/");
                }
            }
        } 
    },

    Mutation: {
        SignUp: async (parent, args) => {
            args.password = await bcrypt.hash(this.password, 10);
            const user = await db("user")
            .insert(args)
            
            const token = CreateToken(user)

            return { token, user }
        },

        Login: async (parent, { username, password }) => {
            try
            {
                const user = await db('user')
                .select('username, gender', 'bio', 'email', 'gender', 'status', 'age')
                .where('username', username)

                try
                {
                    const check = await bcrypt.compare(password, user.password)
                    if (check)
                    {
                        const token = await CreateToken(user)
    
                        return { token, user }
                    }
                }
                catch
                {
                    console.error("password doesn't match")
                }

            }
            catch
            {
                console.error("failed to login....");
            }
        }
    }
}

module.exports = resolvers;