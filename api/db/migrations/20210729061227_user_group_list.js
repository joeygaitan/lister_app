
exports.up = function(knex) {
    return knex.schema.createTable('user_group_list', (table) => {
        table.increments('id')
        table.integer('user_id').references('user.id').notNullable()
        table.integer('group_list_id').references('group_list.id').notNullable()
        table.enu('invite_status', ['pending', 'declined', 'accepted', 'public']).defaultTo('public');
        table.enu('admin_level', [,'view', 'modify', 'blocked']).defaultTo('view');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user_group_list');
};
