// server/index.js
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { loadFilesSync } = require("@graphql-tools/load-files");
const path = require("path");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, "./graphql/types"))
);
const resolvers = mergeResolvers(
  loadFilesSync(path.join(__dirname, "./graphql/resolvers"))
);
require("dotenv").config({ path: ".env" });
const apolloContext = require("./graphql/context");

const { graphqlUploadExpress } = require("graphql-upload");

const port = 4000;
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: apolloContext,
    tracing: true,
  });

  await server.start();
  const app = express();
  app.use(cors());
  // app.use(bodyParser.json());
  app.use(express.json());
  app.use(graphqlUploadExpress());
  app.use(express.static(path.join(__dirname, "public")));
  server.applyMiddleware({ app });

  const ret = await new Promise((r) =>
    app.listen({ port }, r).setTimeout(10 * 60 * 1000)
  );
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
}

startServer();
