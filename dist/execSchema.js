import { readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as scalarTypeDefs, resolvers as scalarResolvers, mocks as scalarMocks, } from 'graphql-scalars';
import { addMocksToSchema } from '@graphql-tools/mock';
import { MovieORM } from './database/movie.js';
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
const getOpeningPhrase = ({ title, director, studio }) => {
    return `${studio} presents, ${title}, by ${director}`;
};
const resolvers = {
    Query: {
        movies: (parent, args, contextValue, info) => {
            return contextValue.dataSource.manager.find(MovieORM);
        }
    },
    Movie: {
        openingPhrase: getOpeningPhrase,
    },
};
const schema = makeExecutableSchema({
    typeDefs: [
        ...scalarTypeDefs,
        typeDefs
    ],
    resolvers: {
        ...scalarResolvers,
        ...resolvers,
    },
});
export const execSchema = schema;
export const mockedExecSchema = addMocksToSchema({
    schema,
    mocks: {
        ...scalarMocks
    }
});
