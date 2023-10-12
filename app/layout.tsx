"use client";

import "@/styles/globals.css";
import React, { useEffect, useMemo } from "react";

import { PageLayout } from "@/components/PageLayout";
import { initRelayEnvironment } from "@/src/RelayEnvironment";
import { PageViewProvider } from "@/src/currentView";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeProvider, colors, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  AuthProvider,
  AuthProviderProps,
  hasAuthParams,
  useAuth,
} from "react-oidc-context";
import { RelayEnvironmentProvider } from "react-relay";
import PageLoading from "./loading";

dayjs.extend(isBetween);

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

const theme = createTheme({
  palette: {
    success: colors.green,
  },
  typography: {
    h1: {
      fontSize: "2rem",
      fontWeight: "400",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: "400",
    },
  },
});

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full overflow-hidden">
      <body className="h-full">
        <AuthProvider {...oidcConfig}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DndProvider backend={HTML5Backend}>
              <SigninContent>
                <PageViewProvider>
                  <PageLayout>{children}</PageLayout>
                </PageViewProvider>
              </SigninContent>
            </DndProvider>
          </LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function SigninContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const environment = useMemo(
    () => initRelayEnvironment(auth.user?.access_token),
    [auth.user?.access_token]
  );

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
    auth,
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
    return <PageLoading />;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </RelayEnvironmentProvider>
    );
  }

  return <div>Logging in...</div>;
}
