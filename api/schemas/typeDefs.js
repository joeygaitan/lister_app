const { gql } = require("apollo-server-express");

/*
    id:ID
    user_id: ID
    name: String
    bio: String
    private: Boolean
*/


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

    enum View_Status {
        archived
        private 
        public
    }

    enum Request_Status {
        accepted 
        declined 
        silent_decline 
        blocked 
        pending
    }

    enum Admin_Level {
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

    type Friend {
        user_id: ID!
        username: String!
        email: String!
        gender: Gender
        status: Status
        bio: String
        request_status: Request_Status
        lists: [Group_list] 
    }

    type Friend_Request {
        id: ID!
        user_id: ID!
        username: String!
        request_status: Request_Status
    }

    type Group_List_Element {
        username: String!
        id: ID!
        user_id: ID!
        group_list_id: ID!
        url: String!
        name: String!
        bio: String
    }

    type Group_list {
        id:ID
        user_id: ID
        username: String!
        name: String
        bio: String
        view_status: View_Status
    }

    type Group_User
    {
        username: String!
    }

    type Group_Users
    {
        group_list: [Group_list]
    }

    type list
    {
        id:ID!
        user_id: ID!
        username: String!
        name: String!
        bio: String!
        view_status: View_Status
        lists: [Group_List_Element] 
    }

    type User_Group_list {
        name: String!
        username: String!
        invite_id: ID!
        group_list_owner_id: ID!
        group_list_id: ID!
        admin_level: String!
        invite_status: String!
    }

    input SignUpVerify {
        age: Int!
        gender: Gender
        status: Status
        bio: String
    }

    input Input_Group_list {
        name: String
        bio: String
        view_status: View_Status
    }

    input Input_Group_list_element {
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
<<<<<<< HEAD
        GetGroupListUsers(id: ID!):
=======
        
        GetSharedUserList(group_list_id: ID!): [User_Group_list]

        GetGroupInvites: [User_Group_list]

        FindLists(search: String!) : [Group_list]
        FindListsLoggedOff(search: String!) : [Group_list]

        GetUsers(user_search: String!) : [User]
        
        GetPendingFriendRequests: [Friend_Request]
        GetFriends: [Friend]
>>>>>>> d652005c9fe84a1a6373755efcb5f7b59110b3ac
    } 

    type Mutation {
        Login(username: String!, password: String!): Auth
        SignUp(email: String!, username: String!, password: String!): String

        FollowGroupList(group_list_id: ID!): list
        InviteTooFollowList(admin_level: String!, group_list_id: ID!, user_id: ID!): String

        UpdateRecievedInviteStatus(choice: Boolean!, id: ID!): list
        UpdateUserListAccess(choice: String!, user_id: ID!, group_list_id: ID!): String 

        AddGroupList(group_list_id: ID, input: Input_Group_list!): Group_list
        AddGroupListElement(group_list_element_id: ID, group_list_id: ID!, input: Input_Group_list_element!): Group_List_Element

        AddFriend(user_id: ID!): String!
        UpdateFriendRequest(request_id: ID!, choice: String!): String!

        UpdateGroupListViewStatus(group_list_id: ID!, choice: String!): String!
    }
`;

module.exports = typeDefs;


