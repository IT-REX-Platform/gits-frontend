"use client";
import { NavbarLecturerQuery } from "@/__generated__/NavbarLecturerQuery.graphql";
import { NavbarStudentQuery } from "@/__generated__/NavbarStudentQuery.graphql";
import logo from "@/assets/logo.svg";
import { PageView, usePageView } from "@/src/currentView";
import { CollectionsBookmark, Dashboard, Logout } from "@mui/icons-material";
import {
  Avatar,
  Divider,
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
import { usePathname, useRouter } from "next/navigation";
import { ReactElement } from "react";
import { useAuth } from "react-oidc-context";
import { graphql, useLazyLoadQuery } from "react-relay";

function NavbarBase({ children }: { children: React.ReactElement }) {
  return (
    <div className="shrink-0 bg-slate-200 h-full px-8 flex flex-col gap-6 w-96 overflow-auto">
      <div className="text-center my-16 text-3xl font-medium tracking-wider sticky">
        <img src={logo.src} className="w-24 m-auto" />
      </div>
      <NavbarSection>
        <NavbarLink title="Dashboard" icon={<Dashboard />} href="/" exact />
        <NavbarLink
          title="Course Catalog"
          icon={<CollectionsBookmark />}
          href="/courses"
          exact
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
  exact,
}: {
  icon?: ReactElement;
  title: string;
  href: string;
  exact?: boolean;
}) {
  const router = useRouter();
  const currentPath = usePathname();

  const isActive = exact ? currentPath == href : currentPath.startsWith(href);
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
  const [pageView, setPageView] = usePageView();

  function SwitchPageViewButton() {
    switch (pageView) {
      case PageView.Student:
        return (
          <ListItemButton onClick={() => setPageView(PageView.Lecturer)}>
            <ListItemText primary="Switch to lecturer view" />
          </ListItemButton>
        );
      case PageView.Lecturer:
        return (
          <ListItemButton onClick={() => setPageView(PageView.Student)}>
            <ListItemText primary="Switch to student view" />
          </ListItemButton>
        );
    }
  }

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

        <Divider></Divider>
        <SwitchPageViewButton />
      </NavbarSection>
    </div>
  );
}

export function StudentNavbar() {
  const { allCourses } = useLazyLoadQuery<NavbarStudentQuery>(
    graphql`
      query NavbarStudentQuery {
        allCourses: courses {
          elements {
            id
            title
          }
        }
      }
    `,
    {}
  );

  return (
    <NavbarBase>
      <NavbarSection title="Courses I'm attending">
        {allCourses.elements.map((course) => (
          <NavbarLink
            key={course.id}
            title={course.title}
            href={`/courses/${course.id}`}
          />
        ))}
      </NavbarSection>
    </NavbarBase>
  );
}

export function LecturerNavbar() {
  const { allCourses } = useLazyLoadQuery<NavbarLecturerQuery>(
    graphql`
      query NavbarLecturerQuery {
        allCourses: courses {
          elements {
            id
            title
          }
        }
      }
    `,
    {}
  );

  return (
    <NavbarBase>
      <NavbarSection title="Courses I'm tutoring">
        {allCourses.elements.map((course) => (
          <NavbarLink
            key={course.id}
            title={course.title}
            href={`/courses/${course.id}`}
          />
        ))}
      </NavbarSection>
    </NavbarBase>
  );
}

export function Navbar() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentNavbar />;
    case PageView.Lecturer:
      return <LecturerNavbar />;
  }
}
