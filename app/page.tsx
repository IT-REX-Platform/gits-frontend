import { redirect } from "next/navigation";

export default function page() {
  redirect("/student");

  return <div></div>;
}
