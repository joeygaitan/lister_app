exports.up = function(knex) {
    return knex.schema.createTable('friend_list', (table) => {
        table.increments('id')
        table.integer('friend_id').references('user.id').notNullable()
        table.integer('friender_id').references('user.id').notNullable()
        table.enu('request_status', ['accepted', 'declined', 'silent_decline', 'blocked', 'pending']).defaultTo('pending');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('friend_list');
};
