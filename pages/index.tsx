import { pagesQuery } from "@/__generated__/pagesQuery.graphql";
import Accordion from "@/components/Accordion";
import { Heading } from "@/components/Heading";
import { Subheading } from "@/components/Subheading";
import { Add } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "react-oidc-context";
import { graphql, useLazyLoadQuery } from "react-relay";
import { VictoryLabel, VictoryPie } from "victory";

export default function Home() {
  const { allCourses, currentUser } = useLazyLoadQuery<pagesQuery>(
    graphql`
      query pagesQuery {
        allCourses: courses {
          id
          title
          description
        }
        currentUser {
          coursesJoined {
            id
            title
            description
          }
          coursesOwned {
            id
            title
            description
          }
        }
      }
    `,
    {}
  );
  const percents = [55, 88, 15, 27];

  const { user } = useAuth();

  const router = useRouter();
  return (
    <main className="">
      <Heading className="mb-5">
        Welcome back to GITS, {user?.profile.name}!
      </Heading>

      <div className="flex justify-between items-end">
        <Subheading>Courses I&apos;m attending</Subheading>
        <div className="mb-5 mr-10">
          <Button
            onClick={() => router.push("/join")}
            color="primary"
            variant="outlined"
            endIcon={<Add />}
          >
            Join courses
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {currentUser.coursesJoined.map((course, index) => (
          <Link
            className="mx-10 font-bold text-white bg-sky-900 hover:bg-sky-800 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
            href={{pathname: `/course/${course.id}/details`, query: course.id}}
            key={course.id}
          >
            <div className="text-xl font-bold">{course.title}</div>
            <div className="text-sm italic">{course.description}</div>
            <div className="w-64 h-20 mr-5 grid grid-cols-4 right-0">
              <VictoryPie
                colorScale={["white", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                labels={["W"]}
                labelRadius={1}
                labelPosition={"startAngle"}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                style={{ labels: { fontSize: 100, fill: "white" } }}
                labelComponent={<VictoryLabel dy={50} />}
              />

              <VictoryPie
                colorScale={["green", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                labels={["V"]}
                labelRadius={1}
                labelPosition={"startAngle"}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                style={{ labels: { fontSize: 100, fill: "white" } }}
                labelComponent={<VictoryLabel dy={50} />}
              />
              <VictoryPie
                colorScale={["gold", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                labels={["A"]}
                labelRadius={1}
                labelPosition={"startAngle"}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                style={{ labels: { fontSize: 100, fill: "white" } }}
                labelComponent={<VictoryLabel dy={50} />}
              />
              <VictoryPie
                colorScale={["red", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                labels={["A"]}
                labelRadius={1}
                labelPosition={"startAngle"}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                style={{ labels: { fontSize: 100, fill: "white" } }}
                labelComponent={<VictoryLabel dy={50} />}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-between items-end">
        <Subheading>Courses I&apos;m tutoring</Subheading>
        <div className="mb-5 mr-10">
          <Button color="primary" variant="outlined" endIcon={<Add />}>
            Create a course
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {currentUser.coursesOwned.map((course) => (
          <Link
            className="mx-10 font-bold text-sky-900 border border-sky-900 hover:bg-sky-100 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
            href={{pathname: `/course/${course.id}/details`, query: course.id}}
            key={course.id}
          >
            <div className="text-xl font-bold">{course.title}</div>
            <div className="text-sm italic">{course.description}</div>
          </Link>
        ))}
      </div>

      <Subheading>
        Completed Courses
        <Accordion className="mx-10">
          <div className="flex flex-col gap-3">
            {allCourses.map((course, index) => (
              <Link
                className="font-bold text-white bg-sky-900 hover:bg-sky-800 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
                href={{pathname: `/course/${course.id}/details`, query: course.id}}
                key={course.id}
              >
                <div className="text-xl font-bold">{course.title}</div>
                <div className="text-sm italic">{course.description}</div>
                <div className="w-64 h-20 mr-5 grid grid-cols-4 right-0">
                  <div>
                    <VictoryPie
                      colorScale={["white", "transparent"]}
                      innerRadius={120}
                      cornerRadius={100}
                      labels={["W"]}
                      labelRadius={1}
                      labelPosition={"startAngle"}
                      data={[
                        { y: percents[index] },
                        { y: 100 - percents[index] },
                      ]}
                      style={{ labels: { fontSize: 100, fill: "white" } }}
                      labelComponent={<VictoryLabel dy={50} />}
                    />
                  </div>

                  <VictoryPie
                    colorScale={["green", "transparent"]}
                    innerRadius={120}
                    cornerRadius={100}
                    labels={["V"]}
                    labelRadius={1}
                    labelPosition={"startAngle"}
                    data={[
                      { y: percents[index] },
                      { y: 100 - percents[index] },
                    ]}
                    style={{ labels: { fontSize: 100, fill: "white" } }}
                    labelComponent={<VictoryLabel dy={50} />}
                  />
                  <VictoryPie
                    colorScale={["gold", "transparent"]}
                    innerRadius={120}
                    cornerRadius={100}
                    labels={["A"]}
                    labelRadius={1}
                    labelPosition={"startAngle"}
                    data={[
                      { y: percents[index] },
                      { y: 100 - percents[index] },
                    ]}
                    style={{ labels: { fontSize: 100, fill: "white" } }}
                    labelComponent={<VictoryLabel dy={50} />}
                  />
                  <VictoryPie
                    colorScale={["red", "transparent"]}
                    innerRadius={120}
                    cornerRadius={100}
                    labels={["A"]}
                    labelRadius={1}
                    labelPosition={"startAngle"}
                    data={[
                      { y: percents[index] },
                      { y: 100 - percents[index] },
                    ]}
                    style={{ labels: { fontSize: 100, fill: "white" } }}
                    labelComponent={<VictoryLabel dy={50} />}
                  />
                </div>
              </Link>
            ))}
          </div>
        </Accordion>
      </Subheading>
    </main>
  );
}
