import { useRouter } from "next/router";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function Details() {
  const router = useRouter();
  const data = router.query;
  const id = data["id"];

  const { course } = useLazyLoadQuery<courseQuery>(
    graphql`
      query courseQuery($id: String) {
        coursesById(ids: $id) {
          title
          description
        }
      }
    `,
    {}
  );

  return (
    <div className="grid grid-flow-dense grid-cols-6 grid-rows-6 gap-2">
      <div className="col-span-full row-span-1">{course.title}</div>
      <div className="col-span-full row-span-1">{course.description}</div>
      <div className="col-span-3 row-span-2 bg-orange-600">Chapters</div>
      <div className="col-span-3 row-span-2 bg-yellow-400">Skill levels</div>
      <div className="col-span-2 row-span-2 bg-blue-500">FlashCards</div>
      <div className="col-span-2 row-span-2 bg-green-500">Quizzes</div>
      <div className="col-span-2 row-span-2 bg-rose-400">Assignments</div>
    </div>
  );
}
