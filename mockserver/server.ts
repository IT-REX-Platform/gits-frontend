import { createSchema, createYoga } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const courses = [
  {
    id: "a",
    title: "Machine Learning",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Machine Learning course.",
  },
  {
    id: "b",
    title: "Cloud Computing",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Cloud Computing course.",
  },
  {
    id: "c",
    title: "Embedded Systems Engineering",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Embedded Systems Engineering course.",
  },
  {
    id: "d",
    title: "System and Web Security",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about System and Web Security course.",
  },
  {
    id: "e",
    title: "Software Engineering for AI Based Systems",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description:
      "Long description about Software Engineering for AI Based Systems course.",
  },
  {
    id: "f",
    title: "Digital System Design",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Digital System Design course.",
  },
  {
    id: "g",
    title: "Theoretische Informatik 3",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Theoretische Informatik 3 course.",
  },
  {
    id: "x",
    title: "Post Quantum Cryptography",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Post Quantum Cryptography course.",
  },
  {
    id: "h",
    title: "Datenbanken 2",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Datenbanken 2 course.",
  },
  {
    id: "i",
    title: "Datenbanken 1",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Datenbanken 1 course.",
  },
  {
    id: "j",
    title: "Technische Grundlagen der Informatik",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description:
      "Long description about Technische Grundlagen der Informatik course.",
  },
  {
    id: "k",
    title: "Distributed Systems 2",
    currentUserRole: "Lecturer",
    startDate: "2023-01-01",
    endDate: "2023-12-12",
    published: true,
    description: "Long description about Distributed Systems 2 course.",
  },
];

let nextId = 0;

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
          role: "Lecturer",
        };
      },

      courses() {
        return courses;
      },

      coursesById(parent, args: { ids: string[] }) {
        return courses.filter((course) => args.ids.includes(course.id));
      },
    },
    Mutation: {
      createCourse(parent, args) {
        const newCourse = {
          id: nextId.toString(),
          ...args.input,
        };

        courses.push(newCourse);
        nextId += 1;

        return newCourse;
      },
      updateCourse(parent, args) {
        const index = courses.findIndex(
          (course) => course.id === args.input.id
        );
        courses[index] = args.input;
        return courses[index];
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
