"use client";
import { pageCourseIdQuery } from "@/__generated__/pageCourseIdQuery.graphql";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";
import { Button } from "@mui/material";
import Error from "next/error";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import { VictoryLabel, VictoryPie } from "victory";

export default function Details() {
  const params = useParams();
  const router = useRouter();
  const id = params.courseId;
  const currentDate = new Date();

  const { coursesById } = useLazyLoadQuery<pageCourseIdQuery>(
    graphql`
      query pageCourseIdQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          title
          description
          chapters {
            elements {
              id
              title
              number
              startDate
              endDate
            }
          }
        }
      }
    `,
    { id: [id] }
  );

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  //TODO: change later, when implementing the services into this side
  const course = coursesById[0];
  const knowledge = 88;
  const understanding = 50;
  const analyses = 40;
  const usage = 22;

  const viewablechapters = course.chapters.elements.filter((chapter) => {
    const start = new Date(chapter?.startDate);
    //const end = new Date(chapter?.endDate);

    return (
      start.toISOString() <= currentDate.toISOString()
      //end.toISOString() >= currentDate.toISOString()
    );
  });

  return (
    <div className="grid grid-flow-dense grid-cols-6 gap-2 m-10">
      <div className="col-span-full m-2 font-bold text-2xl underline">
        {course.title}
      </div>
      <div className="col-span-full m-2 text-xl">{course.description}</div>
      <div className="col-span-6 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg ">
        <p className="max-[1000px]:hidden underline">Skill levels</p>
        <div className="grid grid-cols-4">
          <VictoryPie
            colorScale={["green", "transparent"]}
            innerRadius={120}
            cornerRadius={100}
            labels={["Know"]}
            labelRadius={1}
            labelPosition={"startAngle"}
            data={[{ y: knowledge }, { y: 100 - knowledge }]}
            width={1250}
            style={{ labels: { fontSize: 50, fill: "black" } }}
            labelComponent={<VictoryLabel dy={5} />}
          />
          <VictoryPie
            colorScale={["yellow", "transparent"]}
            innerRadius={120}
            cornerRadius={100}
            labels={["Grasp"]}
            labelRadius={1}
            labelPosition={"startAngle"}
            data={[{ y: understanding }, { y: 100 - understanding }]}
            width={1250}
            style={{ labels: { fontSize: 50, fill: "black" } }}
            labelComponent={<VictoryLabel dy={5} />}
          />
          <VictoryPie
            colorScale={["red", "transparent"]}
            innerRadius={120}
            cornerRadius={100}
            labels={["Analysis"]}
            labelRadius={1}
            labelPosition={"startAngle"}
            data={[{ y: analyses }, { y: 100 - analyses }]}
            width={1250}
            style={{ labels: { fontSize: 50, fill: "black" } }}
            labelComponent={<VictoryLabel dy={5} />}
          />
          <VictoryPie
            colorScale={["red", "transparent"]}
            innerRadius={120}
            cornerRadius={100}
            labels={["Use"]}
            labelRadius={1}
            labelPosition={"startAngle"}
            data={[{ y: usage }, { y: 100 - usage }]}
            width={1250}
            style={{ labels: { fontSize: 50, fill: "black" } }}
            labelComponent={<VictoryLabel dy={5} />}
          />
        </div>
      </div>
      <div className="col-span-6">
        <div className="grid grid-flow-dense grid-cols-3 p-2">
          <Button
            onClick={() => router.push("/")}
            color="primary"
            variant="outlined"
            endIcon={
              <StyleOutlinedIcon
                sx={{ display: { xs: "none", md: "block" } }}
              />
            }
          >
            Flashcards
          </Button>
          <Button
            onClick={() => router.push("/")}
            color="primary"
            variant="outlined"
            endIcon={<QuizIcon sx={{ display: { xs: "none", md: "block" } }} />}
          >
            Quizzes
          </Button>
          <Button
            onClick={() => router.push("/")}
            color="primary"
            variant="outlined"
            endIcon={
              <AssignmentIcon sx={{ display: { xs: "none", md: "block" } }} />
            }
          >
            Assignments
          </Button>
        </div>
      </div>

      <div className="col-span-6 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg">
        <p className="underline">Chapters</p>
        <div className="flex flex-col gap-1">
          {viewablechapters.map((chapter) => (
            <Link
              className="text-center font-bold border-solid border-sky-900 border-2 rounded-lg text-white bg-sky-900 hover:bg-white hover:text-sky-900"
              href={{ pathname: `/chapter/${chapter!.id}` }}
              key={chapter!.id}
            >
              <p>
                {chapter?.number} {chapter?.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
