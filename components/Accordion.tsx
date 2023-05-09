import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useState,
} from "react";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function Accordion(
  props: React.HTMLAttributes<HTMLHeadingElement>
) {
  const [isShowing, setIsShowing] = useState(false);

  const toggle = () => {
    setIsShowing(!isShowing);
  };

  return (
    <div className="w-fit place-self-center mb-4 leading-4 border-2 border-solid rounded-lg border-cyan-600">
      <Button
        className="w-full text-center relative p-1"
        onClick={toggle}
        type="button"
        startIcon={<ArrowDropDownIcon />}
        variant="outlined"
      ></Button>
      <div
        {...props}
        style={{ display: isShowing ? "block" : "none", padding: "5px" }}
      />
    </div>
  );
}
