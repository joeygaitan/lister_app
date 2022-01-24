
exports.up = function(knex) {
    return knex.schema.createTable('group_list_element', (table) => {
        table.increments('id')
        table.integer('user_id').references('user.id').notNullable()
        table.integer('group_list_id').references('group_list.id').notNullable()
        table.enu('element_type', ['item', 'watch_item', 'url_item']).defaultTo('item')
        table.string('url')
        table.string('name')
        table.string('bio')
        table.timestamps(true,true);
        table.enu('view_status', ['public', 'private', 'archived']).defaultTo('public')
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('group_list_element');
};
