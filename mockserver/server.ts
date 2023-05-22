import { createSchema, createYoga } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const courses = [
  {
    id: "a",
    title: "Machine Learning",
    role: "Lecturer",
    description: "Long description about Machine Learning course.",
  },
  {
    id: "b",
    title: "Cloud Computing",
    role: "Lecturer",
    description: "Long description about Cloud Computing course.",
  },
  {
    id: "c",
    title: "Embedded Systems Engineering",
    role: "Lecturer",
    description: "Long description about Embedded Systems Engineering course.",
  },
  {
    id: "d",
    title: "System and Web Security",
    role: "Lecturer",
    description: "Long description about System and Web Security course.",
  },
  {
    id: "e",
    title: "Software Engineering for AI Based Systems",
    role: "Lecturer",
    description:
      "Long description about Software Engineering for AI Based Systems course.",
  },
  {
    id: "f",
    title: "Digital System Design",
    role: "Lecturer",
    description: "Long description about Digital System Design course.",
  },
  {
    id: "g",
    title: "Theoretische Informatik 3",
    role: "Lecturer",
    description: "Long description about Theoretische Informatik 3 course.",
  },
  {
    id: "x",
    title: "Post Quantum Cryptography",
    role: "Lecturer",
    description: "Long description about Post Quantum Cryptography course.",
  },
  {
    id: "h",
    title: "Datenbanken 2",
    role: "Lecturer",
    description: "Long description about Datenbanken 2 course.",
  },
  {
    id: "i",
    title: "Datenbanken 1",
    role: "Lecturer",
    description: "Long description about Datenbanken 1 course.",
  },
  {
    id: "j",
    title: "Technische Grundlagen der Informatik",
    role: "Lecturer",
    description:
      "Long description about Technische Grundlagen der Informatik course.",
  },
  {
    id: "k",
    title: "Distributed Systems 2",
    role: "Lecturer",
    description: "Long description about Distributed Systems 2 course.",
  },
];

export const schema = createSchema({
  typeDefs: readFileSync("../src/schema.graphql").toString(),
  resolvers: {
    Query: {
      currentUser() {
        return {
          id: "userid",
          username: "hubbi-b",
          email: "hubbi@gmx.de",
          firstName: "Hubert",
          lastName: "Bertram",
          coursesJoined: courses.slice(0, 3),
          coursesOwned: courses.slice(4, 6),
          role: "Student",
        };
      },

      courses() {
        return courses;
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
