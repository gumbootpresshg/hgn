"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from "react";

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

async function articleReadyImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");

  const source = await createImageBitmap(file);
  const longestSide = Math.max(source.width, source.height);
  const scale = Math.min(1, 2000 / longestSide);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare this image.");
  context.drawImage(source, 0, 0, width, height);
  source.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
  if (!blob) throw new Error("Could not prepare this image.");
  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "article-photo";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastExternalValue = useRef<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

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

  function rememberSelection() {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection?.rangeCount || !editor) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) savedRangeRef.current = range.cloneRange();
  }

  function restoreSelection() {
    const range = savedRangeRef.current;
    const editor = editorRef.current;
    if (!range || !editor) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    editor.focus();
  }

  function runCommand(command: string, commandValue?: string) {
    restoreSelection();
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

  function insertHtml(html: string) {
    restoreSelection();
    const editor = editorRef.current;
    if (!editor) return;
    document.execCommand("insertHTML", false, html);
    emitChange();
    rememberSelection();
  }

  async function uploadAndInsert(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;
    if (images.length > 12) {
      setUploadMessage("Add up to 12 photos at a time.");
      return;
    }

    setUploading(true);
    setUploadMessage(`Preparing ${images.length === 1 ? "photo" : `${images.length} photos`}…`);
    try {
      const { supabase } = await import("@/lib/supabase");
      const uploaded: string[] = [];
      for (let index = 0; index < images.length; index += 1) {
        setUploadMessage(`Preparing and uploading ${index + 1} of ${images.length}…`);
        const prepared = await articleReadyImage(images[index]);
        const path = `inline/${new Date().getFullYear()}/${crypto.randomUUID()}-${prepared.name}`;
        const { error } = await supabase.storage.from("article-images").upload(path, prepared, { cacheControl: "31536000", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("article-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      const imagesHtml = uploaded.map((url, index) => `<img src="${url}" alt="Article photo ${index + 1}" loading="lazy" decoding="async" />`).join("");
      const html = uploaded.length === 1
        ? `<figure>${imagesHtml}<figcaption>Photo</figcaption></figure><p><br></p>`
        : `<figure data-gallery="true">${imagesHtml}<figcaption>Photo gallery</figcaption></figure><p><br></p>`;
      insertHtml(html);
      setUploadMessage(uploaded.length === 1 ? "Photo added to the article." : `${uploaded.length} photos added as a gallery.`);
    } catch (error: any) {
      setUploadMessage(`Could not upload image${images.length === 1 ? "" : "s"}: ${error?.message || "please try again."}`);
    } finally {
      setUploading(false);
    }
  }

  function chooseImages(kind: "image" | "gallery") {
    rememberSelection();
    (kind === "image" ? imageInputRef : galleryInputRef).current?.click();
  }

  function placeDropCaret(event: DragEvent<HTMLDivElement>) {
    const editor = editorRef.current;
    if (!editor) return;
    const documentWithCaret = document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null };
    const range = documentWithCaret.caretRangeFromPoint?.(event.clientX, event.clientY);
    if (!range || !editor.contains(range.commonAncestorContainer)) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    savedRangeRef.current = range.cloneRange();
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

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    const files = Array.from(event.dataTransfer.files || []);
    if (!files.some((file) => file.type.startsWith("image/"))) return;
    event.preventDefault();
    placeDropCaret(event);
    void uploadAndInsert(files);
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
        <button type="button" disabled={uploading} onClick={() => chooseImages("image")} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm disabled:opacity-50">Add image</button>
        <button type="button" disabled={uploading} onClick={() => chooseImages("gallery")} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm disabled:opacity-50">Add gallery</button>
      </div>

      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const files = Array.from(event.target.files || []); event.currentTarget.value = ""; void uploadAndInsert(files.slice(0, 1)); }} />
      <input ref={galleryInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const files = Array.from(event.target.files || []); event.currentTarget.value = ""; void uploadAndInsert(files); }} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onPaste={handlePaste}
        onDragOver={(event) => { if (Array.from(event.dataTransfer.types).includes("Files")) event.preventDefault(); }}
        onDrop={handleDrop}
        className="min-h-[520px] rounded-2xl border bg-white px-4 py-4 text-base leading-8 text-slate-900 outline-none focus:border-hgnBlue focus:ring-2 focus:ring-hgnBlue/20 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_figure]:my-6 [&_figure_img]:my-0 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-black [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      />

      <p className="text-sm text-slate-500">
        Paste from Word or Google Docs, then press Enter for paragraphs. Drag a photo into the exact spot you want it, or drop several photos together to make a gallery. Photos are resized before uploading.
      </p>
      {uploadMessage ? <p role="status" className="text-sm font-bold text-hgnNavy">{uploadMessage}</p> : null}
    </div>
  );
}
