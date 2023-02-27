import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from "cors";
import express from "express";
import pkg from "body-parser";
const { json } = pkg;
//NOTE: Node.js does not allow directory imports
import { AppDataSource } from "./database/dataSource.js";
import { execSchema } from './execSchema.js';
//Create Express app/server
const app = express();
const httpServer = http.createServer(app);
//Apply schema and plugins to server
const server = new ApolloServer({
    schema: execSchema,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});
await AppDataSource.initialize().then(async () => {
    console.log("Postgres TypeORM Database initialized");
}).catch(error => console.log(error));
//Start server
await server.start();
//Cors Options
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};
//Apply express middleware
app.use('/graphql', cors(corsOptions), json(), expressMiddleware(server, {
    context: async () => ({ dataSource: AppDataSource })
}));
const port = Number.parseInt(process.env.PORT) || 8000;
await new Promise((resolve) => httpServer.listen({ port: port }, resolve));
console.log(`🚀 Server listening at: ${port}`);
