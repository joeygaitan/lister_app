const db = require("../db/knex");

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
            
            const user = await db("user")

            const saltRounds = 10;
            this.password = await bcrypt.hash(this.password, saltRounds);
        }
    }
}

module.exports = resolvers;