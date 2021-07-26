exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('user').del()
    .then(function () {
      // Inserts seed entries
      return knex('user').insert([
        {id: 1, username: "misterjoe", email:"joeygaitan707@gmail.com", password: "1234", age: 20 },
        {id: 2, username: "admin", email:"admin@admin.com", password: "1234", age: 18 },
        {id: 3, username: "admin1234", email:"admin@email.com", password: "1234", age: 25 }
      ]);
    });
};
