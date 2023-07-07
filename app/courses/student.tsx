"use client";

import { studentJoinQuery } from "@/__generated__/studentJoinQuery.graphql";
import { Add } from "@mui/icons-material";
import { Button, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function StudentCourseList() {
  const { courses } = useLazyLoadQuery<studentJoinQuery>(
    graphql`
      query studentJoinQuery {
        courses {
          elements {
            id
            title
            description
          }
        }
      }
    `,
    {}
  );

  const [search, setSearch] = useState("");

  const filteredCourses = courses.elements.filter(
    (x) =>
      !search ||
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      x.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <Typography variant="h1" gutterBottom>
        Course Catalog
      </Typography>
      <div className="w-full flex mt-4 mb-8">
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
            className="font-bold text-sky-900 border border-sky-900 hover:bg-sky-100 p-5 pl-3 rounded-lg grid grid-cols-[1fr_1fr_auto] items-center"
            href={`/courses/${course.id}`}
            key={course.id}
          >
            <div className="text-sm min-[830px]:text-xl min-[830px]:font-bold">
              {course.title}
            </div>
            <div className="text-xs min-[830px]:text-sm italic">
              {course.description}
            </div>

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
    </main>
  );
}
