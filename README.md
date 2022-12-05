<h1>Disclaimer</h1>

>NOTE: This boilerplate combines the official documented boilerplate of many of the utilized packages. If you have any issues, consult the boilerplate listed on these websites: 
[Apollo Server v4: Express Middleware API],
[Apollo Server v4: Type Generation],
[GraphQL-Scalars Quickstart], 
[GraphQL-Scalars With Apollo Server]

<h1>Boilerplate Tutorial</h1>
Copy or clone the package.json and tsconfig.json files, and create the codgen.yml file.

<h3>Adding environment files</h3>

```yml
# This configuration file tells GraphQL Code Generator how to generate types based on our schema.

# The location of our top-level schema
schema: './schema.graphql'
generates:
  # Specify where our generated types should live.
  ./src/__generated__/resolvers-types.ts:
    # Two plugins that generate types from our schema and types for
    # our resolvers respectively
    plugins:
      - 'typescript'
      - 'typescript-resolvers'
```

<h3>Setting up GraphQL-Scalars</h3>
Now that we've setup our environment, we can begin to define our top-level schema. 

In order to use the custom scalars defined within the graphql-scalars library, we'll need to make adjustments to two of our files. 

First, in codegen.yml, we'll need to add a config field that resolves custom types from graphql-scalars into Basic Typescript Types.

```yml
# The location of our top-level schema
schema: './schema.graphql'
generates:
  ./src/__generated__/resolvers-types.ts:
    plugins:
      - 'typescript'
      - 'typescript-resolvers'
    config:
      # Extends the built-in scalars to a custom type
      scalars:
        PositiveInt: number
        EmailAddress: string
        UUID: string
```

We'll also need to define these scalars at the top of our schema file.

```graphql
"""schema.graphql"""
scalar PositiveFloat
scalar EmailAddress
scalar UUID

type User {
  id: UUID!
  firstName: String!
  lastName: String!
  age: PositiveFloat
  email: EmailAddress
}

type Query {
  users: [User]
}
```

<h3>Running CodeGen</h3>

Once our custom scalars are properly set up, you can generate your types by running `npm run generate` or `yarn run generate`.

Looking at our generated types file, we can see how CodeGen generates types for our queries and evaluates our custom scalars as native Typescript types.

```ts
/* src/resolvers-types.ts */
export type Scalars = {
  //ID, EmailAddress, and PositiveFloat have adopted the types
  //defined in our codegen.yml file!
  ID: string;
  EmailAddress: string;
  PositiveFloat: number;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

//Codegen automatically provides us with __typename, and types
//based on our schema and scalars.
export type User = {
  __typename?: 'User';
  age?: Maybe<Scalars['PositiveFloat']>;
  email?: Maybe<Scalars['EmailAddress']>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
};
```

<h3>Creating HTTP Server</h3>

Start by creating an express application and a httpServer that listens to it

```ts
/* src/index.ts */
import express from "express"
import http from "http"

...

const app = express()
const httpServer = http.createServer(app)

```

<h3>Creating Apollo Server Schema</h3>

Next, we need to extract typeDefinitions from our GraphQL schema and define a default resolver for our queries. We can ensure that our resolver code conforms to the shape of our schema by importing the Resolvers type defined in our generated types file. 

```ts
/* src/index.ts */
//Import file reading
import { readFileSync } from 'fs';
//Import Resolvers type from generated types file
import { Resolvers } from '__generated__/resolvers-types';

...

//Read typeDefs from our schema.graphl file
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

//Create resolvers object that conforms to Resolvers type
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

```

Now that our typeDefs and resolvers are created, we can pass them into the executable schema that will be passed to Apollo Server.

```ts
/* src/index.ts */
import { makeExecutableSchema } from '@graphql-tools/schema';
...
//Create schema and mocked schema
const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs
  ], 
  resolvers: {
    ...resolvers
  }
})
```

Creating a version of the schema that mocks values is as simple as passing the executable schema to addMocksToSchema().

```ts
/* src/index.ts */
import { addMocksToSchema } from '@graphql-tools/mock';
...
//Create mocked schema
const mockedSchema = addMocksToSchema({
  schema
})
```

<h3>Applying GraphQL-Scalars to Apollo Server Schema</h3>

The custom scalars in GraphQL-Scalars can either be applied to our schema individually or collectively. GraphQL-Scalars exposes a type definition, resolver, and mock function for each custom scalar type it defines.

<h5>Import Custom Scalars Individually</h5>

```ts
/* src/index.ts */
import {
  PositiveFloatTypeDefinition, 
  PositiveFloatResolver,
  PositiveFloatMock
} from "graphql-scalars"

const schema = makeExecutableSchema({
  typeDefs: [
    PositiveFloatTypeDefinition,
    typeDefs
  ], 
  resolvers: {
    PositiveFloat: PositiveFloatResolver,
    ...resolvers,
  }
})

const mockedSchema = addMocksToSchema({
  schema,
  mocks: {
    PositiveFloat: PositiveFloatMock,
    //EmailAddress: EmailAddressMock
  }
})
```

<h5>Import All GraphQL Scalars Collectively</h5>

```ts
/* src/index.ts */
import {typeDefs as gqlScalarTypeDefs} from "graphql-scalars"
import {resolvers as gqlScalarResolvers} from "graphql-scalars"
import {mocks as gqlScalarMocks} from "graphql-scalars"

const schema = makeExecutableSchema({
  typeDefs: [
    ...gqlScalarTypeDefs,
    typeDefs
  ], 
  resolvers: {
    ...gqlScalarResolvers,
    ...resolvers,
  }
})

const mockedSchema = addMocksToSchema({
  schema,
  mocks: {
    ...gqlScalarMocks
  }
})
```

<h3>Creating and starting Apollo Express Server</h3>

```ts
/* src/index.ts */
import { ApolloServer } from '@apollo/server';
import {expressMiddleware} from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from "cors"
import pkg from "body-parser"
const {json} = pkg;

...

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
```


[apollo server v4: express middleware api]: <https://www.apollographql.com/docs/apollo-server/api/express-middleware/>

[apollo server v4: type generation]: <https://www.apollographql.com/docs/apollo-server/workflow/generate-types>

[graphql-scalars quickstart]: <https://the-guild.dev/graphql/scalars/docs/quick-start>

[graphql-scalars with apollo server]: <https://the-guild.dev/graphql/scalars/docs/usage/apollo-server>

