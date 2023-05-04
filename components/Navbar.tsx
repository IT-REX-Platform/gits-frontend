import { NavbarQuery } from "@/__generated__/NavbarQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

import logo from "@/assets/logo.svg";
import {
  Drawer,
  List,
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
    // <nav className="w-64 min-h-screen flex flex-col px-4">
    <Drawer
      variant="persistent"
      anchor="left"
      sx={{ width: 300, paddingX: 1 }}
      PaperProps={{ sx: { position: "relative" } }}
      open
    >
      <div className="text-center my-4 text-3xl font-medium tracking-wider">
        <img src={logo.src} className="w-24 m-auto" />
        GITS
      </div>

      <List>
        <ListItemButton href="/">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton href="/">
          <ListItemIcon>
            <CollectionsBookmark />
          </ListItemIcon>
          <ListItemText primary="My courses" />
        </ListItemButton>
      </List>

      <List subheader={<ListSubheader>My courses</ListSubheader>} dense>
        {query.courses?.map((course) => (
          <ListItemButton key={course?.id} href={`/course/${course!.id}`}>
            <ListItemIcon>
              <Book />
            </ListItemIcon>
            <ListItemText
              primary={course?.name ?? "Unnamed course"}
              primaryTypographyProps={{ noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
    // </nav>
  );
}
