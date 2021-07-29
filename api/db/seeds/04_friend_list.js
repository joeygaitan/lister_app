exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('friend_list').del()
    .then(function () {
      // Inserts seed entries
      return knex('friend_list').insert([
        { friend_id: 2, friender_id: 1, request_status: "accepted" },
        { friend_id: 3, friender_id: 1, request_status: "accepted" },
        { friend_id: 1, friender_id: 2 }
      ]);
    });
};