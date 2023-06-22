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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  AuthProvider,
  AuthProviderProps,
  hasAuthParams,
  useAuth,
} from "react-oidc-context";
import { RelayEnvironmentProvider } from "react-relay";
import { RecordSource } from "relay-runtime";

const oidcConfig: AuthProviderProps = {
  redirect_uri:
    process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL ?? "http://localhost:3005",
  client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? "gits-frontend",
  authority:
    process.env.NEXT_PUBLIC_OAUTH_AUTHORITY ??
    "http://localhost:9009/realms/GITS",

  onSigninCallback() {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export default function App(props: AppProps<RelayPageProps>) {
  return (
    <AuthProvider {...oidcConfig}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Suspense fallback="Loading...">
          <SigninContent {...props} />
        </Suspense>
      </LocalizationProvider>
    </AuthProvider>
  );
}

function SigninContent({ pageProps, Component }: AppProps<RelayPageProps>) {
  const auth = useAuth();

  const environment = useMemo(
    () => initRelayEnvironment(auth.user?.access_token),
    [auth.user?.access_token]
  );

  // re-hydrate the relay store (requires special getServerSide... https://github.com/vercel/next.js/blob/canary/examples/with-relay-modern/pages/index.js)
  useEffect(() => {
    const store = environment.getStore();
    // Hydrate the store.
    store.publish(new RecordSource(pageProps.initialRecords));
    // Notify any existing subscribers.
    store.notify();
  }, [environment, pageProps.initialRecords]);

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
      <RelayEnvironmentProvider environment={environment}>
        <div className="grid grid-cols-[auto_1fr] h-[100vh] overflow-hidden">
          <Navbar />
          <div className="overflow-auto">
            <Component {...pageProps} />
          </div>
        </div>
      </RelayEnvironmentProvider>
    );
  }

  return <div>Logging in...</div>;
}
