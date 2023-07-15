"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import { pageScoreboardQuery } from "@/__generated__/pageScoreboardQuery.graphql";

interface Column {
  id: "place" | "name" | "power";
  label: string;
  minWidth?: number;
  align?: "right" | "center";
}

const columns: readonly Column[] = [
  { id: "place", label: "Place", minWidth: 100 },
  { id: "name", label: "Name", minWidth: 200, align: "center" },
  {
    id: "power",
    label: "Power",
    minWidth: 100,
    align: "right",
  },
];

interface Data {
  place: string;
  name: string;
  power: number;
}

function createData(place: string, name: string, power: number): Data {
  return { place, name, power };
}

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const params = useParams();
  const courseId = params.courseId;

  const { scoreboard } = useLazyLoadQuery<pageScoreboardQuery>(
    graphql`
      query pageScoreboardQuery($courseId: UUID!) {
        scoreboard(courseId: $courseId) {
          userId
          powerScore
        }
      }
    `,
    { courseId: courseId }
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const rows: any[] = [];

  scoreboard.forEach((element, index: number) => {
    index++;
    rows.push(createData(`${index}`, element.userId, element.powerScore));
  });

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "100%" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{ backgroundColor: "#90a4ae" }}
                  className="border-solid border-2"
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.name}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          className="border-solid border-2"
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
