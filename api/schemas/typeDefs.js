const { gql } = require("apollo-server-express");

const typeDefs = gql`
    enum Gender {
        male
        female
        trans
        nonbinary
    }

    enum Status {
        away
        offline
        online
    }

    type User {
        id: ID!
        username: String!
        email: String!
        age: Int!
        gender: Gender
        status: Status
        bio: String
    }

    type Group_List_Element
    {
        id: ID!
        user_id: ID!
        group_list_id: ID!
        url: String!
        name: String!
        bio: String
    }

    type Group_list
    {
        id:ID!
        user_id: ID!
        name: String!
        bio: String!
        private: Boolean!
        group_list_elements: [Group_List_Element]
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        GetSelf: User
        GetGroupsLists: Group_list
    } 

    type Mutation {
        Login(username: String!, password: String!): Auth
        SignUp(email: String!, username: String!, password: String!): String
    }
`;

module.exports = typeDefs;