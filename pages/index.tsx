import { pagesQuery } from "@/__generated__/pagesQuery.graphql";
import { Heading } from "@/components/Heading";
import Link from "next/link";
import { graphql, useLazyLoadQuery } from "react-relay";
import { VictoryPie } from "victory";

export default function Home() {
  const { courses } = useLazyLoadQuery<pagesQuery>(
    graphql`
      query pagesQuery {
        courses {
          id
          name
          flashcards {
            question
          }
        }
      }
    `,
    {}
  );
  const percents = [55, 88, 15];
  const chapter = [4, 8, 2];

  return (
    <main className="">
      <Heading className="mb-5">Welcome back to GITS, Valentin!</Heading>
      <div className="flex flex-col gap-3">
        {courses.map((course, index) => (
          <Link
            className="mx-10 font-bold text-white bg-sky-900 hover:bg-sky-800 p-5 pl-3 rounded-lg flex items-center"
            href={`/course/${course.id}`}
          >
            <div className="w-20 h-20 mr-5">
              <VictoryPie
                colorScale={["white", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
              />
            </div>
            <div>
              <div className="text-xl font-bold">{course.name}</div>
              {course.flashcards.length > 0 && (
                <div className="text-sm mt-3 text-sky-200 ">
                  <span className="text-sky-300">Current Chapter:</span>{" "}
                  {course.flashcards[0].question}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>{" "}
    </main>
  );
}
