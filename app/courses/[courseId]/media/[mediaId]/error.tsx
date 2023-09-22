"use client";

import { PageError } from "@/components/PageError";
import { cleanupErrorMessage } from "@/src/utils";

export default function MediaError({ error }: { error: Error }) {
  return <PageError message={cleanupErrorMessage(error.message)} />;
}
