const db = require("../db/knex");
const bcrypt = require('bcrypt')
const { AuthenticationError } = require('apollo-server-express');
const { CreateToken } = require('../utils/authentication')
const { tryCatcher } = require("../utils/errorHandling")
const { GetPersonalLists, GetPersonalList, SharedListCheck, GetSharedLists, GetSharedList } = require('../utils/database_requests');

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
                group_lists = await GetPersonalLists(context.user.id)
                
                return group_lists
            }
        },
        GetGroupList: async function (parent, {id}, context) {
            if (context.user)
            {
                // get all group lists that correspond by id
                const group_lists = await GetPersonalLists(context.user.id)

                // look for selected group list
                list = group_lists.find(element => element.id == id)
                

                if (list)
                {
                    const list_elements = await GetPersonalList(list.id, list.user_id)   

                    console.log(list_elements)
                    if (list_elements)
                    {
                        return list_elements;
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
                const groupInvites = await db('group_list as gl')
                .select(
                    'u.username',
                    'u.id as group_list_owner_id',
                    'gl.name',
                    'ugl.group_list_id',
                    'ugl.invite_status',
                    'ugl.admin_level',
                    'ugl.id as invite_id'
                )
                .innerJoin('user as u', 'u.id', 'gl.user_id')
                .innerJoin('user_group_list as ugl', 'ugl.group_list_id', 'gl.id')
                .where('ugl.user_id', '=', context.user.id)
                .andWhere('invite_status', '=', 'pending') 
                .returning('*')

                console.log(groupInvites, "line 86")
                
                return groupInvites;
            }
        },
        
        // 
        GetSharedUserList: async function (parent, { group_list_id }, context)
        {
            if (context.user)
            {
                const sharedUsers = await GetSharedLists(context.user.id, group_list_id)
                console.log(sharedUsers)
                return sharedUsers;
            }
        },

        FindLists: async function (parent, { search }, context) {
            if (context.user)
            {
                const searchedGroupList = await db('group_list')
                .where('name', 'like', `%${search}%`)
                .where('view_status', '=', 'public')
                .whereNot('user_id', '=', context.user.id)

                return searchedGroupList;
            }
        },
        /*
            id:ID
            user_id: ID
            username: String!
            name: String
            bio: String
            view_status: View_Status
        */

        FindListsLoggedOff: async function (parent, {search}, context)
        {
            const searchedGroupList = await db('group_list as gl')
            .select(
                'gl.id',
                'gl.user_id',
                'u.username',
                'gl.name',
                'gl.bio',
                'gl.view_status'
            )
            .innerJoin('user as u', 'u.id', 'gl.user_id')
            .where('name', 'LIKE', `%${search}%`)
            .andWhere('view_status', '=', 'public')

            return searchedGroupList;
        },

        GetFriends: async function (parent, args, context) {
            if (context.user)
            {
                // const friends = await db('friend_list')
                // .raw(`
                    // select 
                    //     f.user_id,
                    //     u.username,
                    //     u.email,
                    //     u.gender,
                    //     u.status,
                    //     u.bio,
                    //     fl.request_status
                    // from friend_list as fl,
                    // lateral (
                    //     select case
                    //         when
                    //             fl.sender_id = ${context.user.id} then fl.recieved_id
                    //         else
                    //             fl.sender_id 
                    //         end
                    // ) f(user_id)
                    // inner join public."user" as u
                    //     on u.id = f.user_id
                    // where 
                    // fl.request_status='accepted'`
                // )

                // db.raw adds in the method name in front. such as from(db.raw('from')) this would add two froms in your query
                // other camal case methods don't add them in allowing you to specify what you want.
                // lateral allows you to add something to a selected select option allowing you to do expressions.
                const friends = await db
                .select(db.raw('f.user_id, u.username, u.email, u.gender, u.status, u.bio, fl.request_status'))
                .from(db.raw(`friend_list as fl,`))
                .joinRaw(`lateral (select case when fl.sender_id = ${context.user.id} then fl.recieved_id else fl.sender_id end) f(user_id)`)
                .joinRaw(`inner join public."user" as u on u.id = f.user_id`)
                .whereRaw(`fl.request_status='accepted'`)

                // console.log(friends)
                // backlog: figure out a way to use a sub query to make a column that out puts a json array of lists
                for (const friend of friends)
                {
                    friend['lists'] = await GetPersonalLists(friend.user_id, true)
                }
                console.log(friends)
                return friends
            }
        },
        /*
            id: ID!
            user_id: ID!
            username: String!
            request_status: Request_Status
        */
        GetPendingFriendRequests: async function (parent, args, context) {
            if (context.user)
            {
                const friendRequests = await db
                .select(db.raw('f.user_id, u.username, fl.request_status, fl.id'))
                .from(db.raw(`friend_list as fl,`))
                .joinRaw(`lateral (select case when fl.sender_id = ${context.user.id} then fl.recieved_id else fl.sender_id end) f(user_id)`)
                .joinRaw(`inner join public."user" as u on u.id = f.user_id`)
                .whereRaw(`fl.request_status='pending'`)

                return friendRequests;
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
                .andWhere('view_status', '=', 'public')
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
                // checks if the user is trying trying to add themself to the shared group_list.
                const userList = await db('group_list')
                .whereNot('user_id', '=', user_id)
                .where('id', group_list_id)

                console.log(userList, userList)

                if (userList)
                {
                    // checks for any duplicates of the same list.
                    const sharedLists = await db('user_group_list')
                    .where('group_list_id', '=', group_list_id)
                    .andWhere('user_id', '=', user_id)

                    console.log(sharedLists)
                    if (sharedLists.length == 0)
                    {
                        const addedTolist = await db('user_group_list')
                        .insert({
                            group_list_id: group_list_id,
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



        UpdateRecievedInviteStatus: async function (parent, { choice, id }, context) {
            if (context.user)
            {
                const sharedList = await db('user_group_list')
                .where('id', id)
                .andWhere('invite_status', '=', 'pending')
                console.log(sharedList)
                if (sharedList)
                {
                    const updateList = await db('user_group_list')
                    .where('id', id)
                    .update({invite_status: (choice) ? 'accepted' : 'declined'})
                    
                    console.log
                    if (choice)
                    {
                        const newlyAddedList = await GetSharedList(updateList.user_id, updateList.group_list_id)
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
            if (context.user && context.user.id != user_id)
            {
                if (SharedListCheck(context.user.id, user_id, group_list_id))
                {
                    const updateList = await db('user_group_list')
                    .where('group_list_id', group_list_id)
                    .andWhere('user_id', user_id)
                    .update({
                        admin_level: choice
                    })
                    
                    if (updateList)
                    {
                        return ("successfully updated user's access privilege");
                    }
                }
                else
                {
                    return ('failed to updated');
                }
            }
            else
            {
                console.log("you're not logged in or you can't modify your own privileges....")
            }
        },

        AddGroupList: async (parent, args, context) => {
            if (context.user)
            { 
                if (args.group_list_id)
                {
                    if (SharedListCheck(context.user.id, context.user.id, args.group_list_id))
                    {
                        
                        const updateList = await db('group_list')
                        .where('id', args.group_list_id)
                        .update({ ...args.input })
                        .returning('*')

                        return updateList
                    }
                    else
                    {
                        console.log('you dont have the right privileges to update this group list post')
                    }
                }
                else
                {
                    let group_list = {
                        user_id: context.user.id,
                        name: args.input.name,
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
            }
        },

        AddGroupListElement: async (parent, args, context) => {
            if (context.user)
            {
                // updates element of array
                console.log('here')
                if (args.group_list_element_id)
                {
                    const groupList = await tryCatcher(db('group_list')
                    .where('id', args.group_list_id)
                    .where('user_id', context.user.id)
                    .first(), "failed to find a group list")
                    
                    // if user created the group list
                    if (groupList)
                    {

                        const updatedGroupList = await tryCatcher(db('group_list_element')
                        .where('id', args.group_list_element_id)
                        .update({...args.input})
                        .returning('*'), "failed to find a group list")

                        return updatedGroupList
                    }
                    else
                    {
                        // if the user is being shared the group_list...
                        const otherGroupList = await tryCatcher(db('user_group_list')
                        .where('user_group_list', args.group_list_id)
                        .andWhere('user_id', context.user.id)
                        .whereNot('admin_level', '=', 'blocked')
                        .whereNot('invite_status', '=', 'pending')
                        .whereNot('invite_status', '=', 'declined')
                        .where('admin_level', '=', 'modify')
                        .orWhere('admin_level', '=', 'only_modify_personal_additions')
                        .first(), "failed to find shared list")

                        if (otherGroupList)
                        {
                            const updatedGroupList = await tryCatcher(db('group_list_element')
                            .where('id', args.group_list_element_id)
                            .update({...args.input})
                            .returning('*'), "failed to find a group list")

                            return updatedGroupList
                        }
                    }
                }
                else
                {
                    const groupList = await tryCatcher(db('group_list')
                    .where('id', args.group_list_id)
                    .first(), "failed to find a group list")

                    if (!groupList)
                    {
                        const otherGroupList = await tryCatcher(db('user_group_list')
                        .where('user_group_list', args.group_list_id)
                        .whereNot('admin_level', '=', 'blocked')
                        .whereNot('invite_status', '=', 'pending')
                        .whereNot('invite_status', '=', 'declined')
                        .where('admin_level', '=', 'modify')
                        .orWhere('admin_level', '=', 'only_modify_personal_additions')
                        .first(), "failed to find shared list")

                        if (otherGroupList)
                        {
                            let newList = {
                                ...args.input,
                                group_list_id: args.group_list_id,
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
                            group_list_id: args.group_list_id,
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
        },

        AddFriend: async (parent, { user_id }, context) => {
            // checks that you're logged
            if (context.user)
            {
                // checks that you're not trying to add yourself.
                if (context.user.id != user_id)
                {
                    const checkForDuplicates = await db('friend_list')
                    .whereRaw(`sender_id=${context.user.id} and recieved_id=${user_id} or sender_id=${user_id} and recieved_id=${context.user.id}`)
                    // checks for duplicate friend requests
                    console.log(checkForDuplicates.length)
                    if (checkForDuplicates.length === 0)
                    {
                        const newInvite = await db('friend_list')
                        .insert({
                            sender_id: context.user.id,
                            recieved_id: user_id
                        })
                        .returning('*')

                        if (newInvite)
                        {
                            return ('Invite Sent')
                        }
                        else
                        {
                            return ('failed to send invite :(')
                        }
                    }
                    else
                    {
                        return ('friend request has already been sent :(')
                    }
                }
            }
        },

        UpdateFriendRequest: async (parent, { request_id, choice }, context) => {
            if (context.user)
            {
                const requestCheck = await db('friend_list')
                .whereRaw(`where sender_id=${context.user.id} or recieved_id=${context.user.id}`)
                .andWhere('request_status', 'pending')
                .andWhere('id', request_id)

                if (requestCheck)
                {
                    const updatedList = await db('friend_list')
                    .where('id', request_id)
                    .update({
                        request_status: choice
                    })
                    .returning('*')
                    
                    if (updatedList)
                    {
                        return ('updated request status')
                    }
                    else
                    {
                        return ('failed to updated request status :(')
                    }
                }
                else
                {
                    return ("failed to find your request :(")
                }
            }
        },

        UpdateGroupListViewStatus: async (parent, args, context) => {
            if (context.user)
            {
                if (SharedListCheck(context.user.id, context.user.id, args.group_list_id))
                {
                    const updateList = await db('group_list')
                    .where('id', args.group_list_id)
                    .andWhere('user_id', context.user.id)
                    .update({
                        view_status: args.choice
                    })

                    if (updateList)
                    {
                        return ("successfully updated list")
                    }
                    else
                    {
                        return ('failed to update list')
                    }
                }
            }
        }
    }
}

module.exports = resolvers;