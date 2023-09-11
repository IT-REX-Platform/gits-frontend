import {
  ArrowForwardIos,
  Check,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

type CourseType = {
  readonly id: any;
  readonly startDate: any;
  readonly startYear: number | null;
  readonly title: string;
};

export function CourseCard({ courses }: { courses: CourseType }) {
  return (
    <Card variant="outlined" className="h-full" key={courses.id}>
      <CardContent>
        <div className="flex gap-4 items-center">
          <div className="aspect-square min-w-[40px] grid">
            <CircularProgress
              variant="determinate"
              value={100}
              sx={{
                color: (theme) => theme.palette.grey[200],
              }}
              className="col-start-1 row-start-1"
            />
            <CircularProgress
              variant="determinate"
              value={45}
              color="success"
              className="col-start-1 row-start-1"
            />
          </div>
          <Typography
            variant="h6"
            component="div"
            className="shrink text-ellipsis overflow-hidden whitespace-nowrap "
          >
            <Link href={`/courses/${courses.id}`} underline="none">
              <Button size="small">{courses.title}</Button>
            </Link>
          </Typography>
        </div>
      </CardContent>

      <Divider />
      <List>
        <ListItemButton>
          <ListItemIcon>
            <Visibility />
          </ListItemIcon>
          <ListItemText
            primary="Watch the next video"
            secondary="Chapter 4: Interfaces"
          />
          <ListItemIcon>
            <ArrowForwardIos fontSize="small" />
          </ListItemIcon>
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <Check />
          </ListItemIcon>
          <ListItemText
            primary="Solve the Quiz"
            secondary="Chapter 4: Interfaces"
          />
          <ListItemIcon>
            <ArrowForwardIos fontSize="small" />
          </ListItemIcon>
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <Refresh />
          </ListItemIcon>
          <ListItemText
            primary="Refresh your Knowledge"
            secondary="Chapter 1-3"
          />
          <ListItemIcon>
            <ArrowForwardIos fontSize="small" />
          </ListItemIcon>
        </ListItemButton>
      </List>
      <Divider />
    </Card>
  );
}
