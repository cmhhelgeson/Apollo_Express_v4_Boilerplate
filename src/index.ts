import { ApolloServer } from '@apollo/server';
import {expressMiddleware} from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { readFileSync } from 'fs';
import { Post, Resolvers, User } from '__generated__/resolvers-types';
import http from 'http'
import cors from "cors"
import express from "express"
import pkg from "body-parser"
const {json} = pkg;
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { 
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
  mocks as scalarMocks,
} from 'graphql-scalars';
import users from "./database.js"
import database from './database.js';

/* Use imports below to add individual typedefs, resolvers, and mocks for 
each graphql-scalar custom scalar.
import {
  PositiveIntMock,
  PositiveIntResolver,
  PositiveIntTypeDefinition
} from "graphql-scalars"
*/

//Create Express app/server
const app = express();
const httpServer = http.createServer(app);

//Create typedefs and default resolver
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

const getUsers = (): Array<User> => {
  return Array.from(database.users.values())
}

const getPosts = (): Array<Post> => {
  return Array.from(database.posts.values())
}

const computeName = (user: User): string => {
  console.log(user);
  return `${user.firstName} ${user.lastName}`
}

const getPostsByUser = ({id}: User): Array<Post> => {
  const posts = Array.from(database.posts.values());
  const filteredPosts = posts.filter((post) => post.authorID === id);
  console.log(filteredPosts)
  return filteredPosts;
}



const resolvers: Resolvers = {
  Query: {
    users: getUsers,
    posts: getPosts,
  },
  User: {
    name: computeName,
    posts: getPostsByUser
  }
}

//Create schema and mocked schema
const schema = makeExecutableSchema({
  typeDefs: [
    ...scalarTypeDefs,
    typeDefs
  ], 
  resolvers: {
    ...scalarResolvers,
    ...resolvers
  }
})

const mockedSchema = addMocksToSchema({
  schema, 
  mocks: {
    ...scalarMocks
  }
})

//Apply schema and plugins to server
const server = new ApolloServer({
  schema: schema,
  plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
});

//Start server
await server.start();

//Apply express middleware
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  json(),
  expressMiddleware(server)
)

await new Promise<void>((resolve) => httpServer.listen({port: 8000}, resolve));
console.log(`🚀 Server listening at: 8000`);