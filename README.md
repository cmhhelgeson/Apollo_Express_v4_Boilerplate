<h1>Disclaimer</h1>

NOTE: This boilerplate combines the official documented boilerplate of many of the utilized packages. If you have any issues, consult the boilerplate listed on these websites: 

https://the-guild.dev/graphql/scalars/docs/quick-start
https://the-guild.dev/graphql/scalars/docs/usage/apollo-server
https://www.apollographql.com/docs/apollo-server/api/express-middleware/
https://www.apollographql.com/docs/apollo-server/workflow/generate-types

<h1>Boilerplate Tutorial</h1>
Copy or clone the package.json and tsconfig.json files, and create the codgen.yml file.

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