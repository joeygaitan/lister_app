const { gql } = require("apollo-server-express");

table.increments('id');
      table.string('email').notNullable();
      table.string('password').notNullable();
      table.integer('age').notNullable();
      table.enu('gender', ['male', 'female', 'trans', 'non-binary']).defaultTo('non-binary');
      table.enu('status', ['away', 'offline', 'online']).defaultTo('offline');
table.string('bio');
table.timestamps(true,true);

const typeDefs = gql`
    enum Gender {
        male
        female
        trans
        non-binary
    }

    enum Status
    {
        away
        offline
        online
    }

    type User {
        id: ID!
        username: String!
        password: String!
        email: String!
        age: Int!
        gender: Gender
        status: Status
        friends_can_see_private
    }
`;

module.exports = typeDefs;