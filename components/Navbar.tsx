import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import { NavbarStudentFragment$key } from "@/__generated__/NavbarStudentFragment.graphql";
import { NavbarLecturerFragment$key } from "@/__generated__/NavbarLecturerFragment.graphql";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import logo from "@/assets/logo.svg";
import { CollectionsBookmark, Dashboard, Logout } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { useAuth } from "react-oidc-context";
import React, { ReactElement } from "react";

function NavbarBase({ children }: { children: any }) {
  const currentPath = window.location.pathname;

  return (
    <div className="bg-slate-200 h-full px-8 flex flex-col gap-6 w-96 overflow-auto">
      <div className="text-center my-8 text-3xl font-medium tracking-wider sticky">
        <img src={logo.src} className="w-24 m-auto" />
      </div>
      <NavbarSection>
        <NavbarLink
          title="Dashboard"
          icon={<Dashboard />}
          href="/"
          isActive={currentPath === "/"}
        />
        <NavbarLink
          title="Course Catalog"
          icon={<CollectionsBookmark />}
          href="/join"
          isActive={currentPath === "/join"}
        />
      </NavbarSection>
      {children}
      <UserInfo />
    </div>
  );
}

function NavbarSection({ children, title }: { children: any; title?: string }) {
  return (
    <div className="bg-white rounded-lg">
      <List
        subheader={
          title ? (
            <ListSubheader className="rounded-lg">{title}</ListSubheader>
          ) : undefined
        }
      >
        {children}
      </List>
    </div>
  );
}

function NavbarLink({
  icon,
  title,
  href,
  isActive = false,
}: {
  icon?: ReactElement;
  title: string;
  href: string;
  isActive?: boolean;
}) {
  const router = useRouter();
  return (
    <div
      className={`relative ${
        isActive ? "bg-gradient-to-r from-gray-100 to-transparent" : ""
      }`}
    >
      {isActive && (
        <div className="absolute w-2 inset-y-0 -left-2 bg-sky-800 rounded-l"></div>
      )}
      <ListItemButton onClick={() => router.push(href)}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={title} />
      </ListItemButton>
    </div>
  );
}

function UserInfo() {
  const auth = useAuth();
  return (
    <div className="sticky bottom-0 py-6 -mt-6 bg-gradient-to-t from-slate-200 from-75% to-transparent">
      <NavbarSection>
        <ListItem
          secondaryAction={
            <Tooltip title="Logout" placement="left">
              <IconButton
                edge="end"
                aria-label="logout"
                onClick={() => auth.signoutRedirect()}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          }
        >
          <ListItemAvatar>
            <Avatar src={auth.user?.profile?.picture} />
          </ListItemAvatar>
          <ListItemText primary={auth.user?.profile?.name} />
        </ListItem>
      </NavbarSection>
    </div>
  );
}

function StudentNavbar({ _query }: { _query: NavbarStudentFragment$key }) {
  const { allCourses } = useFragment(
    graphql`
      fragment NavbarStudentFragment on Query {
        allCourses: courses {
          elements {
            id
            title
          }
        }
      }
    `,
    _query
  );

  const currentPath = window.location.pathname;
  return (
    <NavbarBase>
      <NavbarSection title="Courses I'm attending">
        {allCourses.elements.map((course) => (
          <NavbarLink
            key={course.id}
            title={course.title}
            href={`/course/${course.id}`}
            isActive={currentPath.startsWith(`/course/${course.id}`)}
          />
        ))}
      </NavbarSection>
    </NavbarBase>
  );
}

function LecturerNavbar({ _query }: { _query: NavbarLecturerFragment$key }) {
  const { allCourses } = useFragment(
    graphql`
      fragment NavbarLecturerFragment on Query {
        allCourses: courses {
          elements {
            id
            title
          }
        }
      }
    `,
    _query
  );

  const currentPath = window.location.pathname;
  return (
    <NavbarBase>
      <NavbarSection title="Courses I'm tutoring">
        {allCourses.elements.map((course) => (
          <NavbarLink
            key={course.id}
            title={course.title}
            href={`/course/${course.id}`}
            isActive={currentPath.startsWith(`/course/${course.id}`)}
          />
        ))}
      </NavbarSection>
    </NavbarBase>
  );
}

export function Navbar() {
  const query = useLazyLoadQuery<NavbarQuery>(
    graphql`
      query NavbarQuery {
        ...NavbarStudentFragment
        ...NavbarLecturerFragment
      }
    `,
    {}
  );

  const pathname = usePathname();
  return pathname.includes("student") ? (
    <StudentNavbar _query={query} />
  ) : (
    <LecturerNavbar _query={query} />
  );
}
