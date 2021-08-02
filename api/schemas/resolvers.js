const db = require("../db/knex");
const bcrypt = require('bcrypt')
const { AuthenticationError } = require('apollo-server-express');
const { CreateToken } = require('../utils/authentication')
const { tryCatcher } = require("../utils/errorHandling")
const { GetPersonalLists } = require('../utils/database_requests');

const resolvers = {
    Query: {
        GetSelf: async function (parent, args, context) {
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
        GetGroupsLists: async function (parent, args, context) {
            if (context.user)
            {
                group_lists = GetPersonalLists(context.user.id)
                
                return group_lists
            }
        },
        GetGroupList: async function (parent, {id}, context) {
            if (context.user)
            {
                const group_lists = await GetPersonalLists(context.user.id)

                list = group_lists.find(element => element.id == id)

                if (list)
                {
                    const [list_elements, error2] = await tryCatcher(db('group_list_element')
                    .where('group_list_id', list.id)
                    .returning('*'), 'failed to find elements')
                    
                    if (list_elements)
                    {
                        list['lists'] = list_elements

                        return list;
                    }
                }
                else
                {
                    console.log('failed to find a list :(');
                }
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
        },

        AddGroupList: async (parent, args, context) => {
            if (context.user)
            {
                if (args.input.password)
                {
                    if (args.input.password.length)
                    {
                        args.input.password = await bcrypt.hash(args.password, 10);
                        args.input.private = true;
                    }
                }
                else
                {
                    args.input.private = false;
                    args.input.password = '';
                }

                
                let group_list = {
                    user_id: context.user.id,
                    name: args.input.name,
                    password: args.input.password,
                    bio: args.input.bio || '',
                    private:args.input.private
                }

                let newList = await db("group_list")
                .insert(group_list)
                .returning('*')
                
                newList = newList[0]


                if (newList)
                {
                    return newList;
                }
                else
                {
                    console.error('failed to add a new one')
                }
            }
        },

        AddGroupListElement: async (parent, args, context) => {
            if (context.user)
            {
                const groupList = await tryCatcher(db('group_list')
                .where('id', args.id)
                .first(), "failed to find a group list")

                if (!groupList)
                {
                    const otherGroupList = await tryCatcher(db('user_group_list')
                    .where('user_group_list', args.id)
                    .whereNot('admin_level', '!=', 'blocked')
                    .first(), "failed to find shared list")

                    if (otherGroupList)
                    {
                        let newList = {
                            ...args.input,
                            group_list_id: args.id,
                            user_id: context.user.id
                        }
    
                        let sharedGroupListElement = await db('group_list_element')
                        .insert(newList)
                        .returning('*')

                        sharedGroupListElement = sharedGroupListElement[0]

                        return sharedGroupList;
                    }
                    else
                    {
                        console.error('failed to find group_list')
                    }
                }
                else
                {
                    let newList = {
                        ...args.input,
                        group_list_id: args.id,
                        user_id: context.user.id
                    }

                    let newListElement = await db('group_list_element')
                    .insert(newList)
                    .returning('*')

                    newListElement = newListElement[0]

                    return newListElement;
                }
            }
        }
    }
}

module.exports = resolvers;