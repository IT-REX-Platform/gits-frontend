# gits-frontend

Local dev environment setup for the frontend of the GITS project. Should not be used in production environments.

## Getting Started

This will contain a description on how get started to work as a frontend developer.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16.14 or higher)
  We use pnpm as a package manager, but npm and yarn should work as well. If you want to use pnpm, you can install it with `npm install -g pnpm`. npm is installed with Node.js, and yarn can be installed with `npm install -g yarn`.
- [TypeScript](https://www.typescriptlang.org/) (v5.0.4)
  The project uses Typescript to add typed programming to the frontend. TypeScript is installed with the project, so you don't need to install it yourself.
- [Next.js](https://nextjs.org/) (v13.4.7 or higher)
  Next.js is a React framework that we use to build the frontend. It is installed with the project, so you don't need to install it yourself. We implement some of the features and use the structure of v14 of Next.js. Please refer to the [Next.js documentation](https://nextjs.org/docs) for more information.
- [React](https://reactjs.org/) (v17.0.2 or higher)
  React is a JavaScript library for building user interfaces. It is installed with the project, so you don't need to install it yourself. Please refer to the [React documentation](https://reactjs.org/docs/getting-started.html) for more information.

Before you run the project you need to install the dependencies and create the graphql files. You can do this by running the following commands:

```bash
npm run install
# or
yarn install
# or
pnpm install
```

This will install all the dependencies for the project. After this you need to create the graphql files. You can do this by running the following command:

```bash
npm run relay
# or
yarn relay
# or
pnpm relay
```

This will create the graphql files for all queries and mutations. You need to run this command every time you change a graphql query or mutation.
Should the graphql schema change, you need to run the following command:

```bash
npm run update-schema
# or
yarn update-schema
# or
pnpm update-schema
```

This will update the graphql schema by running to seperate commands: `fetch-graphql-schema http://orange.informatik.uni-stuttgart.de/graphql -o src/schema.graphql -r && sed -i 's/Assessment,/Assessment \\&/' src/schema.graphql`. You need to run this command every time the graphql schema changes. Should the command for some reason not work, you can run the two commands seperately or run only the `fetch-graphql-schema` part of the command. If you run only the first part, you have to go to the schema file and change the "Assessment," to "Assessment &" at every place where it occurs.

After everything was installed, updated and created, you can run the project with the following command:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

This will start the development server on [http://localhost:3005](http://localhost:3005). You can now open this link in your browser and see the project running, if you are connected to the university vpn. The page will automatically reload if you make changes to the code. You will see the build errors and lint errors in the console.

### How to work with the project

For the frontend we use different technologies. We use React as a JavaScript library for building user interfaces. We use Next.js as a React framework that we use to build the frontend. We use TypeScript to add typed programming to the frontend. We use GraphQL to communicate with the backend. We use Tailwind CSS as a utility-first CSS framework. We use ESLint as a linting utility for JavaScript and TypeScript. We use Prettier as a code formatter. We use Husky as a git hook utility. We use lint-staged as a utility to run scripts on staged files in git. We use pnpm as a package manager.

More information about the technologies can be found on the respective websites:

- [React](https://reactjs.org/docs/getting-started.html)
- [Next.js](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [GraphQL](https://graphql.org/learn/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ESLint](https://eslint.org/docs/user-guide/getting-started)
- [Prettier](https://prettier.io/docs/en/index.html)
- [Husky](https://typicode.github.io/husky/#/)
- [pnpm](https://pnpm.io/)

We recommend you work on this project with an IDE of your choice.
