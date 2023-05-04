import { createSchema, createYoga } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

export const schema = createSchema({
  typeDefs: readFileSync("../src/schema.graphql").toString(),
  resolvers: {
    Course: {
      flashcards() {
        return [];
      },
    },
    Query: {
      course() {
        return {
          id: "abc",
          name: "Machine Learning",
          description: `Machine learning (ML) is a field devoted to understanding and building methods that let machines "learn" – 
          that is, methods that leverage data to improve computer performance on some set of tasks.
          It is seen as a broad subfield of artificial intelligence`,
        };
      },
      courses() {
        return [
          {
            id: "a",
            name: "Machine Learning",
            description: "Long description about Machine Learning course.",
          },
          {
            id: "b",
            name: "Cloud Computing",
            description: "Long description about Cloud Computing course.",
          },
          {
            id: "c",
            name: "Embedded Systems Engineering",
            description:
              "Long description about Embedded Systems Engineering course.",
          },
        ];
      },
    },
  },
});

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema });

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
