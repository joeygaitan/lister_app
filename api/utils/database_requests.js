const db = require('../db/knex')
const { tryCatcher } = require('./errorHandling');

async function GetPersonalLists (user_id)
{
    // finds any of your personal lists
    const [personal_group_lists, error] = await tryCatcher(db('group_list as gl')
    .select(
        'u.username',
        'u.id as user_id',
        'gl.id', 
        'gl.name', 
        'gl.bio', 
        'gl.view_status'
    )
    .innerJoin('user as u', 'u.id', 'gl.user_id')
    .where('user_id', user_id)
    .returning("*"), "failed to find personal user projects")

    // Filters out any lists that you're blocked from, and any lists you're added too. 
    // You can only follow public lists and can only be invited to follow private lists.
    let [other_group_lists, otherGroupListError] = await tryCatcher(db('user_group_list')
    .where('user_id', user_id)
    .whereNot('admin_level', '=', 'blocked')
    .whereNot('invite_status', '=', 'pending')
    .whereNot('invite_status', '=', 'declined')
    .select('group_list_id')
    .returning("*")
    , "failed to find other group lists")
    
    let idList = []
    other_group_lists.map((group_id)=> {
        idList.push(group_id['group_list_id'])
    })

    //     id:ID
    //     user_id: ID
    //     name: String
    //     bio: String
    //     private: Boolean
    const [shared_lists, sharedListErrors] = await tryCatcher(db('group_list as gl')
    .select(
        'u.username',
        'u.id as user_id',
        'gl.id', 
        'gl.name', 
        'gl.bio', 
        'gl.view_status'
    )
    .innerJoin('user as u', 'u.id', 'gl.user_id')
    .whereIn('gl.id', idList)
    .returning('*'), 'failed')

    // return the sum of each and spread all of their content into a single list.
    const group_lists = [...personal_group_lists, ...shared_lists];
    
    return group_lists;
}

async function GetPersonalList (group_list_id, user_id)
{
    const group_lists = await GetPersonalLists(user_id)
    
    list = group_lists.find(element => element.id == group_list_id)

    if (list)
    {
        const list_elements = await db('group_list_element as gle')
        .select(
            'u.username', 
            'u.id', 
            'gle.id', 
            'gle.group_list_id', 
            'gle.name', 
            'gle.url', 
            'gle.bio'
        )
        .innerJoin('user as u', 'u.id', 'gle.user_id')
        .where('gle.group_list_id', list.id)
        
        if (list_elements)
        {
            list['lists'] = list_elements;
            return list;
        }
    }
    else
    {
        console.log('failed to find a list :(');
    }
}

async function GroupListCheck (user_id, group_list_id)
{
    // Check if user owns group_list
    const groupCheck = await db('group_list')
    .where('user_id', user_id)
    .andWhere('id', group_list_id)
    .first()

    if (groupCheck)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// Checks to see if they're creator of the group_list and sees if there is actually a shared user in your list 
async function SharedListCheck (owner_id, user_id, group_list_id)
{
    if (GroupListCheck(owner_id, group_list_id))
    {
        // check if user was already given an invite
        const userGroupCheck = await db('user_group_list')
        .where('user_id', user_id)
        .andWhere('group_list_id', group_list_id)
        .first()

        if (userGroupCheck)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        const checkModify = await db('user_group_list')
        .where('invite_status', '=', 'modify')
        .andWhere('user_id', user_id)
        .andWhere('group_list_id', group_list_id)

        if (checkModify)
        {
            return true
        }
        
        return false;
    }
}

// Gets users in your list
async function GetSharedLists (owner_id, group_list_id)
{
    if (GroupListCheck(owner_id, group_list_id))
    {
        const sharedUsers = await db('user_group_list')
        .where('group_list_id', group_list_id)
        .innerJoin('group_list', 'group_list.id', 'user_group_list.group_list_id')
        .innerJoin('user', 'user.id', 'user_group_list.user_id')
        .returning('*')

        return sharedUsers;
    }
}

async function GetSharedList (user_id, group_list_id)
{

    // id:ID
    // user_id: ID
    // name: String
    // bio: String
    // private: Boolean
    const group_list = await db('group_list as gl')
    .select(
        'u.username',
        'gl.name',
        'gl.bio', 
        'gl.view_status',
        'gl.id as group_list_id'
    )
    .innerJoin('user as u', 'u.id', 'gl.user_id')
    .innerJoin('user_group_list as ugl', 'ugl.group_list_id', 'gl.id')
    .where('gl.id', '=', group_list_id)
    .andWhere('u.id','=', user_id)
    .andWhere('invite_status', '=', 'pending')
    .first()

    console.log(group_list)

    if (list)
    {
        const [list_elements, error2] = await tryCatcher(db('group_list_element')
        .where('group_list', group_list.group_list_id)
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

module.exports = {
    GetPersonalList,
    GetPersonalLists,
    SharedListCheck,
    GetSharedLists,
    GetSharedList
}