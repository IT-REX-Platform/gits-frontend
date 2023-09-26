"use client";
import { studentCourseIdQuery } from "@/__generated__/studentCourseIdQuery.graphql";
import {
  Button,
  Collapse,
  IconButton,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses,
} from "@mui/material";
import { every, orderBy, some } from "lodash";
import { useParams, useRouter } from "next/navigation";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { studentCourseLeaveMutation } from "@/__generated__/studentCourseLeaveMutation.graphql";
import { studentCoursePageChapterFragment$key } from "@/__generated__/studentCoursePageChapterFragment.graphql";
import { studentCoursePageSectionFragment$key } from "@/__generated__/studentCoursePageSectionFragment.graphql";
import { studentCoursePageStageFragment$key } from "@/__generated__/studentCoursePageStageFragment.graphql";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import { ContentLink } from "@/components/Content";
import { FormErrors } from "@/components/FormErrors";
import { PageError } from "@/components/PageError";
import { RewardScores } from "@/components/RewardScores";
import { Section, SectionContent, SectionHeader } from "@/components/Section";
import { Stage, StageBarrier } from "@/components/Stage";
import { Suggestion } from "@/components/Suggestion";
import { Info } from "@mui/icons-material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";

interface Data {
  name: string;
  power: number;
}

function createData(name: string, power: number) {
  return { name, power };
}

export default function StudentCoursePage() {
  // Get course id from url
  const { courseId: id } = useParams();

  const router = useRouter();
  const [error, setError] = useState<any>(null);

  // Fetch course data
  const {
    coursesByIds,
    scoreboard,
    currentUserInfo: { id: userId },
  } = useLazyLoadQuery<studentCourseIdQuery>(
    graphql`
      query studentCourseIdQuery($id: UUID!) {
        scoreboard(courseId: $id) {
          user {
            userName
          }
          powerScore
        }
        currentUserInfo {
          id
        }

        coursesByIds(ids: [$id]) {
          suggestions(amount: 4) {
            ...SuggestionFragment
            content {
              id
            }
          }
          id
          title
          description
          rewardScores {
            ...RewardScoresFragment
          }
          chapters {
            elements {
              id
              number
              ...studentCoursePageChapterFragment
              contents {
                ...ContentLinkFragment

                userProgressData {
                  nextLearnDate
                  lastLearnDate
                }

                id
                metadata {
                  type
                }
              }
            }
          }
        }
      }
    `,
    { id }
  );

  const [leave] = useMutation<studentCourseLeaveMutation>(graphql`
    mutation studentCourseLeaveMutation($input: CourseMembershipInput!) {
      deleteMembership(input: $input) {
        courseId
        role
      }
    }
  `);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  // Extract scoreboard
  const rows: Data[] = scoreboard
    .slice(0, 3)
    .map((element) =>
      createData(element.user?.userName ?? "Unknown", element.powerScore)
    );

  // Extract course
  const course = coursesByIds[0];

  return (
    <main>
      <FormErrors error={error} onClose={() => setError(null)} />
      <div className="flex gap-4 items-center">
        <Typography variant="h1">{course.title}</Typography>
        <LightTooltip
          title={
            <>
              <p className="text-slate-600 mb-1">Beschreibung</p>
              <p>{course.description}</p>
            </>
          }
        >
          <IconButton>
            <Info />
          </IconButton>
        </LightTooltip>

        <div className="flex-1"></div>

        <Button
          color="inherit"
          size="small"
          variant="outlined"
          endIcon={<ExitToAppIcon />}
          onClick={() => {
            if (
              confirm(
                "Do you really want to leave this course? You might loose the progress you've already made"
              )
            ) {
              leave({
                variables: {
                  input: { courseId: id, role: "STUDENT", userId },
                },
                onError: setError,

                updater(store) {
                  const userRecord = store.get(userId)!;
                  const records =
                    userRecord.getLinkedRecords("courseMemberships")!;

                  userRecord.setLinkedRecords(
                    records.filter((x) => x.getValue("courseId") !== id),
                    "courseMemberships"
                  );
                },
                onCompleted() {
                  router.push("/courses?leftCourse=true");
                },
              });
            }
          }}
        >
          Leave course
        </Button>
      </div>
      <div className="grid grid-cols-2 items-start">
        <div className="object-cover my-12">
          <div className="pl-8 pr-10 py-6 border-4 border-slate-200 rounded-3xl">
            <RewardScores _scores={course.rewardScores} courseId={course.id} />
          </div>
          <Button
            className="!mt-2 !ml-8"
            endIcon={<NavigateNextIcon />}
            onClick={() => router.push(`/courses/${id}/statistics`)}
          >
            Full history
          </Button>
        </div>
        <div className="mx-5">
          <TableContainer component={Paper} className="mt-12 mb-2">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="right">Power</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.power}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Link href={{ pathname: `${id}/scoreboard` }}>
            <Button variant="text" endIcon={<NavigateNextIcon />}>
              Full Scoreboard
            </Button>
          </Link>
        </div>
      </div>

      <section className="mt-8 mb-20">
        <Typography variant="h2">Up next</Typography>
        <div className="mt-8 gap-8 flex flex-wrap">
          {course.suggestions.map((x) => (
            <Suggestion
              courseId={course.id}
              key={x.content.id}
              _suggestion={x}
            />
          ))}
        </div>
      </section>

      {orderBy(course.chapters.elements, (x) => x.number).map((chapter) => (
        <StudentChapter key={chapter.id} _chapter={chapter} />
      ))}
    </main>
  );
}

