"use client";

import { useEffect, useRef, type ClipboardEvent } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function textToParagraphHtml(text: string) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!blocks.length) return "";

  return blocks
    .map((line) =>
      `<p>${line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</p>`,
    )
    .join("");
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastExternalValue = useRef<string>("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== lastExternalValue.current && value !== editor.innerHTML) {
      editor.innerHTML = value || "";
      lastExternalValue.current = value || "";
    }
  }, [value]);

  function emitChange() {
    const html = editorRef.current?.innerHTML || "";
    lastExternalValue.current = html;
    onChange(html);
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function runCommand(command: string, commandValue?: string) {
    focusEditor();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function makeParagraph() {
    runCommand("formatBlock", "p");
  }

  function makeHeading() {
    runCommand("formatBlock", "h2");
  }

  function makeQuote() {
    runCommand("formatBlock", "blockquote");
  }

  function makeLink() {
    const url = window.prompt("Paste the link URL");
    if (!url) return;
    runCommand("createLink", url);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    // If the source provides reasonable HTML from Google Docs/Word, keep common structure.
    // Otherwise, turn plain text/newlines into proper paragraphs automatically.
    const insert = html
      ? html
          .replace(/<meta[^>]*>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<script[\s\S]*?<\/script>/gi, "")
      : textToParagraphHtml(text);

    document.execCommand("insertHTML", false, insert);
    emitChange();
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2 rounded-2xl border bg-slate-50 p-2">
        <button type="button" onClick={makeParagraph} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Paragraph</button>
        <button type="button" onClick={makeHeading} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Heading</button>
        <button type="button" onClick={() => runCommand("bold")} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Bold</button>
        <button type="button" onClick={() => runCommand("italic")} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Italic</button>
        <button type="button" onClick={makeQuote} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Quote</button>
        <button type="button" onClick={() => runCommand("insertUnorderedList")} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Bullets</button>
        <button type="button" onClick={makeLink} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Link</button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        className="min-h-[520px] rounded-2xl border bg-white px-4 py-4 text-base leading-8 text-slate-900 outline-none focus:border-hgnBlue focus:ring-2 focus:ring-hgnBlue/20 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-black [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      />

      <p className="text-sm text-slate-500">
        Paste from Word or Google Docs, then press Enter for paragraphs. Formatting is saved automatically as clean article HTML.
      </p>
    </div>
  );
}
