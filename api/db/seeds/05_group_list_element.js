exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('group_list_element').del()
    .then(function () {
      // Inserts seed entries
      return knex('group_list_element').insert([
        { user_id: 1, group_list_id: 1, name: "airsoft bbs" },
        { user_id: 1, group_list_id: 1, name: "speedqb website" },
        { user_id: 1, group_list_id: 1, name: "airsoft helmet" }
      ]);
    });
};
