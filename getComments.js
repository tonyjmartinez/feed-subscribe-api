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
        TableName: process.env.graphQLTable,
        // 'Key' defines the partition key and sort key of the item to be retrieved
        // - 'userId': Identity Pool identity id of the authenticated user
        // - 'noteId': path parameter
        Key: {
          userId: event.requestContext.identity.cognitoIdentityId,
          commentId: event.pathParameters.id
        }
      };
      try {
        const result = await dynamoDbLib.call("get", params);
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
