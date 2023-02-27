import { readFileSync } from 'fs';
import { Resolvers, Movie} from '__generated__/schema-types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { 
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
  mocks as scalarMocks,
} from 'graphql-scalars';
import { addMocksToSchema } from '@graphql-tools/mock';
//NOTE: Node.js does not allow directory imports
import { AppDataSource } from "./database/dataSource.js"
import { MovieORM } from './database/movie.js';

export interface MyContext {
  dataSource: typeof AppDataSource
}

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

const getOpeningPhrase = ({title, director, studio}: Movie) => {
  return `${studio} presents, ${title}, by ${director}`
}

const resolvers: Resolvers = {
  Query: {
    movies: (parent, args, contextValue: MyContext, info) => {
      return contextValue.dataSource.manager.find(MovieORM);
    }
  },
  Movie: {
    openingPhrase: getOpeningPhrase,
  },
  Mutation: {
    addMovie: (parent, args, contextValue: MyContext, info) => {
      const {title, director, studio, year} = args.input;
      const movie = new MovieORM();
      movie.director = director;
      movie.title = title;
      movie.year = year;
      movie.studio = studio;
      return movie;
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs: [
    ...scalarTypeDefs,
    typeDefs
  ], 
  resolvers: {
    ...scalarResolvers,
    ...resolvers,
  },
})

export const execSchema = schema;

export const mockedExecSchema = addMocksToSchema({
  schema,
  mocks: {
    ...scalarMocks
  }
})