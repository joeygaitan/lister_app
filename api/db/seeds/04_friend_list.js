exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('friend_list').del()
    .then(function () {
      // Inserts seed entries
      return knex('friend_list').insert([
        { recieved_id: 2, sender_id: 1, request_status: "accepted" },
        { recieved_id: 3, sender_id: 1, request_status: "accepted" },
        { recieved_id: 1, sender_id: 2 }
      ]);
    });
};