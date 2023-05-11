import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

import logo from "@/assets/logo.svg";
import { Book, CollectionsBookmark, Home } from "@mui/icons-material";
import {
  Avatar,
  Divider,
  Drawer,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
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
      sx={{ width: 300 }}
      PaperProps={{ sx: { position: "relative" } }}
      open
    >
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
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton onClick={() => router.push("/join")}>
          <ListItemIcon>
            <CollectionsBookmark />
          </ListItemIcon>
          <ListItemText primary="Course Catalog" />
        </ListItemButton>
        <ListItemButton onClick={() => auth.signoutRedirect()}>
          <ListItemIcon>
            <CollectionsBookmark />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      <Divider />
      <List
        subheader={<ListSubheader>Courses I&apos;m attending</ListSubheader>}
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
            />
          </ListItemButton>
        ))}
      </List>
      <List
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
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
