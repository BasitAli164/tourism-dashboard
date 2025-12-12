"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
} from "lucide-react";

export  function TipTapEditor({ content, onSave }: { content: string; onSave: (value: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <p>Loading editor...</p>;
  }

  return (
    <Card className="p-4 bg-slate-900 text-white rounded-lg">
      <div className="flex gap-2 mb-4">
        <Toggle onPressedChange={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </Toggle>
        <Toggle onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </Toggle>
      </div>
      <EditorContent editor={editor} className="p-2 border border-slate-700 rounded bg-slate-800" />
      <Button
        className="mt-4 bg-slate-700 hover:bg-slate-600"
        onClick={() => onSave(editor.getHTML())}
      >
        Save
      </Button>
    </Card>
  );
}