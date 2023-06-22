import { pagesLecturerFragment$key } from "@/__generated__/pagesLecturerFragment.graphql";
import { pagesQuery } from "@/__generated__/pagesQuery.graphql";
import { pagesStudentFragment$key } from "@/__generated__/pagesStudentFragment.graphql";
import Accordion from "@/components/Accordion";
import { Heading } from "@/components/Heading";
import { Subheading } from "@/components/Subheading";
import { Add, Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import { VictoryLabel, VictoryPie } from "victory";

function StudentPage({ _query }: { _query: pagesStudentFragment$key }) {
  const { allCourses } = useFragment(
    graphql`
      fragment pagesStudentFragment on Query {
        allCourses: courses {
          elements {
            id
            title
            description
          }
        }
      }
    `,
    _query
  );

  const router = useRouter();
  const percents = [55, 88, 15, 27];

  return (
    <div>
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
        {/* MOCK */}
        {allCourses.elements.map((course, index) => (
          <Link
            className="mx-10 font-bold text-white bg-sky-900 hover:bg-sky-800 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
            href={{ pathname: `/course/${course.id}` }}
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

      <Subheading>
        Completed Courses
        <Accordion className="mx-10">
          <div className="flex flex-col gap-3">
            {/* MOCK */}
            {allCourses.elements.map((course, index) => (
              <Link
                className="font-bold text-white bg-sky-900 hover:bg-sky-800 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
                href={{ pathname: `/course/${course.id}` }}
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
    </div>
  );
}

function LecturerPage({ _query }: { _query: pagesLecturerFragment$key }) {
  const router = useRouter();
  const { allCourses } = useFragment(
    graphql`
      fragment pagesLecturerFragment on Query {
        allCourses: courses {
          elements {
            id
            title
            description
          }
        }
      }
    `,
    _query
  );

  return (
    <div>
      <div className="flex justify-between items-end">
        <Subheading>Courses I&apos;m tutoring</Subheading>
        {
          /*currentUser.role === "Lecturer"*/ true && (
            <div className="mb-5 mr-10">
              <Button
                color="primary"
                variant="outlined"
                endIcon={<Add />}
                onClick={() => router.push("/course/create")}
              >
                Create a course
              </Button>
            </div>
          )
        }
      </div>
      <div className="flex flex-col gap-3">
        {/* MOCK */}
        {allCourses.elements.map((course) => (
          <Link
            className="mx-10 font-bold text-sky-900 border border-sky-900 hover:bg-sky-100 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
            href={{ pathname: `/course/${course.id}` }}
            key={course.id}
          >
            <div className="text-xl font-bold">{course.title}</div>
            <div className="text-sm italic">{course.description}</div>

            <div className="flex justify-end">
              <Button
                color="primary"
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => router.push(`/course/${course.id}/edit`)}
              >
                Edit course
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [page, setPage] = useState("student");

  const query = useLazyLoadQuery<pagesQuery>(
    graphql`
      query pagesQuery {
        ...pagesStudentFragment
        ...pagesLecturerFragment
      }
    `,
    {}
  );

  const { user } = useAuth();

  return (
    <main>
      <Heading className="mb-5 flex justify-between">
        <div>Welcome back to GITS, {user?.profile.name}!</div>{" "}
        <Button
          size="small"
          className="px-4"
          onClick={() => setPage(page === "student" ? "lecturer" : "student")}
          variant={"outlined"}
        >
          Switch to {page === "student" ? "Lecturer" : "Student"} View
        </Button>
      </Heading>

      {page === "student" ? (
        <StudentPage _query={query} />
      ) : (
        <LecturerPage _query={query} />
      )}
    </main>
  );
}
