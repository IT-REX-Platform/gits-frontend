"use client";
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
    <div className="shrink-0 bg-slate-200 h-full px-8 flex flex-col gap-6 w-72 xl:w-96 overflow-auto thin-scrollbar">
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

export function Navbar() {
  const [pageView] = usePageView();

  const { currentUserInfo } = useLazyLoadQuery<NavbarStudentQuery>(
    graphql`
      query NavbarStudentQuery {
        currentUserInfo {
          id
          courseMemberships {
            role
            course {
              id
              title
            }
          }
        }
      }
    `,
    {}
  );

  const filtered = currentUserInfo.courseMemberships.filter(
    (x) => x.role === "TUTOR" || pageView === PageView.Student
  );

  return (
    <NavbarBase>
      {filtered.length > 0 ? (
        <NavbarSection
          title={
            pageView === PageView.Lecturer
              ? "Courses I'm tutoring"
              : "Courses I'm attending"
          }
        >
          {filtered.map(({ course }) => (
            <NavbarLink
              key={course.id}
              title={course.title}
              href={`/courses/${course.id}`}
            />
          ))}
        </NavbarSection>
      ) : (
        <></>
      )}
    </NavbarBase>
  );
}
