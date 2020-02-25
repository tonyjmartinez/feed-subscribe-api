const { ApolloServer, gql } = require("apollo-server-lambda");
import * as dynamoDbLib from "./libs/dynamodb-lib";
// import { success, failure } from "./libs/response-lib";

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Comment {
    userId: String
    commentId: String
    content: String
  }
  type Query {
    hello: String
    comments: [Comment]
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => "Hello world!",
    comments: () => {
      const params = {
        TableName: process.env.graphQLTable
      };
      try {
        return dynamoDbLib.call("scan", params);
        // const result = {
        //   Items: [{ userId: "tony", commentId: "comment" }]
        // };
      } catch (e) {
        console.log(e);
        return e;
      }
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});
