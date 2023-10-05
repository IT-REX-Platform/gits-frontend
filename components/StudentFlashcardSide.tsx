import { StudentFlashcardSide$key } from "@/__generated__/StudentFlashcardSide.graphql";
import { Check, Close, Loop } from "@mui/icons-material";
import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { graphql, useFragment } from "react-relay";

export function StudentFlashcardSide({
  _side,
  onChange,
}: {
  _side: StudentFlashcardSide$key;
  onChange: (knew: boolean) => void;
}) {
  const side = useFragment(
    graphql`
      fragment StudentFlashcardSide on FlashcardSide {
        label
        text
      }
    `,
    _side
  );

  const [turned, setTurned] = useState(false);
  const [knew, setKnew] = useState(false);

  useEffect(() => {
    // Notify parent about knew changes
    onChange(knew);
  }, [knew]);

  return (
    <motion.div
      initial={false}
      animate={{
        rotateY: turned ? 180 : 0,
        scaleX: turned ? -1 : 1,
      }}
      onClick={(e) => {
        setTurned(true);
        e.stopPropagation();
      }}
      className={`grid w-80 aspect-video rounded-xl shadow-xl border items-center justify-center ${
        turned ? "" : "hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
      }`}
    >
      <motion.div
        className="col-start-1 row-start-1 text-center p-3"
        animate={{ opacity: turned ? 0 : 1 }}
        initial={false}
        transition={{ duration: 0.09, delay: 0.05 }}
      >
        <Loop className="w-2 h-2 text-gray-600" />
        <br />
        <br />
        {side.label}
      </motion.div>

      <motion.div
        className="col-start-1 row-start-1 text-center p-3 h-full flex flex-col justify-between"
        animate={{ opacity: turned ? 1 : 0 }}
        initial={false}
        transition={{ duration: 0.09, delay: 0.05 }}
      >
        {side.text}

        <div className="mt-6 flex gap-2 justify-center w-full">
          <Button
            size="small"
            variant="contained"
            color={knew ? "success" : "inherit"}
            disabled={!turned}
            onClick={(e) => setKnew(true)}
            startIcon={<Check className="text-white" />}
          >
            <span className="text-white">Correct</span>
          </Button>
          <Button
            size="small"
            variant="contained"
            color={!knew ? "error" : "inherit"}
            disabled={!turned}
            onClick={(e) => setKnew(false)}
            startIcon={<Close className="text-white" />}
          >
            <span className="text-white">Wrong</span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
