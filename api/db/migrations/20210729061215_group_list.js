exports.up = function(knex) {
    return knex.schema.createTable('group_list', (table) => {
        table.increments('id');
        table.integer('user_id').references('user.id').notNullable()
        table.string('name').unique().notNullable()
        table.string('bio');
        table.enu('view_status', ['archived', 'private', 'friends_only', 'public']).defaultTo('public').notNullable();
        table.timestamps(true,true);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('group_list');
};
