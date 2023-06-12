import { joinQuery } from "@/__generated__/joinQuery.graphql";
import { Heading } from "@/components/Heading";
import { Add } from "@mui/icons-material";
import { Button, TextField } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function JoinCourse() {
  const { courses } = useLazyLoadQuery<joinQuery>(
    graphql`
      query joinQuery {
        courses {
          id
          title
          description
        }
      }
    `,
    {}
  );

  const [search, setSearch] = useState("");

  const filteredCourses = courses.filter(
    (x) =>
      !search ||
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      x.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-10">
      <Heading className="mb-5">Course Catalog</Heading>
      <div className="w-full flex px-10 mb-8">
        <TextField
          id="outlined-basic"
          className="grow"
          label="Search Courses"
          variant="outlined"
          value={search}
          onChange={(x) => setSearch(x.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredCourses.map((course) => (
          <Link
            className="mx-10 font-bold text-sky-900 border border-sky-900 hover:bg-sky-100 p-5 pl-3 rounded-lg grid grid-cols-[1fr_1fr_auto] items-center"
            href={`/course/${course.id}`}
            key={course.id}
          >
            <div className="text-base lg:text-xl font-bold">{course.title}</div>
            <div className="text-sm italic">{course.description}</div>

            <Button
              color="primary"
              variant="outlined"
              className="w-20 md:w-40 lg:w-64 text-base"
              endIcon={<Add />}
            >
              Join course
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
