import { CourseIdQuery } from "@/__generated__/CourseIdQuery.graphql";
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
  const flashcards = [
    "Cards 1",
    "Cards 2",
    "Cards 3",
    "Cards 4",
    "Cards 5",
    "Cards 6",
    "Cards 7",
    "Cards 8",
    "Cards 9",
    "Cards 10",
  ];
  const quizzes = [
    "Quiz 1",
    "Quiz 2",
    "Quiz 3",
    "Quiz 4",
    "Quiz 5",
    "Quiz 6",
    "Quiz 7",
    "Quiz 8",
    "Quiz 9",
    "Quiz 10",
  ];
  const assignemnts = [
    "Assignment 1",
    "Assignment 2",
    "Assignment 3",
    "Assignment 4",
  ];

  return (
    <div className="grid grid-flow-dense grid-cols-6 grid-rows-6 gap-2">
      <div className="col-span-full row-span-1 m-2 font-bold text-2xl underline">
        {course.title}
      </div>
      <div className="col-span-full row-span-1 m-2 text-xl">
        {course.description}
      </div>
      <div className="col-span-3 row-span-2 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg">
        <p className="underline">Chapters</p>
        <div className="flex flex-col gap-1 overflow-hidden">
          {chapters.map((chapter) => (
            <Link
              className="font-bold text-white text-center bg-sky-900 hover:bg-transparent hover:text-sky-900 hover:border-solid hover:border-sky-900 hover:border-2 rounded-lg overflow-y-auto"
              href={`/`}
              key={chapter}
            >
              <div>{chapter}</div>
            </Link>
          ))}
        </div>
      </div>
      <div className="col-span-3 row-span-2 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg ">
        <p className="underline">Skill levels</p>
        <div className="grid grid-cols-2 grid-rows-2">
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
      <div className="col-span-2 row-span-2 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg ">
        <p className="underline">Flashcards</p>
        <div className="flex flex-col gap-1">
          {flashcards.map((flashcard) => (
            <Link
              className="font-bold text-white text-center bg-sky-900 hover:bg-transparent hover:text-sky-900 hover:border-solid hover:border-sky-900 hover:border-2 rounded-lg"
              href={`/`}
              key={flashcard}
            >
              <div>{flashcard}</div>
            </Link>
          ))}
        </div>
      </div>
      <div className="col-span-2 row-span-2 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg ">
        <p className="underline">Quizzes</p>
        <div className="flex flex-col gap-1">
          {quizzes.map((quiz) => (
            <Link
              className="font-bold text-white text-center bg-sky-900 hover:bg-transparent hover:text-sky-900 hover:border-solid hover:border-sky-900 hover:border-2 rounded-lg"
              href={`/`}
              key={quiz}
            >
              <div>{quiz}</div>
            </Link>
          ))}
        </div>
      </div>
      <div className="col-span-2 row-span-2 border-solid border-sky-900 border-2 m-2 p-2 rounded-lg ">
        <p className="underline">Assignments</p>
        <div className="flex flex-col gap-1">
          {assignemnts.map((assignemnt) => (
            <Link
              className="font-bold text-white text-center bg-sky-900 hover:bg-transparent hover:text-sky-900 hover:border-solid hover:border-sky-900 hover:border-2 rounded-lg"
              href={`/`}
              key={assignemnt}
            >
              <div>{assignemnt}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
