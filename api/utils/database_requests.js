const db = require('../db/knex')
const { tryCatcher } = require('./errorHandling');

async function GetPersonalLists (id)
{
    const [personal_group_lists, error] = await tryCatcher(db('group_list')
    .where('user_id', id)
    .returning("*"), "failed to find personal user projects")

    const [other_group_lists, otherGroupListError] = await tryCatcher(db('user_group_list')
    .where('user_id', id)
    .whereNot('admin_level', '!=', 'blocked')
    .returning("*")
    , "failed to find other group lists")
    
    const group_lists = [...personal_group_lists, ...other_group_lists];
    
    return group_lists;
}

module.exports = {
    GetPersonalLists
}