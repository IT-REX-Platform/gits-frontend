import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Suspense, useEffect, useMemo } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { RecordSource } from "relay-runtime";
import { initRelayEnvironment } from "../src/RelayEnvironment";
import { RelayPageProps } from "../src/relay-types";

import { Navbar } from "@/components/Navbar";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export default function App({
  Component,
  pageProps,
}: AppProps<RelayPageProps>) {
  const environment = useMemo(initRelayEnvironment, []);

  useEffect(() => {
    const store = environment.getStore();

    // Hydrate the store.
    store.publish(new RecordSource(pageProps.initialRecords));

    // Notify any existing subscribers.
    store.notify();
  }, [environment, pageProps.initialRecords]);

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading...">
        <div className="grid grid-cols-[auto_1fr] h-[100vh]">
          <Navbar />
          <Component {...pageProps} />
        </div>
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
