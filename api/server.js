const express = require("express");
const path = require("path")
const bodyParser = require('body-parser')
const morgan = require('morgan')

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require("./schemas")
const { Authenticate } = require('./utils/authentication')

const port = process.env.PORT || 5000
const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: Authenticate
})

server.applyMiddleware({ app })

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(morgan('dev'))

app.use('/', express.static('public'))

app.listen(port, () => {
    console.log(`Server started on port ${port} :)`);
    console.log(`GraphQL dev env located here http://localhost:${port}${server.graphqlPath}`);
});
