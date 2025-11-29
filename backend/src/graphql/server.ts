import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { env } from "../config/env";
import { authenticate } from "../middleware/auth";

export function setupGraphQL(app: any) {
  const server = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => ({ user: (req as any).user, supabase: (req as any).supabase }) });
  async function start() {
    await server.start();
    app.use(env.GRAPHQL_PATH, authenticate);
    server.applyMiddleware({ app, path: env.GRAPHQL_PATH });
  }
  start();
}