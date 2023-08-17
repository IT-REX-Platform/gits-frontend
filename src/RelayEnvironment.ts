import { useAuth } from "react-oidc-context";
import {
  Environment,
  FetchFunction,
  Network,
  RecordSource,
  Store,
} from "relay-runtime";
useAuth;

const HTTP_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080/graphql";

function createFetchFn(token: string | undefined): FetchFunction {
  return async (request, variables) => {
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
}

let relayStore: Store | undefined;

export function initRelayEnvironment(token: string | undefined) {
  // For SSG and SSR always create a new Relay environment.
  if (typeof window === "undefined") {
    return new Environment({
      network: Network.create(createFetchFn(token)),
      store: new Store(new RecordSource()),
    });
  }

  // Create the Relay environment once in the client
  // and then reuse it.

  // init env
  if (!relayStore) {
    relayStore = new Store(new RecordSource());
  }

  return new Environment({
    network: Network.create(createFetchFn(token)),
    store: relayStore,
  });
}
