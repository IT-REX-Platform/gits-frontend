import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { RichTextEditorFragment$key } from "@/__generated__/RichTextEditorFragment.graphql";
import { RichTextEditorMediaRecordQuery } from "@/__generated__/RichTextEditorMediaRecordQuery.graphql";
import { ContentMediaDisplay } from "@/app/courses/[courseId]/media/[mediaId]/student";
import {
  Code,
  Delete,
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatUnderlined,
  LooksOne,
  LooksTwo,
  PermMedia,
} from "@mui/icons-material";
import {
  Divider,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  styled,
} from "@mui/material";
import { clsx } from "clsx";
import isHotkey from "is-hotkey";
import { debounce } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import {
  BaseEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Text as SlateText,
  Transforms,
  createEditor,
} from "slate";
import { HistoryEditor, withHistory } from "slate-history";
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useFocused,
  useSelected,
  useSlate,
  useSlateStatic,
  withReact,
} from "slate-react";
import { MediaRecordSelector } from "./MediaRecordSelector";

const HOTKEYS: Record<string, string> = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

type CustomElement =
  | {
      type:
        | "block-quote"
        | "bulleted-list"
        | "heading-one"
        | "heading-two"
        | "list-item"
        | "numbered-list"
        | "paragraph";
      children: CustomText[];
      align?: AlignTypes;
    }
  | {
      type: "mediaRecord";
      id: string;
      children: CustomText[];
      align?: AlignTypes;
    };

type AlignTypes = "left" | "center" | "right" | "justify";

