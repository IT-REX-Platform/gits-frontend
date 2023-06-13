import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

import logo from "@/assets/logo.svg";
import { Book, CollectionsBookmark, Home, Logout } from "@mui/icons-material";
import {
  Avatar,
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
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import { useAuth } from "react-oidc-context";

export function Navbar() {
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
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      //sx={{ width: 300, overflow: "auto" }}
      className="w-36 md:w-52 lg:w-72 overflow-auto"
      PaperProps={{ sx: { position: "relative" } }}
      open
    >
      <div className="text-center my-8 text-xl lg:text-3xl font-medium tracking-wider">
        <img src={logo.src} className="w-12 lg:w-24 m-auto" />
        GITS
      </div>

      <Divider />
      <List sx={{ paddingY: 2 }}>
        <ListItemButton onClick={() => router.push("/")}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Home" className="hidden lg:block" />
        </ListItemButton>
        <ListItemButton onClick={() => router.push("/join")}>
          <ListItemIcon>
            <CollectionsBookmark />
          </ListItemIcon>
          <ListItemText primary="Course Catalog" className="hidden lg:block" />
        </ListItemButton>
      </List>

      <Divider />
      <List
        subheader={
          <ListSubheader className="text-xs md:text-base">
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
              primaryTypographyProps={{ noWrap: true }}
              className="hidden lg:block"
            />
          </ListItemButton>
        ))}
      </List>
      <List
        sx={{ flexGrow: "1" }}
        subheader={<ListSubheader>Courses I&apos;m tutoring</ListSubheader>}
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
              primaryTypographyProps={{ noWrap: true }}
              className="hidden lg:block"
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />
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
    </Drawer>
  );
}
