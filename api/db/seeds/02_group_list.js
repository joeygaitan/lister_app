exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('group_list').del()
    .then(function () {
      // Inserts seed entries
      return knex('group_list').insert([
        { user_id: 1, name:"airsoft gear", view_status: "private" },
        { user_id: 1, name:"homework" },
        { user_id: 1, name:"adventures" }
      ]);
    });
};