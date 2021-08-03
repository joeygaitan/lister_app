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
    for (let i = 0; i < other_group_lists.length; ++i)
    {
        idList.push(other_group_lists[i]['group_list_id'])
    }

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

module.exports = {
    GetPersonalList,
    GetPersonalLists
}