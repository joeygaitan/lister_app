const db = require("../db/knex");
const bcrypt = require('bcrypt')
const { AuthenticationError } = require('apollo-server-express');
const { CreateToken } = require('../utils/authentication')
const { tryCatcher } = require("../utils/errorHandling")
const { GetPersonalLists, GetPersonalList, SharedListCheck, GetSharedLists } = require('../utils/database_requests');

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
        },

        GetGroupInvites: async function (parent, args, context)
        {
            if (context.user)
            {
                const getPendingInvites = await db('user_group_list')
                .where('user_id', context.user.id)
                .where('invite_status', '=', 'pending')
                .select('name', 'admin_level', 'group_list_id')
                // .innerJoin('user_id', 'user_id')
                // .innerJoin('user_id', 'group_list.id')
                
                return getPendingInvites;
            }
        },

        GetSharedUserList: async function (parent, { group_list_id }, context)
        {
            if (context.user)
            {
                const sharedUsers = await GetSharedLists(context.user.id, group_list_id)

                return sharedUsers;
            }
        },

        FindLists: async function (parent, { search }, context) {
            if (context.user)
            {
                const searchedGroupList = await db('group_list')
                .where('name', 'like', `%${search}%`)
                .whereNot('user_id', '=', context.user.id)
                .whereNot('private', '=', true)

                return searchedGroupList;
            }
        },

        FindListsLoggedOff: async function (parentm, {search})
        {
            const searchedGroupList = await db('group_list')
            .where('name', 'LIKE', `%${search}%`)
            .whereNot('private', '=', true)

            return searchedGroupList;
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
                return ("Please Check your Email for verification");
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

        FollowGroupList: async (parent, { group_list_id }, context) => {
            if (context.user)
            {
                // checks that you're not adding yourself to the list
                const list = await db('group_list')
                .whereNot('user_id', '=', context.user.id)
                .andWhere('private', '=', false)
                .where('id', group_list_id)
                .first()

                if (list)
                {
                    // checks for any duplicates of the same list.
                    const sharedLists = await db('user_group_list')
                    .where('group_list_id', '=', list.id)
                    .andWhere('user_id', '=', context.user.id)

                    if (sharedLists.length == 0)
                    {
                        const addedTolist = await db('user_group_list')
                        .insert({
                            group_list_id,
                            user_id: context.user.id
                        })
                        .returning('*')

                        let list = await GetPersonalList(group_list_id, context.user.id)
                        return list;
                    }
                    else
                    {
                        console.error('user is already added :/')
                    }
                }
                else
                {
                    console.error('couldn\' find the list you\'re looking for. ')
                }
                
            }
        },

        InviteTooFollowList: async (parent, { admin_level, group_list_id, user_id }, context) => {
            if (context.user)
            {
                const userList = await db('group_list')
                .whereNot('user_id', '=', user_id)
                .andWhere('private', '!=', true)
                .where('id', group_list_id)

                if (userList)
                {
                    // checks for any duplicates of the same list.
                    const sharedLists = await db('user_group_list')
                    .whereNot('group_list_id', '!=', list.id)
                    .andWhere('user_id', '=', user_id)

                    if (sharedLists.length == 0)
                    {
                        const addedTolist = await db('user_group_list')
                        .insert({
                            group_list_id: list.id,
                            user_id: user_id,
                            admin_level,
                            invite_status: 'pending'
                        })
                        .returning('*')
 
                        return ("Sent Request");
                    }
                    else
                    {
                        console.error('user is already added :/')
                    }
                }
            }
        },



        UpdateInviteStatus: async function (parent, { choice, id }, context) {
            if (context.user)
            {
                const sharedList = await db('user_group_list')
                .where('id', id)

                if (sharedList)
                {
                    const updateList = await db('user_group_list')
                    .where('id', id)
                    .update({invite_status: (choice) ? 'accepted' : 'declined'})
                    
                    if (choice)
                    {
                        const newlyAddedList = await GetGroupList(updateList.group_list_id, updateList.user_id)
                        return newlyAddedList;
                    }
                    else
                    {
                        return
                    }
                }
            }
        },

        UpdateUserListAccess: async function (parent, { choice, user_id, group_list_id }, context)
        {
            if (context.user)
            {
                if (SharedListCheck(context.user.id, user_id, group_list_id))
                {
                    const updateList = await db('user_group_list')
                    .where('group_list_id', group_list_id)
                    .andWhere('user_id', user_id)
                    .update({
                        admin_level: choice
                    })
                    .first()
                    
                    if (updateList)
                    {
                        return ("finished up failure");
                    }
                }
                else
                {
                    return ('failed to updated');
                }
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
                    .where('admin_level', '=', 'modify')
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
                    // adds it for your self.
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