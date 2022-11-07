import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import crypto from 'node:crypto'

interface UserInterface {
    id: String,
    name: String,
    email: String
}

export class GraphQlServer {

    typeDefs = gql`
    type User {
        id: String,
        name: String,
        email: String
    }

    type Query {
        listUsers: [User]!
    }

    type Mutation{
        createAnything(name: String!, email: String!): String!
    }
    `
    port: number = 4000

    usersList: UserInterface[] = []

    constructor() { }

    async startServer() {
        const app = express()
        const httpServer = http.createServer(app)

        const server = new ApolloServer({
            typeDefs: this.typeDefs,
            resolvers: {
                Query: {
                    listUsers: () => {
                        return this.usersList
                    }
                },

                Mutation: {
                    createAnything: (parent, args, ctx) => {
                        let id = crypto.randomUUID()
                        let ui: UserInterface = {id, name: args.name, email: args.email}
                        this.usersList.push(ui)
                        return id
                    }
                }
            },
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        })

        await server.start()
        server.applyMiddleware({ app })

        httpServer.listen(this.port, () => { console.log('start server on http://localhost:4000/graphql') })

    }

}