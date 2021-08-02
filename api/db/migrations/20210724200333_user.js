
exports.up = function(knex) {
  return knex.schema.createTable('user', (table) => {
      table.increments('id');
      table.string('email').unique().notNullable();
      table.string('username', 16).unique().notNullable();
      table.string('password').notNullable();
      table.integer('age');
      table.enu('gender', ['male', 'female', 'trans', 'nonbinary']).defaultTo('nonbinary');
      table.enu('status', ['away', 'offline', 'online']).defaultTo('offline');
      table.string('bio');
      table.enu('email_status', ['verified', 'pending']).defaultTo('pending');
      table.timestamps(true,true);
  })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user');
};
