import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Suspense, useEffect, useMemo } from "react";
import { RelayPageProps } from "../src/relay-types";

import { Navbar } from "@/components/Navbar";
import { initRelayEnvironment } from "@/src/RelayEnvironment";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  AuthProvider,
  AuthProviderProps,
  hasAuthParams,
  useAuth,
} from "react-oidc-context";
import { RelayEnvironmentProvider } from "react-relay";
import { RecordSource } from "relay-runtime";

const oidcConfig: AuthProviderProps = {
  redirect_uri: "http://localhost:3000",
  client_id: "gits-frontend",
  authority: "http://localhost:8080/auth/realms/GITS",

  onSigninCallback() {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export default function App(props: AppProps<RelayPageProps>) {
  const environment = useMemo(() => initRelayEnvironment(), []);

  // re-hydrate the relay store (requires special getServerSide... https://github.com/vercel/next.js/blob/canary/examples/with-relay-modern/pages/index.js)
  useEffect(() => {
    const store = environment.getStore();
    // Hydrate the store.
    store.publish(new RecordSource(props.pageProps.initialRecords));
    // Notify any existing subscribers.
    store.notify();
  }, [environment, props.pageProps.initialRecords]);

  return (
    <AuthProvider {...oidcConfig}>
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Loading...">
          <SigninContent {...props} />
        </Suspense>
      </RelayEnvironmentProvider>
    </AuthProvider>
  );
}

function SigninContent({ pageProps, Component }: AppProps<RelayPageProps>) {
  const auth = useAuth();

  // automatically sign-in
  useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading
    ) {
      auth.signinRedirect();
    }
  }, [
    auth.isAuthenticated,
    auth.activeNavigator,
    auth.isLoading,
    auth.signinRedirect,
  ]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="grid grid-cols-[auto_1fr] h-[100vh]">
        <Navbar />
        <Component {...pageProps} />
      </div>
    );
  }

  return <div>Logging in...</div>;
}
