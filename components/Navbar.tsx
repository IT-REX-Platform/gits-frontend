import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

function NavItemGroup({ children }: { children: JSX.Element[] | undefined }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

function NavItem({ label, href }: { label: string; href: string }) {
  const active = usePathname() === href;

  return (
    <Link
      href={href}
      className={
        "py-2 px-3 rounded text-medium " +
        (active ? "bg-sky-700" : "bg-sky-900 hover:bg-sky-800")
      }
    >
      {label}
    </Link>
  );
}

function NavHeader({ label }: { label: string }) {
  return <div className="mt-4 mb-2 text-medium font-bold">{label}</div>;
}

export function Navbar() {
  const query = useLazyLoadQuery<NavbarQuery>(
    graphql`
      query NavbarQuery {
        courses {
          id
          name
        }
      }
    `,
    {}
  );
  return (
    <nav className="bg-sky-950 text-slate-200 w-64 min-h-screen flex flex-col px-4">
      <div className="text-center my-4 text-3xl font-black tracking-wider">
        GITS
      </div>

      <NavItemGroup>
        <NavItem label="Home" href="/" />
        <NavItem label="Join course" href="/join" />
      </NavItemGroup>

      <NavHeader label="My Courses" />
      <NavItemGroup>
        {query.courses?.map((course) => (
          <NavItem
            key={course?.id}
            label={course?.name ?? "Unnamed course"}
            href={`/course/${course!.id}`}
          />
        ))}
      </NavItemGroup>
    </nav>
  );
}
