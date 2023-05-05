import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

import logo from "@/assets/logo.svg";
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
import { Home, CollectionsBookmark, Book } from "@mui/icons-material";

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
        <ListItemButton href="/" sx={{ paddingX: 8 }}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton href="/" sx={{ paddingX: 8 }}>
          <ListItemIcon>
            <CollectionsBookmark />
          </ListItemIcon>
          <ListItemText primary="My courses" />
        </ListItemButton>
      </List>

      <Divider />
      <List subheader={<ListSubheader>Current courses</ListSubheader>} dense>
        {query.courses?.map((course) => (
          <ListItemButton key={course.id} href={`/course/${course.id}`}>
            <ListItemAvatar>
              <Avatar sx={{ backgroundColor: "#2c388aff" }}>
                <Book />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={course.name}
              primaryTypographyProps={{ noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
