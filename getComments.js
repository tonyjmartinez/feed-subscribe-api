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
      return new Promise((resolve, reject) => {
        try {
          dynamoDbLib
            .call("query", params)
            .then(data => resolve(data.items))
            .catch(e => resolve([{ userId: e.toString(), content: e }]));
          // const result = {
          //   Items: [{ userId: "tony", commentId: "comment" }]
          // };
        } catch (e) {
          console.log(e);
          reject(e);
        }
      });
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
