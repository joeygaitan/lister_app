exports.up = function(knex) {
    return knex.schema.createTable('friend_list', (table) => {
        table.increments('id')
        table.integer('recieved_id').references('user.id').notNullable()
        table.integer('sender_id').references('user.id').notNullable()
        table.enu('request_status', ['accepted', 'declined', 'silent_decline', 'blocked', 'pending']).defaultTo('pending');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('friend_list');
};
