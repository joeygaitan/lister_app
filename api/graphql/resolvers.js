const db = require("../db/knex");

const resolvers = {
    Query: {
        GetSelf: async (parent, args, context) => {
            if (context.user) {
                try {
                    const data = await db('users')
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

    }
}

module.exports = resolvers;