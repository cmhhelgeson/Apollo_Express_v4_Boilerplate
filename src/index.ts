import { ApolloServer } from '@apollo/server';
import {expressMiddleware} from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { readFileSync } from 'fs';
import { Resolvers } from '__generated__/resolvers-types';
import http from 'http'
import cors from "cors"
import express from "express"
import pkg from "body-parser"
const {json} = pkg;
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { 
  PositiveFloatTypeDefinition, 
  PositiveFloatResolver, 
  PositiveFloatMock,
  EmailAddressTypeDefinition,
  EmailAddressResolver,
  EmailAddressMock
} from 'graphql-scalars';

/* Use imports below to add typedefs, resolvers, and mocks for 
all graphql-scalars custom scalars */
//import {typeDefs as scalarTypeDefs} from "graphql-scalars"
//import {resolvers as scalarResolvers} from "graphql-scalars"
//import {mocks as scalarMocks} from "graphql-scalars"

//Initialize Express Server
const app = express();
const httpServer = http.createServer(app);

//Create typedefs and default resolver
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
const resolvers: Resolvers = {
  Query: {
    users: () => {
      return [
        {
          id: "1", 
          firstName: "Christian", 
          lastName: "Helgeson", 
          email: "email@gmail.com"
        }
      ]
    }
  }
}

//Create schema and mocked schema
const schema = makeExecutableSchema({
  typeDefs: [
    //...scalarTypeDefs,
    PositiveFloatTypeDefinition,
    EmailAddressTypeDefinition,
    typeDefs
  ], 
  resolvers: {
    //...scalarResolvers,
    PositiveFloat: PositiveFloatResolver,
    EmailAddress: EmailAddressResolver,
    ...resolvers
  }
})

const mockedSchema = addMocksToSchema({
  schema, 
  mocks: {
    //...scalarMocks
    PositiveFloat: PositiveFloatMock,
    EmailAddress: EmailAddressMock
  }
})

//Apply schema and plugins to server
const server = new ApolloServer({
  schema: mockedSchema,
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