exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('group_list').del()
    .then(function () {
      // Inserts seed entries
      return knex('group_list').insert([
        { user_id: 1, name:"airsoft gear", password:"$2b$10$OzO690CMDy9uELhbkgxe0uBAI3DAFTk7wcgdGXax2wDimoscXubZ2", private:true },
        { user_id: 1, name:"homework", password:"$2b$10$OzO690CMDy9uELhbkgxe0uBAI3DAFTk7wcgdGXax2wDimoscXubZ2", private:false },
        { user_id: 1, name:"adventures", password:"$2b$10$OzO690CMDy9uELhbkgxe0uBAI3DAFTk7wcgdGXax2wDimoscXubZ2", private:true }
      ]);
    });
};