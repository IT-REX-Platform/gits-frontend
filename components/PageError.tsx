import { ErrorOutline } from "@mui/icons-material";
import { Heading } from "./Heading";

export function PageError({
  message,
  title,
}: {
  message: string;
  title?: string;
}) {
  return (
    <main className="h-full flex flex-col">
      <Heading title={title ?? "Unexpected error"} backButton />
      <DisplayError message={message} />
    </main>
  );
}

export function DisplayError({ message }: { message: string }) {
  return (
    <div className="grow flex flex-col justify-center items-center gap-4">
      <ErrorOutline fontSize="large" />
      <div className="max-w-[75%] text-lg font-light text-center">
        {message}
      </div>
    </div>
  );
}
