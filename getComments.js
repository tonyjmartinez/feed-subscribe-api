const { ApolloServer, gql } = require("apollo-server-lambda");
// import * as dynamoDbLib from "./libs/dynamodb-lib";
// import { promisify } from "./util";
// import { success, failure } from "./libs/response-lib";
const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Comment {
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
        TableName: process.env.tableName,
        AttributesToGet: ["content"]
      };
      try {
        return dynamoDb.scan(params, function(err, data) {
          if (err) {
            console.error(err);
          } else {
            console.log(data.Items);
            return data.Items;
          }
        });
        // return [{ userId: "tony", commentId: "comment" }];

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
