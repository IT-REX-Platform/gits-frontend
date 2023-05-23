import { CourseIdQuery } from "@/__generated__/CourseIdQuery.graphql";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { graphql, useLazyLoadQuery } from "react-relay";
import { VictoryLabel, VictoryPie } from "victory";

export default function Details() {
  const router = useRouter();
  const id = router.query.courseId;

  const { coursesById } = useLazyLoadQuery<CourseIdQuery>(
    graphql`
      query CourseIdQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          title
          description
        }
      }
    `,
    { id: [id] }
  );

  const course = coursesById[0];

  //TODO: change later, when implementing the services into this side
  const chapters = [
    "Chapter 1",
    "Chapter 2",
    "Chapter 3",
    "Chapter 4",
    "Chapter 5",
    "Chapter 6",
    "Chapter 7",
    "Chapter 8",
    "Chapter 9",
    "Chapter 10",
  ];
  const knowledge = 88;
  const understanding = 50;
  const analyses = 40;
  const usage = 22;

  return (
    <div className="grid grid-flow-dense grid-cols-6 grid-rows-5 gap-2 m-10">
      <div className="col-span-full row-span-1 m-2 font-bold text-2xl underline">
        {course.title}
      </div>
      <div className="col-span-full row-span-1 m-2 text-xl">
        {course.description}
      </div>
      <div className="col-span-6 row-span-2 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg ">
        <p className="underline">Skill levels</p>
        <div className="grid grid-cols-4">
          <VictoryPie
            colorScale={["green", "transparent"]}
            innerRadius={120}
            cornerRadius={100}
            labels={["Wissen"]}
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
            labels={["Verstand"]}
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
            labels={["Analyse"]}
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
            labels={["Anwend."]}
            labelRadius={1}
            labelPosition={"startAngle"}
            data={[{ y: usage }, { y: 100 - usage }]}
            width={1250}
            style={{ labels: { fontSize: 50, fill: "black" } }}
            labelComponent={<VictoryLabel dy={5} />}
          />
        </div>
      </div>
      <Button
        onClick={() => router.push("/")}
        className="col-span-2"
        color="primary"
        variant="outlined"
        endIcon={<StyleOutlinedIcon />}
      >
        Flashcards
      </Button>
      <Button
        onClick={() => router.push("/")}
        className="col-span-2"
        color="primary"
        variant="outlined"
        endIcon={<QuizIcon />}
      >
        Quizzes
      </Button>
      <Button
        onClick={() => router.push("/")}
        className="col-span-2"
        color="primary"
        variant="outlined"
        endIcon={<AssignmentIcon />}
      >
        Assignments
      </Button>
      <div className="col-span-6 row-span-2 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg">
        <p className="underline">Chapters</p>
        <div className="flex flex-col gap-1">
          {chapters.map((chapter) => (
            <Link
              className="font-bold text-white text-center bg-sky-900 hover:bg-transparent hover:text-sky-900 border-solid border-sky-900 border-2 rounded-lg "
              href={`/`}
              key={chapter}
            >
              <div>{chapter}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
