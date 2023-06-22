import {
  Environment,
  FetchFunction,
  Network,
  RecordSource,
  Store,
} from "relay-runtime";

const HTTP_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080/graphql";

function createRelayEnvironment(token: string | undefined) {
  const fetchFn: FetchFunction = async (request, variables) => {
    const headers: Record<string, string> = {
      Accept:
        "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const resp = await fetch(HTTP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: request.text, // <-- The GraphQL document composed by Relay
        variables,
      }),
    });

    return await resp.json();
  };

  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  });
}

let relayEnvironment: Environment | undefined;
let relayEnvironmentToken: string | undefined;

export function initRelayEnvironment(token: string | undefined) {
  // const environment = relayEnvironment ?? createRelayEnvironment(token);

  // For SSG and SSR always create a new Relay environment.
  if (typeof window === "undefined") {
    return createRelayEnvironment(token);
  }

  // Create the Relay environment once in the client
  // and then reuse it.
  if (!relayEnvironment || relayEnvironmentToken !== token) {
    relayEnvironment = createRelayEnvironment(token);
    relayEnvironmentToken = token;
  }

  return relayEnvironment;
}