type CustomText = {
  text: string;
  bold?: true;
  code?: true;
  italic?: true;
  underline?: true;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor &
      ReactEditor &
      HistoryEditor &
      ReactEditor &
      HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

function parseFromString(val: string): Descendant[] {
  let parsed: Descendant[];
  try {
    parsed = JSON.parse(val ?? "");

    if (!Array.isArray(parsed)) {
      throw "";
    }
  } catch {
    parsed = [{ type: "paragraph", children: [{ text: "" }] }];
  }

  return parsed;
}

export function RichTextEditor({
  initialValue,
  onChange,
  className,
  label,
  required,
  placeholder,
  _allRecords,
}: {
  initialValue?: string | undefined;
  onChange: (val: string) => void;
  className?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  _allRecords: MediaRecordSelector$key;
}) {
  const editor = useMemo(
    () => withMediaRecords(withHistory(withReact(createEditor()))),
    []
  );
  const debouncedOnChange = useCallback(
    debounce((e: Descendant[]) => onChange(JSON.stringify(e)), 400),
    [onChange]
  );

  return (
    <Slate
      onChange={(e) => debouncedOnChange(e)}
      editor={editor}
      initialValue={parseFromString(initialValue ?? "")}
    >
      <Paper
        elevation={0}
        className={clsx(
          "flex flex-col relative mt-2 border border-[#C4C4C4] focus-within:border-[#3676CB] focus-within:hover:border-[#3676CB] hover:border-[#212121] focus-within:border-2 p-[1px] focus-within:p-0 group",
          className
        )}
      >
        <div className="pt-[6px] focus-within:pt-[42px] transition-all">
          <div className="p-2 pt-1">
            {label && (
              <div className="text-[#666666] absolute font-normal text-[12px] mx-3 -left-[3px] -top-[9px] group-focus-within:-left-[4px] group-focus-within:-top-[10px] bg-white px-1 group-focus-within:text-[#3676CB]">
                {label} {required ? "*" : ""}
              </div>
            )}
            <Toolbar _allRecords={_allRecords} />
            <Editable
              className="outline-none "
              renderElement={Element}
              renderLeaf={Leaf}
              placeholder={placeholder ?? label}
              spellCheck
              autoFocus
              onKeyDown={(event) => {
                for (const hotkey in HOTKEYS) {
                  if (isHotkey(hotkey, event as any)) {
                    event.preventDefault();
                    const mark = HOTKEYS[hotkey];
                    toggleMark(editor, mark);
                  }
                }
              }}
            />
          </div>
        </div>
      </Paper>
    </Slate>
  );
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    margin: theme.spacing(0.5),
    border: 0,
    "&.Mui-disabled": {
      border: 0,
    },
    "&:not(:first-of-type)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-of-type": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

function Toolbar({ _allRecords }: { _allRecords: MediaRecordSelector$key }) {
  const editor = useSlate();

  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);

  return (
    <div
      className={clsx(
        "w-full absolute top-1 left-0 hidden group-focus-within:flex"
      )}
    >
      <MediaRecordSelector
        isOpen={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        onSelect={(val) => {
          Transforms.insertNodes(editor, {
            type: "mediaRecord",
            id: val.id,
            children: [{ text: "" }],
          });
          setMediaSelectorOpen(false);
        }}
        mode="single"
        _mediaRecords={_allRecords}
      />
      <div className="w-full flex items-center flex-wrap">
        <StyledToggleButtonGroup
          size="small"
          exclusive
          aria-label="text alignment"
        >
          <ToggleButton
            value="left"
            selected={isBlockActive(editor, "left")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "left");
            }}
            aria-label="left aligned"
          >
            <FormatAlignLeft fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="center"
            selected={isBlockActive(editor, "center")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "center");
            }}
            aria-label="centered"
          >
            <FormatAlignCenter fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="right"
            selected={isBlockActive(editor, "right")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "right");
            }}
            aria-label="right aligned"
          >
            <FormatAlignRight fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="justify"
            selected={isBlockActive(editor, "justify")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "justify");
            }}
            aria-label="justified"
          >
            <FormatAlignJustify fontSize="small" />
          </ToggleButton>
        </StyledToggleButtonGroup>
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
        <StyledToggleButtonGroup size="small" aria-label="text formatting">
          <ToggleButton
            selected={isMarkActive(editor, "bold")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, "bold");
            }}
            value="bold"
            aria-label="bold"
          >
            <FormatBold fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={isMarkActive(editor, "italic")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, "italic");
            }}
            aria-label="italic"
          >
            <FormatItalic fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="underlined"
            selected={isMarkActive(editor, "underline")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, "underline");
            }}
            aria-label="underlined"
          >
            <FormatUnderlined fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="code"
            selected={isMarkActive(editor, "code")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, "code");
            }}
            aria-label="code"
          >
            <Code fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="h-1"
            selected={isBlockActive(editor, "heading-one")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "heading-one");
            }}
            aria-label="heading-1"
          >
            <LooksOne fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="h-2"
            selected={isBlockActive(editor, "heading-two")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "heading-two");
            }}
            aria-label="heading-2"
          >
            <LooksTwo fontSize="small" />
          </ToggleButton>

          <ToggleButton
            value="blockquote"
            selected={isBlockActive(editor, "block-quote")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "block-quote");
            }}
            aria-label="quote"
          >
            <FormatQuote fontSize="small" />
          </ToggleButton>

          <ToggleButton
            value="numbered-list"
            selected={isBlockActive(editor, "numbered-list")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "numbered-list");
            }}
            aria-label="numbered-list"
          >
            <FormatListNumbered fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="bulleted-list"
            selected={isBlockActive(editor, "bulleted-list")}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "bulleted-list");
            }}
            aria-label="bulleted-list"
          >
            <FormatListBulleted fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="bulleted-list"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock(editor, "bulleted-list");
            }}
            aria-label="bulleted-list"
          >
            <FormatListBulleted fontSize="small" />
          </ToggleButton>
        </StyledToggleButtonGroup>
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <StyledToggleButtonGroup size="small" aria-label="image">
          <ToggleButton
            value="media"
            onMouseDown={(e) => {
              e.preventDefault();
              setMediaSelectorOpen(true);
            }}
            aria-label="media"
          >
            <PermMedia fontSize="small" />
          </ToggleButton>
        </StyledToggleButtonGroup>
      </div>
    </div>
  );
}

