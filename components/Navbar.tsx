"use client";
import { NavbarIsTutor$key } from "@/__generated__/NavbarIsTutor.graphql";
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
import dayjs from "dayjs";
import { usePathname, useRouter } from "next/navigation";
import { ReactElement } from "react";
import { useAuth } from "react-oidc-context";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";

function useIsTutor(_frag: NavbarIsTutor$key) {
  const { realmRoles, courseMemberships } = useFragment(
    graphql`
      fragment NavbarIsTutor on UserInfo {
        realmRoles
        courseMemberships {
          role
        }
      }
    `,
    _frag
  );

  return (
    realmRoles.includes("super-user") ||
    realmRoles.includes("course-creator") ||
    courseMemberships.some(
      (x) => x.role === "TUTOR" || x.role === "ADMINISTRATOR"
    )
  );
}

function NavbarBase({
  children,
  _isTutor,
}: {
  children: React.ReactElement;
  _isTutor: NavbarIsTutor$key;
}) {
  return (
    <div className="shrink-0 bg-slate-200 h-full px-8 flex flex-col gap-6 w-72 xl:w-96 overflow-auto thin-scrollbar">
      <div className="text-center my-16 text-3xl font-medium tracking-wider sticky">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt="GITS logo" className="w-24 m-auto" />
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
      <UserInfo _isTutor={_isTutor} />
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

function SwitchPageViewButton() {
  const [pageView, setPageView] = usePageView();

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

function UserInfo({ _isTutor }: { _isTutor: NavbarIsTutor$key }) {
  const auth = useAuth();

  const tutor = useIsTutor(_isTutor);

  return (
    <div className="sticky bottom-0 py-6 -mt-6 bg-gradient-to-t from-slate-200 from-75% to-transparent">
      <NavbarSection>
        <ListItem
          secondaryAction={
            <Tooltip title="Logout" placement="left">
              <IconButton
                edge="end"
                aria-label="logout"
                onClick={() =>
                  auth.signoutRedirect({
                    post_logout_redirect_uri:
                      process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL ??
                      "http://localhost:3005",
                  })
                }
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

        {tutor && (
          <>
            <Divider />
            <SwitchPageViewButton />
          </>
        )}
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
          ...NavbarIsTutor
          id
          realmRoles
          courseMemberships {
            role
            course {
              id
              title
              startDate
              endDate
              published
            }
          }
        }
      }
    `,
    {}
  );

  const filtered = currentUserInfo.courseMemberships
    .filter(
      (x) => ["ADMINISTRATOR", "TUTOR"].includes(x.role) || PageView.Student
    )
    .filter((x) => x.course.published || pageView === PageView.Lecturer)
    .filter(
      (x) =>
        dayjs(x.course.endDate) >= dayjs() &&
        dayjs(x.course.startDate) <= dayjs()
    );
  return (
    <NavbarBase _isTutor={currentUserInfo}>
      {filtered.length > 0 ? (
        <NavbarSection
          title={
            pageView === PageView.Lecturer
              ? "Courses I'm teaching this semester"
              : "Courses I'm attending this semester"
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
