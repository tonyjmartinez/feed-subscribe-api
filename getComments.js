const { ApolloServer, gql } = require("apollo-server-lambda");
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
  type Comments {
    userId: String
    commentId: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => "Hello world!",
    comments: async () => {
      const params = {
        TableName: process.env.graphQLTable
      };
      try {
        const result = await dynamoDbLib.call("query", params);
        if (result.Item) {
          // Return the retrieved item
          return success(result.Item);
        } else {
          return failure({ status: false, error: "Item not found." });
        }
      } catch (e) {
        console.log(e);
        return failure({ status: false });
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
