# Graphql

## Graphql playground

* How to do a bearer token in graphql playground

```json
{
  "Authorization": "Bearer <JWT>"
}
```

* How to add variables from query varaibles

```
mutation Login($username: String!, $password: String!) {
    Login(username: $username, password: $password)
    {
        token
        user {
        username
        email
        }
    }
}
```

* Then in the query variables do this 
```json
{
  "username": "misterjoe",
  "password": "1234"
}
```