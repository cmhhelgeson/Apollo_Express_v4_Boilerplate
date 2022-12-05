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
Now that we have set-up our environment, we can begin to define our top-level schema. 

In order to use the custom scalars defined within the graphql-scalars library, we'll need to make adjustments to two of our files. 

First, in codegen.yml, we'll need to add a config field that resolves custom types from graphql-scalars into types that CodeGen natively understands.

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

We'll also need to define these scalars on the first lines of our schema.graphql file.

```graphql
scalar PositiveFloat

scalar EmailAddress

type User {
  id: ID!
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



[apollo server v4: express middleware api]: <https://www.apollographql.com/docs/apollo-server/api/express-middleware/>

[apollo server v4: type generation]: <https://www.apollographql.com/docs/apollo-server/workflow/generate-types>

[graphql-scalars quickstart]: <https://the-guild.dev/graphql/scalars/docs/quick-start>

[graphql-scalars with apollo server]: <https://the-guild.dev/graphql/scalars/docs/usage/apollo-server>

