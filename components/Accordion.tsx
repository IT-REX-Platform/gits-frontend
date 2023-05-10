import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function Accordion(props: React.HTMLAttributes<HTMLDivElement>) {
  const [isShowing, setIsShowing] = useState(false);

  const toggle = () => {
    setIsShowing(!isShowing);
  };

  return (
    <>
      <Button
        className="w-full text-center relative p-1 mt-5"
        onClick={toggle}
        type="button"
        startIcon={<ArrowDropDownIcon />}
        variant="outlined"
      ></Button>
      <div
        {...props}
        style={{ display: isShowing ? "block" : "none" }}
        className="p-1"
      />
    </>
  );
}
