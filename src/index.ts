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
import { AppDataSource } from "./database/dataSource.js"
import { Grids } from './database/entities/grids.js'
import localDatabase from './localDatabase.js';

/* Use imports below to add individual typedefs, resolvers, and mocks for 
each graphql-scalar custom scalar.
import {
  PositiveIntMock,
  PositiveIntResolver,
  PositiveIntTypeDefinition
} from "graphql-scalars"
*/

interface MyContext {
  dataSource: typeof AppDataSource
}

//Create Express app/server
const app = express();
const httpServer = http.createServer(app);

//Create typedefs and default resolver
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

const getUsers = (): Array<User> => {
  return Array.from(localDatabase.users.values())
}

const getPosts = (): Array<Post> => {
  return Array.from(localDatabase.posts.values())
}

const computeName = (user: User): string => {
  console.log(user);
  return `${user.firstName} ${user.lastName}`
}

const getPostsByUser = ({id}: User): Array<Post> => {
  const posts = Array.from(localDatabase.posts.values());
  const filteredPosts = posts.filter((post) => post.authorID === id);
  console.log(filteredPosts)
  return filteredPosts;
}

const getAuthorOfPost = ({authorID}: Post): User | undefined => {
  return localDatabase.users.get(parseInt(authorID));
}

const resolvers: Resolvers = {
  Query: {
    users: getUsers,
    posts: getPosts,
    grids: (parent, args, contextValue: MyContext, info) => {
      return contextValue.dataSource.manager.find(Grids);
    }
  },
  User: {
    name: computeName,
    posts: getPostsByUser
  },
  Post: {
    author: getAuthorOfPost
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
const server = new ApolloServer<MyContext>({
  schema: schema,
  plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
});

await AppDataSource.initialize().then(async () => {
  console.log("Postgres TypeORM Database initialized");
  const grid = new Grids()
    grid.data = [
      [1, 2, 2, 3, 5],
      [3, 2, 3, 4, 4],
      [2, 4, 5, 3, 1],
      [6, 7, 1, 4, 5],
      [5, 1, 1, 2, 4]
    ];
    grid.label = "Pacific Atlantic Waterflow"
    grid.problemNumber = 417;
    await AppDataSource.manager.save(grid);
})

//Start server
await server.start();

//Apply express middleware
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  json(),
  expressMiddleware(server, {
    context: async () => ({dataSource: AppDataSource})
  })
)

await new Promise<void>((resolve) => httpServer.listen({port: 8000}, resolve));
console.log(`🚀 Server listening at: 8000`);