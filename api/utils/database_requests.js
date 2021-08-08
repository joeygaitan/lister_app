const db = require('../db/knex')
const { tryCatcher } = require('./errorHandling');

async function GetPersonalLists (id)
{
    // finds any of your personal lists
    const [personal_group_lists, error] = await tryCatcher(db('group_list')
    .where('user_id', id)
    .returning("*"), "failed to find personal user projects")

    // Filters out any lists that you're blocked from, and any lists you're added too. 
    // You can only follow public lists and can only be invited to follow private lists.
    let [other_group_lists, otherGroupListError] = await tryCatcher(db('user_group_list')
    .where('user_id', id)
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

    const [shared_lists, sharedListErrors] = await tryCatcher(db('group_list')
    .whereIn('id', idList)
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
        return false;
    }
}

async function GetSharedLists (owner_id, group_list_id)
{
    if (GroupListCheck(owner_id, group_list_id))
    {
        const sharedUsers = await db('user_group_list')
        .where('group_list_id', group_list_id)
        .innerJoin('group_list', 'group_list.id', 'user_group_list.group_list_id')
        .innerJoin('user', 'user.id', 'user_group_list.user_id')
        .returning('*')

        console.log(sharedUsers)

        return sharedUsers;
    }
}

module.exports = {
    GetPersonalList,
    GetPersonalLists,
    SharedListCheck,
    GetSharedLists
}