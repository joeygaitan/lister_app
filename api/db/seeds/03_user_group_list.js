exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('user_group_list').del()
    .then(function () {
      // Inserts seed entries
      return knex('user_group_list').insert([
        { user_id: 2, group_list_id: 2 },
        { user_id: 3, group_list_id: 2 },
        { user_id: 2, group_list_id: 3 }
      ]);
    });
};
