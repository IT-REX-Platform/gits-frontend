import { CourseCardFragment$key } from "@/__generated__/CourseCardFragment.graphql";
import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { graphql, useFragment } from "react-relay";
import { Suggestion } from "./Suggestion";

export function CourseCard({ _course }: { _course: CourseCardFragment$key }) {
  const course = useFragment(
    graphql`
      fragment CourseCardFragment on Course {
        id
        title
        startDate
        startYear
        suggestions(amount: 3) {
          ...SuggestionFragment
        }
      }
    `,
    _course
  );

  return (
    <Card variant="outlined" className="h-full" key={course.id}>
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
            <Link href={`/courses/${course.id}`} underline="none">
              <Button size="small" sx={{ fontSize: "11px" }}>
                {course.title}
              </Button>
            </Link>
          </Typography>
          <div className="grow"></div>
          <Chip label={dayjs(course.startDate).year()}></Chip>
        </div>
      </CardContent>

      <Divider />
      <div className="flex flex-col m-4 gap-2 items-start grow min-h-[12rem]">
        {course.suggestions.map((suggestion, i) => (
          <Suggestion
            key={`${course.id}-suggestion-${i}`}
            _suggestion={suggestion}
          />
        ))}
        {course.suggestions.length === 0 && (
          <div className="w-full grow flex items-center text-center justify-center text-gray-600">
            You are all set.
            <br />
            No suggestions for this course
          </div>
        )}
      </div>
    </Card>
  );
}
