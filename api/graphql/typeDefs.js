const { gql } = require("apollo-server-express");

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
        bio: String
    }
`;

module.exports = typeDefs;