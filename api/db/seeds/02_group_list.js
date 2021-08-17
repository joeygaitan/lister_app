exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('group_list').del()
    .then(function () {
      // Inserts seed entries
      return knex('group_list').insert([
        { user_id: 1, name:"airsoft gear", private:true },
        { user_id: 1, name:"homework", private:false },
        { user_id: 1, name:"adventures", private:false }
      ]);
    });
};