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
                    .select('username', 'gender', 'bio', 'email', 'gender', 'status', 'age', 'id')
                    .where('id', context.user.id)
                    .first()

                    return data;
                }
                catch {
                    throw new AuthenticationError('not logged in');
                }
            }
        },
        GetGroupsLists: async (parent, args, context) => {
            if (context.user)
            {
                const [personal_group_lists, error] = await tryCatcher(db('group_list')
                .where('user_id', context.user.id)
                .returning("*"), "failed to find personal user projects")

                const [other_group_lists, otherGroupListError] = await tryCatcher(db('user_group_list')
                .where('user_id', context.user.id)
                .whereNot('admin_level', '!=', 'blocked')
                .returning("*")
                , "failed to find other group lists")
                
                const group_lists = [...personal_group_lists, ...other_group_lists]

                return group_lists
            }
        }
    },

    Mutation: {
        // TODO: Let user know that they must verify by email to login.
        SignUp: async (parent, {email, username, password}) => {
            let body = {email, username, password}
            // This hashes the newly given password password
            body.password = await bcrypt.hash(body.password, 10);
            const user = await db("user")
            .insert(body)
            .returning('*')
            
            let newUser = user[0]
            
            if (newUser)
            {
                return ("Please Check your Email for verification")
            }

            else 
            {
                throw new AuthenticationError('Failed to add a new user :/');
            } 
        },

        Login: async (parent, { username, password }) => {

            const [user, error] = await tryCatcher(db('user')
            .select('username', 'gender', 'bio', 'email', 'gender', 'status', 'age', 'password', 'id')
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