import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

import logo from "@/assets/logo.svg";
import { Book, CollectionsBookmark, Home, Logout } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
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
import { useAuth } from "react-oidc-context";
import React from "react";

const drawerWidth = 240;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

export function Navbar(props: Props) {
  const query = useLazyLoadQuery<NavbarQuery>(
    graphql`
      query NavbarQuery {
        currentUser {
          coursesJoined {
            id
            title
          }
          coursesOwned {
            id
            title
          }
        }
      }
    `,
    {}
  );

  const router = useRouter();
  const auth = useAuth();

  const { window } = props;
  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const drawer = (
    <div>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerToggle}
        edge="start"
        sx={{ mr: 2, display: { lg: "none" } }}
      >
        <MenuIcon />
      </IconButton>
      <div className="text-center my-8 text-3xl font-medium tracking-wider">
        <img src={logo.src} className="w-24 m-auto" />
        GITS
      </div>
      <Divider />
      <List sx={{ paddingY: 2 }}>
        <ListItemButton onClick={() => router.push("/")}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText
            primary="Home"
            primaryTypographyProps={{
              sx: { fontSize: { xs: 10, md: "default" } },
            }}
          />
        </ListItemButton>
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
      <Divider />
      <List
        subheader={
          <ListSubheader sx={{ fontSize: { xs: 10, md: "default" } }}>
            Courses I&apos;m attending
          </ListSubheader>
        }
        dense
      >
        {query.currentUser.coursesJoined.map((course) => (
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
        ))}
      </List>
      <List
        sx={{ flexGrow: "1" }}
        subheader={
          <ListSubheader sx={{ fontSize: { xs: 10, md: "default" } }}>
            Courses I&apos;m tutoring
          </ListSubheader>
        }
        dense
      >
        {query.currentUser.coursesOwned.map((course) => (
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
        ))}
      </List>
      <Divider />
      <List sx={{ bottom: "0px", position: "absolute" }} dense>
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
          sx={{ mr: 2, display: { lg: "none" } }}
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
          //sx={{ width: 300, overflow: "auto" }}
          //className="w-36 md:w-52 lg:w-72 overflow-auto"
          //PaperProps={{ sx: { position: "relative" } }}
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
