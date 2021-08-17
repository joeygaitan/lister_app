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

    enum Admin_Level
    {
        only_modify_personal_additions
        view
        modify
        blocked
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
        username: String!
        id: ID!
        user_id: ID!
        group_list_id: ID!
        url: String!
        name: String!
        bio: String
    }

    type Group_list
    {
        id:ID
        user_id: ID
        username: String!
        name: String
        bio: String
        private: Boolean
    }

    type list
    {
        id:ID!
        user_id: ID!
        username: String!
        name: String!
        bio: String!
        private: Boolean!
        lists: [Group_List_Element] 
    }

    type User_Group_list
    {
        name: String!
        username: String!
        invite_id: ID!
        group_list_owner_id: ID!
        group_list_id: ID!
        admin_level: String!
        invite_status: String!
    }

    input SignUpVerify
    {
        age: Int!
        gender: Gender
        status: Status
        bio: String
    }

    input Input_Group_list
    {
        password: String
        name: String!
        bio: String!
        private: Boolean!
    }

    input Input_Group_list_element
    {
        name: String!
        url: String
        bio: String
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        GetSelf: User
        GetGroupList(id:ID!): list
        GetGroupsLists: [Group_list]
        
        GetSharedUserList(group_list_id: ID!): [User_Group_list]

        GetGroupInvites: [User_Group_list]

        FindLists(search: String!) : [Group_list]
        FindListsLoggedOff(search: String!) : [Group_list]
    } 

    type Mutation {
        Login(username: String!, password: String!): Auth
        SignUp(email: String!, username: String!, password: String!): String

        FollowGroupList(group_list_id: ID!): list
        InviteTooFollowList(admin_level: String!, group_list_id: ID!, user_id: ID!): String

        UpdateRecievedInviteStatus(choice: Boolean!, id: ID!): list
        UpdateUserListAccess(choice: String!, user_id: ID!, group_list_id: ID!): String 

        AddGroupList(input: Input_Group_list!): Group_list
        AddGroupListElement(group_list_element_id: ID, group_list_id: ID!, input: Input_Group_list_element!): Group_List_Element
    }
`;

module.exports = typeDefs;


