const { ApolloServer, gql } = require("apollo-server-lambda");
// import * as dynamoDbLib from "./libs/dynamodb-lib";
import { promisify } from "./util";
// import { success, failure } from "./libs/response-lib";
const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();
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
        TableName: process.env.tableName
      };
      try {
        return promisify(callback => {
          dynamoDb.scan(params, (error, result) => {
            if (error) {
              console.error(error);
              callback(null, {
                statusCode: error.statusCode || 501,
                headers: { "Content-Type": "text/plain" },
                body: error.toString()
              });
              return;
            }

            const response = {
              statusCode: 200,
              body: JSON.stringify(result.Items)
            };
            callback(null, response);
          });
        });

        // dynamoDbLib
        //   .call("query", params)
        //   .then(data => resolve(data.items))
        //   .catch(e => resolve([{ userId: e.toString(), content: e }]));
        // const result = {
        //   Items: [{ userId: "tony", commentId: "comment" }]
        // };
      } catch (e) {
        return [e.toString()];
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
