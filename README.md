TODO: Finish TypeORM explanation in README.

<h1>Disclaimer</h1>

>NOTE: This boilerplate combines and modifies the official documented boilerplate of many of the utilized packages. If you have any issues, consult the boilerplate listed on these websites: 

>[Apollo Server v4: Express Middleware API],
>[Apollo Server v4: Type Generation],
>[GraphQL-Scalars Quickstart], 
>[GraphQL-Scalars With Apollo Server]
>[TypeORM]

<h1>Basic Boilerplate Tutorial</h1>
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

NOTE: Remember to rerun CodeGen whenever you add new types to your schema.

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

To create our server, pass both your schema or mockedSchema and an array of optional plugins to a new Apollo Server object. 

Since our server will implement our expressMiddleware, it is highly recommended to add ApolloServerPluginDrainHttpServer as a plugin, with our express HTTP server as an argument. By adding this plugin, we ensure that the server closes idle connections if they are not in use. 

Once our server has been created, we can asynchronously await it's initialization.

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
  schema: schema, //or schema: mockedSchema
  plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
});

//Start server
await server.start();
```

Finally, once the server has started, we can pass it as an argument to our express Middleware, along with any other packages (cors, body-parser, etc.) we want our express application to use.

```ts
/* src/index.ts */
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

Now that our Apollo Server has been set up, we can call the server with our package's "start" script and listen to the server at localhost:8000/graphql.

<h1>Adding TypeORM with PSQL Connection</h1>
[TypeORM] is an object-relational mapper library that allows us to easily define types for our database that can also be referenced in our Typescript project. While TypeORM can easily be used with multiple relational database models, this project will use a simple PSQL connection.

<h3>Modifying package.json and tsconfig.json</h3>

To access typeorm and PSQL within your project, simply add the latest versions of typeorm and pg (the Node.js Postgres Client) using yarn or npm.

TypeORM depends on decorators to define table classes to the database. However, Typescript does not natively understand these decorators. To allow Typescript to parse and emit data from these decorators, add the emitDecoratorMetadata and experimentalDecorators fields to your tsconfig.json file.

```json
//tsconfig.json
{
  "compilerOptions" {
    //...
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    //..
  }
}
```

<h3>File Structure</h3>

Within our source folder...

```
MyProject
├── src                   // Source Folder
│   ├── database          // Location of all database models and connections
│   │   ├── entities      // Location where database models (entities) are stoerd
│   │   │   └── Grid.ts   // An entity modeling a grid
│   │   ├── dataSource.ts // File where we configure our connection to the database
│   ├── index.ts          // Start point of our Apollo Server v4 application    
├── .gitignore            // GITIGNORE
├── package.json          // module dependencies
├── README.md             // README
└── tsconfig.json         // Typescript compiler options/directives
```

<h3>Definining TypeORM Entities</h3>

The code below provides an example for how one might define a PSQL table within TypeORM.

```ts
/* src/database/entities/grid.ts */
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

//The @Entity decorator will create a database table
@Entity({name: "grid"})
export class Grid {
    // Primary Generated Column will automatically generate a primary key column for our table.
    // By default, @PrimaryGeneratedColumn() will automatically generate an increasing sequence of
    // numbers. However, we can instead generate a unique uuid for each primary key by passing
    // "pgcrypto" to the decorator.
    @PrimaryGeneratedColumn("pgcrypto")
    gridId: string

    //Here we define a column within our "grid" table, its name ("problemNumber"), and its corresponding
    //Typescript type
    @Column()
    problemNumber: number

    //We can be more granular with our column definition by describing the specific type we want our PSQL
    //database to use alongside its corresponding Typescript Type.
    @Column("smallint")
    width: number

    @Column("smallint")
    height: number

    //Defining a column with type equivalent to VARCHAR(255)
    @Column({length: 255})
    label: string

    //Defining a 2d array of ints
    @Column("int", {array: true})
    data: number[][]

    @Column({length: 255})
    interpretAs: string
}
```

Once our database table has been defined, we need to provide an equivalent definition in our GraphQL Schema (NOTE: This can also be expedited with the use of Type-GraphQL, if you want your GraphQL types to be strictly tied to your database types)

```graphql
"""schema.graphql"""
scalar PositiveFloat
scalar PositiveInt
scalar EmailAddress
scalar UUID

type User {
  ...
}

type Grid {
  gridId: UUID!
  label: String
  width: PositiveInt!
  height: PositiveInt!
  problemNumber: PositiveInt!
  interpretAs: String!
  data: [[Int]]
}

type Query {
  users: [User]
  grids: [Grid] 
}
```

<h3>Creating our Database DataSource</h3>

```ts
/* src/database/dataSource.ts */
import { DataSource } from "typeorm"
import { Grid} from "./entities/grid.js"
import { psqlPassword, psqlUsername, psqlDatabase} from "./envVars.js"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: `${psqlUsername}`,
    password: `${psqlPassword}`,
    database: `${psqlDatabase}`,
    synchronize: false,
    logging: true,
    entities: [Grid],
    migrations: [],
    subscribers: [],
})
```

<h3>Creating resolvers for database types and applying DataSource to Apollo Server</h3>

NOTE: Run Codegen so your Typescript files will have access to the new Grid Type.

```ts
/* src/index.ts */
import {AppDataSource} from "./database/dataSource.js"
interface MyContext = {
  dataSource: typeof AppDataSource
}

//...

const resolvers: Resolvers = {
  Query: {
    users: ...,
    posts: getPosts,
    grids: (parent, args, contextValue: MyContext, info) => {
      return contextValue.dataSource.manager.find(Grids);
    }
  },
}

//...

//Apply schema and plugins to server
const server = new ApolloServer<MyContext>({
  schema: schema,
  plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
});

await AppDataSource.initialize().then(() => {
  console.log("Postgres TypeORM Database initialized");
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
```


[apollo server v4: express middleware api]: <https://www.apollographql.com/docs/apollo-server/api/express-middleware/>

[apollo server v4: type generation]: <https://www.apollographql.com/docs/apollo-server/workflow/generate-types>

[graphql-scalars quickstart]: <https://the-guild.dev/graphql/scalars/docs/quick-start>

[graphql-scalars with apollo server]: <https://the-guild.dev/graphql/scalars/docs/usage/apollo-server>

[typeorm]: https://typeorm.io/

