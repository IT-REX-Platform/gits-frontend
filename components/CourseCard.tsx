import { CourseCardFragment$key } from "@/__generated__/CourseCardFragment.graphql";
import { YearDivision } from "@/__generated__/lecturerCreateCourseMutation.graphql";
import {
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
import { PageView, usePageView } from "@/src/currentView";

export const yearDivisionToString: Record<YearDivision, string> = {
  FIRST_SEMESTER: "Winter semester",
  SECOND_SEMESTER: "Summer semester",
  FIRST_TRIMESTER: "1st Trimester",
  SECOND_TRIMESTER: "2nd Trimester",
  THIRD_TRIMESTER: "3rd Trimester",
  FIRST_QUARTER: "1st Quarter",
  SECOND_QUARTER: "2nd Quarter",
  THIRD_QUARTER: "3rd Quarter",
  FOURTH_QUARTER: "4th Quarter",

  "%future added value": "Unknown",
};

export const yearDivisionToStringShort: Record<YearDivision, string> = {
  FIRST_SEMESTER: "Winter",
  SECOND_SEMESTER: "Summer",
  FIRST_TRIMESTER: "1st Trim.",
  SECOND_TRIMESTER: "2nd Trim.",
  THIRD_TRIMESTER: "3rd Trim.",
  FIRST_QUARTER: "Q1",
  SECOND_QUARTER: "Q2",
  THIRD_QUARTER: "Q3",
  FOURTH_QUARTER: "Q4",

  "%future added value": "Unknown",
};

export function CourseCard({ _course }: { _course: CourseCardFragment$key }) {
  const [pageView, _] = usePageView();
  const course = useFragment(
    graphql`
      fragment CourseCardFragment on Course {
        id
        title
        startDate
        yearDivision
        suggestions(amount: 3) {
          ...SuggestionFragment
        }
        userProgress {
          progress
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
              value={
                pageView === PageView.Student ? course.userProgress.progress : 0
              }
              color="success"
              className="col-start-1 row-start-1"
            />
          </div>
          <Typography
            variant="h6"
            component="div"
            className="shrink overflow-hidden !ml-2"
          >
            <Link href={`/courses/${course.id}`} underline="none" color="black">
              {course.title}
            </Link>
          </Typography>
          <div className="grow"></div>
          <Chip
            label={
              course.yearDivision
                ? yearDivisionToStringShort[course.yearDivision]
                : dayjs(course.startDate).year()
            }
          ></Chip>
        </div>
      </CardContent>

      <Divider />
      <div className="flex flex-col m-4 gap-2 items-start grow min-h-[12rem]">
        {course.suggestions.map((suggestion, i) => (
          <Suggestion
            courseId={course.id}
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
