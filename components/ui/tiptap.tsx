"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import {
   Bold,
   Italic,
   Underline as UnderlineIcon,
   List,
   ListOrdered,
   Heading1,
   Heading2,
   Heading3,
   Quote,
   Undo,
   Redo,
   Code,
} from "lucide-react";

interface ToolbarProps {
   editor: Editor | null;
}

function Toolbar({ editor }: ToolbarProps) {
   if (!editor) return null;

   return (
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/30 p-1">
         <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
         >
            <Bold className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
         >
            <Italic className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
         >
            <UnderlineIcon className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            aria-label="Code"
         >
            <Code className="h-4 w-4" />
         </Toggle>

         <div className="mx-1 h-6 w-px bg-border" />

         <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() =>
               editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            aria-label="Heading 1"
         >
            <Heading1 className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() =>
               editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Heading 2"
         >
            <Heading2 className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() =>
               editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            aria-label="Heading 3"
         >
            <Heading3 className="h-4 w-4" />
         </Toggle>

         <div className="mx-1 h-6 w-px bg-border" />

         <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
               editor.chain().focus().toggleBulletList().run()
            }
            aria-label="Bullet List"
         >
            <List className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
               editor.chain().focus().toggleOrderedList().run()
            }
            aria-label="Ordered List"
         >
            <ListOrdered className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
               editor.chain().focus().toggleBlockquote().run()
            }
            aria-label="Blockquote"
         >
            <Quote className="h-4 w-4" />
         </Toggle>

         <div className="mx-1 h-6 w-px bg-border" />

         <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            aria-label="Undo"
         >
            <Undo className="h-4 w-4" />
         </Toggle>
         <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            aria-label="Redo"
         >
            <Redo className="h-4 w-4" />
         </Toggle>
      </div>
   );
}

interface TiptapProps {
   content?: string;
   onChange?: (content: string) => void;
   placeholder?: string;
   className?: string;
   editorClassName?: string;
}

export function Tiptap({
   content = "",
   onChange,
   placeholder = "Write something...",
   className,
   editorClassName,
}: TiptapProps) {
   const editor = useEditor({
      extensions: [
         StarterKit.configure({
            heading: {
               levels: [1, 2, 3],
            },
         }),
         Underline,
      ],
      content,
      editorProps: {
         attributes: {
            class: cn(
               "prose prose-sm dark:prose-invert max-w-none min-h-32 w-full px-3 py-2 focus:outline-none",
               "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:my-2",
               "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4",
               "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-3",
               "[&_h3]:text-lg [&_h3]:font-medium [&_h3]:my-2",
               "[&_ul]:list-disc [&_ul]:pl-6",
               "[&_ol]:list-decimal [&_ol]:pl-6",
               "[&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-4 [&_blockquote]:italic",
               "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
               "[&_hr]:my-4 [&_hr]:border-border",
               editorClassName
            ),
         },
      },
      onUpdate: ({ editor }) => {
         onChange?.(editor.getHTML());
      },
      immediatelyRender: false,
   });

   // Sync editor content when content prop changes (e.g., form reset)
   useEffect(() => {
      if (editor && content !== editor.getHTML()) {
         editor.commands.setContent(content);
      }
   }, [content, editor]);

   return (
      <div
         className={cn(
            "overflow-hidden rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className
         )}
      >
         <Toolbar editor={editor} />
         <EditorContent
            editor={editor}
            placeholder={placeholder}
         />
      </div>
   );
}

export { useEditor, type Editor };