function StudentChapter({
  _chapter,
}: {
  _chapter: studentCoursePageChapterFragment$key;
}) {
  const { courseId } = useParams();
  const chapter = useFragment(
    graphql`
      fragment studentCoursePageChapterFragment on Chapter {
        id
        title
        number
        suggestedStartDate
        suggestedEndDate
        ...ChapterHeaderFragment
        sections {
          id
          ...studentCoursePageSectionFragment
        }
      }
    `,
    _chapter
  );
  const [expanded, setExpanded] = useState(
    dayjs().isBetween(chapter.suggestedStartDate, chapter.suggestedEndDate)
  );

  return (
    <section>
      <ChapterHeader
        courseId={courseId}
        _chapter={chapter}
        expanded={expanded}
        onExpandClick={() => setExpanded((curr) => !curr)}
      />
      <Collapse in={expanded}>
        <div className="mb-6">
          <ChapterContent>
            {chapter.sections.map((section) => (
              <StudentSection key={section.id} _section={section} />
            ))}
          </ChapterContent>{" "}
        </div>
      </Collapse>
    </section>
  );
}

function StudentSection({
  _section,
}: {
  _section: studentCoursePageSectionFragment$key;
}) {
  const section = useFragment(
    graphql`
      fragment studentCoursePageSectionFragment on Section {
        id
        name
        stages {
          id
          position
          requiredContentsProgress
          ...studentCoursePageStageFragment
        }
      }
    `,
    _section
  );

  const stages = orderBy(section.stages, (stage) => stage.position);

  // Workaround until the backend calculates the progress
  const stageComplete = stages.map(
    (stage) => stage.requiredContentsProgress === 100
  );
  const stageDisabled = stages.map((_, i) =>
    some(stages.slice(0, i), (_, idx) => !stageComplete[idx])
  );
  const sectionComplete = every(stages, (_, idx) => stageComplete[idx]);

  return (
    <Section done={sectionComplete}>
      <SectionHeader>{section.name}</SectionHeader>
      <SectionContent>
        {stages.map((stage, i) => (
          <>
            {/* Show barrier if this is the first non-complete stage */}
            {(i == 0
              ? false
              : !stageComplete[i - 1] && !stageDisabled[i - 1]) && (
              <StageBarrier />
            )}
            <StudentStage
              key={stage.id}
              _stage={stage}
              disabled={stageDisabled[i]}
            />
          </>
        ))}
      </SectionContent>
    </Section>
  );
}

function StudentStage({
  disabled = false,
  _stage,
}: {
  disabled?: boolean;
  _stage: studentCoursePageStageFragment$key;
}) {
  const { courseId } = useParams();
  const stage = useFragment(
    graphql`
      fragment studentCoursePageStageFragment on Stage {
        requiredContentsProgress
        requiredContents {
          ...ContentLinkFragment
          id
        }
        optionalContents {
          ...ContentLinkFragment
          id
        }
      }
    `,
    _stage
  );

  return (
    <Stage progress={disabled ? 0 : stage.requiredContentsProgress}>
      {stage.requiredContents.map((content) => (
        <ContentLink
          courseId={courseId}
          key={content.id}
          _content={content}
          disabled={disabled}
        />
      ))}
      {stage.optionalContents.map((content) => (
        <ContentLink
          courseId={courseId}
          key={content.id}
          _content={content}
          optional
          disabled={disabled}
        />
      ))}
    </Stage>
  );
}

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 14,
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: "normal",
  },
}));
