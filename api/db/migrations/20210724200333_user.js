
exports.up = function(knex) {
  return knex.schema.createTable('user', (table) => {
      table.increments('id');
      table.string('email').unique().notNullable();
      table.string('username', 16).unique().notNullable();
      table.string('password').notNullable();
      table.integer('age').defaultTo(18);
      table.enu('gender', ['male', 'female', 'trans', 'non-binary']).defaultTo('non-binary');
      table.enu('status', ['away', 'offline', 'online']).defaultTo('offline');
      table.string('bio');
      table.timestamps(true,true);
  })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user');
};