const toggleBlock = (
  editor: BaseEditor & ReactEditor & HistoryEditor,
  format: CustomElement["type"] | AlignTypes
) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      // @ts-expect-error
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      // @ts-expect-error
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };

    // @ts-expect-error
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (
  editor: BaseEditor & ReactEditor & HistoryEditor,
  format: string
) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: BaseEditor & ReactEditor & HistoryEditor,
  format: CustomElement["type"] | AlignTypes,
  blockType = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        // @ts-expect-error
        n[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (
  editor: BaseEditor & ReactEditor & HistoryEditor,
  format: string
) => {
  const marks = Editor.marks(editor);
  // @ts-expect-error
  return marks ? marks[format] === true : false;
};

function Element(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const style = { textAlign: element.align };
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote
          className="border-l-2 pl-4 sm:pl-4 dark:border-gray-700 my-2"
          style={style}
          {...attributes}
        >
          <p className="text-gray-800">
            <em>{children}</em>
          </p>
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} className="list-disc list-inside" {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} className="text-xl font-semibold" {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} className="text-lg font-medium" {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} className="list-decimal list-inside" {...attributes}>
          {children}
        </ol>
      );
    case "mediaRecord":
      return <RenderMediaRecord {...props}></RenderMediaRecord>;
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
}

function RenderMediaRecord({ attributes, element }: RenderElementProps) {
  const { mediaRecordsByIds } =
    useLazyLoadQuery<RichTextEditorMediaRecordQuery>(
      graphql`
        query RichTextEditorMediaRecordQuery($id: UUID!) {
          mediaRecordsByIds(ids: [$id]) {
            ...studentContentMediaDisplayFragment
          }
        }
      `,
      { id: (element as any).id }
    );
  const inner = (
    <ContentMediaDisplay
      _record={mediaRecordsByIds[0]}
      onProgressChange={() => {}}
    />
  );

  try {
    const editor = useSlateStatic();
    const path = ReactEditor.findPath(editor, element);

    const selected = useSelected();
    const focused = useFocused();

    return (
      <div
        {...attributes}
        className={clsx("relative", {
          "border border-blue-600 rounded-lg": selected && focused,
        })}
      >
        <IconButton
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={clsx("absolute top-1 left-1")}
        >
          <Delete />
        </IconButton>

        {inner}
      </div>
    );
  } catch {
    // not inside a slate editor
    return inner;
  }
}

function Leaf({
  attributes,
  children,
  leaf,
}: Pick<RenderLeafProps, "attributes" | "children" | "leaf">) {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = (
      <code className="bg-gray-200 font-mono text-gray-800">{children}</code>
    );
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
}

export function RenderRichText({
  value,
}: {
  value: RichTextEditorFragment$key | undefined;
}) {
  const data = useFragment(
    graphql`
      fragment RichTextEditorFragment on ResourceMarkdown {
        text
      }
    `,
    value ?? null
  );

  if (!data) return null;

  const parsed = parseFromString(data.text);

  return (
    <>
      {parsed.map((x, idx) => (
        <RecursiveRichText key={idx} val={x}></RecursiveRichText>
      ))}
    </>
  );
}

function RecursiveRichText({ val }: { val: Descendant }) {
  if (SlateText.isText(val)) {
    return (
      <Leaf leaf={val} attributes={{ "data-slate-leaf": true }}>
        {val.text}
      </Leaf>
    );
  }

  const children = val.children.map((n, idx) => (
    <RecursiveRichText key={idx} val={n}></RecursiveRichText>
  ));

  return (
    <Element
      attributes={{ "data-slate-node": "element", ref: undefined }}
      element={val}
    >
      {children}
    </Element>
  );
}

const withMediaRecords = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === "mediaRecord" ? true : isVoid(element);
  };

  return editor;
};
