import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import { NavbarStudentFragment$key } from "@/__generated__/NavbarStudentFragment.graphql";
import { NavbarLecturerFragment$key } from "@/__generated__/NavbarLecturerFragment.graphql";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import logo from "@/assets/logo.svg";
import {
  Book,
  CollectionsBookmark,
  Dashboard,
  Home,
  Logout,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { useAuth } from "react-oidc-context";
import React, { useState } from "react";

const drawerWidth = 300;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

function StudentNavbar({
  _query,
  props,
}: {
  _query: NavbarStudentFragment$key;
  props: Props;
}) {
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

  const router = useRouter();
  const auth = useAuth();

  const { window } = props;
  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const drawer = (
    <div className="bg-slate-300 h-full">
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerToggle}
        edge="start"
        sx={{ mr: 2, display: { sm: "none" } }}
      >
        <MenuIcon />
      </IconButton>
      <div className="text-center my-8 text-3xl font-medium tracking-wider">
        <img src={logo.src} className="w-24 m-auto" />
        GITS
      </div>
      <div className="bg-white m-3 rounded-lg">
        <List>
          <ListItemButton onClick={() => router.push("/")}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                sx: { fontSize: { xs: 10, md: "default" } },
              }}
            />
          </ListItemButton>
          <Divider />
          <ListItemButton onClick={() => router.push("/join")}>
            <ListItemIcon>
              <CollectionsBookmark />
            </ListItemIcon>
            <ListItemText
              primary="Course Catalog"
              primaryTypographyProps={{
                sx: { fontSize: { xs: 10, md: "default" } },
              }}
            />
          </ListItemButton>
        </List>
      </div>
      <div className="bg-white m-3 rounded-lg">
        <List
          subheader={
            <ListSubheader
              sx={{ fontSize: { xs: 10, md: "default" } }}
              className="rounded-lg"
            >
              Courses I&apos;m attending
            </ListSubheader>
          }
          dense
        >
          {/* MOCK */}
          {allCourses.elements.map((course) => (
            <>
              <Divider />
              <ListItemButton
                key={course.id}
                onClick={() => router.push(`/course/${course.id}`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ backgroundColor: "#2c388aff" }}>
                    <Book />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={course.title}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { fontSize: { xs: 10, md: "default" } },
                  }}
                />
              </ListItemButton>
            </>
          ))}
        </List>
      </div>

      <div className="bg-white m-3 rounded-lg">
        <List dense>
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
        </List>
      </div>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          anchor="left"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block" },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}

function LecturerNavbar({
  _query,
  props,
}: {
  _query: NavbarLecturerFragment$key;
  props: Props;
}) {
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

  const router = useRouter();
  const auth = useAuth();

  const { window } = props;
  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const drawer = (
    <div className="bg-slate-300 h-full">
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerToggle}
        edge="start"
        sx={{ mr: 2, display: { sm: "none" } }}
      >
        <MenuIcon />
      </IconButton>
      <div className="text-center my-8 text-3xl font-medium tracking-wider">
        <img src={logo.src} className="w-24 m-auto" />
        GITS
      </div>
      <div className="bg-white m-3 rounded-lg">
        <List>
          <ListItemButton onClick={() => router.push("/")}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                sx: { fontSize: { xs: 10, md: "default" } },
              }}
            />
          </ListItemButton>
          <Divider />
          <ListItemButton onClick={() => router.push("/join")}>
            <ListItemIcon>
              <CollectionsBookmark />
            </ListItemIcon>
            <ListItemText
              primary="Course Catalog"
              primaryTypographyProps={{
                sx: { fontSize: { xs: 10, md: "default" } },
              }}
            />
          </ListItemButton>
        </List>
      </div>
      <div className="bg-white m-3 rounded-lg">
        <List
          sx={{ flexGrow: "1" }}
          subheader={
            <ListSubheader
              sx={{ fontSize: { xs: 10, md: "default" } }}
              className="rounded-lg"
            >
              Courses I&apos;m tutoring
            </ListSubheader>
          }
          dense
        >
          {/* MOCK */}
          {allCourses.elements.map((course) => (
            <>
              <Divider />
              <ListItemButton
                key={course.id}
                onClick={() => router.push(`/course/${course.id}`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ backgroundColor: "#2c388aff" }}>
                    <Book />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={course.title}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { fontSize: { xs: 10, md: "default" } },
                  }}
                />
              </ListItemButton>
            </>
          ))}
        </List>
      </div>

      <div className="bg-white m-3 rounded-lg">
        <List dense>
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
        </List>
      </div>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          height: "100%",
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          anchor="left"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block" },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}

export function Navbar(props: Props) {
  const [navbar, setNavbar] = useState("student");
  const pathname = usePathname();

  const query = useLazyLoadQuery<NavbarQuery>(
    graphql`
      query NavbarQuery {
        ...NavbarStudentFragment
        ...NavbarLecturerFragment
      }
    `,
    {}
  );

  return (
    <main>
      {pathname.includes("student") ? (
        <StudentNavbar _query={query} props={props} />
      ) : (
        <LecturerNavbar _query={query} props={props} />
      )}
    </main>
  );
}
