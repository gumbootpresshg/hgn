"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type PointerEvent } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

type MediaSettings = {
  id: string;
  align: "center" | "left" | "right";
  size: "full" | "large" | "medium" | "small";
  crop: "original" | "landscape" | "square" | "portrait" | "custom";
  border: boolean;
  caption: string;
  credit: string;
  alt: string;
  isGallery: boolean;
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
  const draggedMediaIdRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaSettings | null>(null);
  const [mediaRect, setMediaRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== lastExternalValue.current && value !== editor.innerHTML) {
      editor.innerHTML = value || "";
      lastExternalValue.current = value || "";
    }
    editor.querySelectorAll<HTMLElement>("figure").forEach((figure) => { figure.draggable = true; });
  }, [value]);

  useEffect(() => {
    const refresh = () => refreshMediaRect();
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);
    return () => { window.removeEventListener("resize", refresh); window.removeEventListener("scroll", refresh, true); };
  // selectedMedia deliberately triggers a fresh measurement after the photo is selected.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedia?.id]);

  function emitChange() {
    const html = editorRef.current?.innerHTML || "";
    lastExternalValue.current = html;
    onChange(html);
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function selectedFigure() {
    if (!selectedMedia || !editorRef.current) return null;
    return editorRef.current.querySelector<HTMLElement>(`figure[data-media-id="${selectedMedia.id}"]`);
  }

  function refreshMediaRect() {
    const figure = selectedFigure();
    setMediaRect(figure ? figure.getBoundingClientRect() : null);
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

  function mediaSettingsFor(figure: HTMLElement): MediaSettings {
    const id = figure.dataset.mediaId || crypto.randomUUID();
    figure.dataset.mediaId = id;
    const caption = figure.querySelector<HTMLElement>(".article-caption")?.textContent || "";
    const credit = figure.querySelector<HTMLElement>(".article-credit")?.textContent?.replace(/^Photo:\s*/i, "") || "";
    const image = figure.querySelector<HTMLImageElement>("img");
    return {
      id,
      align: (figure.dataset.align as MediaSettings["align"]) || "center",
      size: (figure.dataset.size as MediaSettings["size"]) || "full",
      crop: (figure.dataset.crop as MediaSettings["crop"]) || "original",
      border: figure.dataset.border === "true",
      caption,
      credit,
      alt: image?.alt || "",
      isGallery: figure.dataset.gallery === "true",
    };
  }

  function selectFigure(figure: HTMLElement) {
    const settings = mediaSettingsFor(figure);
    figure.draggable = true;
    editorRef.current?.querySelectorAll<HTMLElement>("figure[data-selected-media]").forEach((item) => delete item.dataset.selectedMedia);
    figure.dataset.selectedMedia = "true";
    setSelectedMedia(settings);
    emitChange();
    window.requestAnimationFrame(refreshMediaRect);
  }

  function updateSelectedMedia(change: Partial<MediaSettings>) {
    if (!selectedMedia || !editorRef.current) return;
    const figure = editorRef.current.querySelector<HTMLElement>(`figure[data-media-id="${selectedMedia.id}"]`);
    if (!figure) return;
    const next = { ...selectedMedia, ...change };
    figure.dataset.align = next.align;
    figure.dataset.size = next.size;
    figure.dataset.crop = next.crop;
    figure.dataset.border = next.border ? "true" : "false";
    let figcaption = figure.querySelector<HTMLElement>("figcaption");
    if (!figcaption) {
      figcaption = document.createElement("figcaption");
      figure.append(figcaption);
    }
    figcaption.innerHTML = `<span class="article-caption"></span><span class="article-credit"></span>`;
    const caption = figcaption.querySelector<HTMLElement>(".article-caption");
    const credit = figcaption.querySelector<HTMLElement>(".article-credit");
    if (caption) caption.textContent = next.caption;
    if (credit) credit.textContent = next.credit ? `Photo: ${next.credit}` : "";
    figure.querySelectorAll<HTMLImageElement>("img").forEach((image, index) => {
      image.alt = next.alt || (next.isGallery ? `Article gallery photo ${index + 1}` : "Article photo");
    });
    setSelectedMedia(next);
    emitChange();
    window.requestAnimationFrame(refreshMediaRect);
  }

  function toggleCropMode() {
    const figure = selectedFigure();
    if (!figure || !selectedMedia) return;
    const image = figure.querySelector<HTMLImageElement>("img");
    if (figure.dataset.crop === "custom") {
      figure.dataset.crop = "original";
      figure.style.height = "";
      if (image) image.style.objectPosition = "";
      setUploadMessage("Crop mode off. The full photo is showing again.");
    } else {
      const rect = figure.getBoundingClientRect();
      figure.dataset.crop = "custom";
      figure.style.height = `${Math.max(140, Math.round(rect.height || rect.width * 0.75))}px`;
      if (image) image.style.objectPosition = "50% 50%";
      setUploadMessage("Crop mode is on. Drag the photo to choose the crop; drag the lower-right corner to resize the crop frame.");
    }
    setSelectedMedia(mediaSettingsFor(figure));
    emitChange();
    window.requestAnimationFrame(refreshMediaRect);
  }

  function beginResize(event: PointerEvent<HTMLButtonElement>) {
    const figure = selectedFigure();
    if (!figure) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = figure.getBoundingClientRect().width;
    const startHeight = figure.getBoundingClientRect().height;
    const editorWidth = editorRef.current?.getBoundingClientRect().width || 1000;
    const customCrop = figure.dataset.crop === "custom";
    const move = (moveEvent: globalThis.PointerEvent) => {
      const width = Math.max(140, Math.min(editorWidth, Math.round(startWidth + moveEvent.clientX - startX)));
      figure.style.width = `${width}px`;
      if (customCrop) figure.style.height = `${Math.max(120, Math.round(startHeight + moveEvent.clientY - startY))}px`;
      refreshMediaRect();
    };
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); emitChange(); refreshMediaRect(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
  }

  function beginCropMove(event: PointerEvent<HTMLButtonElement>) {
    const figure = selectedFigure();
    const image = figure?.querySelector<HTMLImageElement>("img");
    if (!figure || !image || figure.dataset.crop !== "custom") return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const [originX = 50, originY = 50] = image.style.objectPosition.split(" ").map((value) => Number.parseFloat(value) || 50);
    const rect = figure.getBoundingClientRect();
    const move = (moveEvent: globalThis.PointerEvent) => {
      const x = Math.max(0, Math.min(100, originX - ((moveEvent.clientX - startX) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, originY - ((moveEvent.clientY - startY) / rect.height) * 100));
      image.style.objectPosition = `${x}% ${y}%`;
    };
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); emitChange(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
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

      const mediaId = crypto.randomUUID();
      const imagesHtml = uploaded.map((url, index) => `<img src="${url}" alt="${uploaded.length > 1 ? `Article gallery photo ${index + 1}` : "Article photo"}" loading="lazy" decoding="async" />`).join("");
      const html = uploaded.length === 1
        ? `<figure data-media-id="${mediaId}" data-align="center" data-size="full" data-crop="original" data-border="false">${imagesHtml}<figcaption><span class="article-caption"></span><span class="article-credit"></span></figcaption></figure><p><br></p>`
        : `<figure data-media-id="${mediaId}" data-gallery="true" data-align="center" data-size="full" data-crop="original" data-border="false">${imagesHtml}<figcaption><span class="article-caption"></span><span class="article-credit"></span></figcaption></figure><p><br></p>`;
      insertHtml(html);
      const figure = editorRef.current?.querySelector<HTMLElement>(`figure[data-media-id="${mediaId}"]`);
      if (figure) selectFigure(figure);
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
    event.preventDefault();
    const movingId = draggedMediaIdRef.current;
    if (movingId && editorRef.current) {
      const movingFigure = editorRef.current.querySelector<HTMLElement>(`figure[data-media-id="${movingId}"]`);
      const target = event.target as HTMLElement;
      const targetBlock = target.closest("p,h2,h3,h4,blockquote,ul,ol,figure");
      if (movingFigure && targetBlock && targetBlock !== movingFigure && editorRef.current.contains(targetBlock)) {
        const rect = targetBlock.getBoundingClientRect();
        targetBlock.insertAdjacentElement(event.clientY > rect.top + rect.height / 2 ? "afterend" : "beforebegin", movingFigure);
        selectFigure(movingFigure);
        setUploadMessage("Photo moved in the story.");
      }
      draggedMediaIdRef.current = null;
      emitChange();
      return;
    }
    if (!files.some((file) => file.type.startsWith("image/"))) return;
    placeDropCaret(event);
    void uploadAndInsert(files);
  }

  function handleEditorClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const figure = target.closest("figure");
    if (figure && editorRef.current?.contains(figure)) selectFigure(figure);
    else {
      editorRef.current?.querySelectorAll<HTMLElement>("figure[data-selected-media]").forEach((item) => delete item.dataset.selectedMedia);
      setSelectedMedia(null);
      setMediaRect(null);
    }
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const figure = target.closest<HTMLElement>("figure");
    if (!figure || !editorRef.current?.contains(figure)) return;
    const settings = mediaSettingsFor(figure);
    draggedMediaIdRef.current = settings.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", settings.id);
    selectFigure(figure);
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

      {selectedMedia ? (
        <section className="rounded-2xl border border-hgnBlue/30 bg-sky-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-sm font-black text-hgnNavy">{selectedMedia.isGallery ? "Gallery settings" : "Photo settings"}</p><p className="text-xs text-slate-600">Click another photo in the story to edit it.</p></div>
            <button type="button" onClick={() => setSelectedMedia(null)} className="rounded-lg border bg-white px-3 py-1.5 text-xs font-black">Close</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1 text-xs font-black uppercase tracking-wide">Position
              <select value={selectedMedia.align} onChange={(event) => updateSelectedMedia({ align: event.target.value as MediaSettings["align"] })}><option value="center">Full line</option><option value="left">Wrap text right</option><option value="right">Wrap text left</option></select>
            </label>
            <label className="grid gap-1 text-xs font-black uppercase tracking-wide">Display size
              <select value={selectedMedia.size} onChange={(event) => updateSelectedMedia({ size: event.target.value as MediaSettings["size"] })}><option value="full">Full width</option><option value="large">Large</option><option value="medium">Medium</option><option value="small">Small</option></select>
            </label>
            <div className="grid gap-1 text-xs font-black uppercase tracking-wide"><span>Crop</span><button type="button" onClick={toggleCropMode} className="rounded border bg-white px-3 py-2 text-sm font-black normal-case">{selectedMedia.crop === "custom" ? "Finish crop" : "Crop photo"}</button></div>
            <label className="flex items-end gap-2 pb-2 text-sm font-black"><input type="checkbox" checked={selectedMedia.border} onChange={(event) => updateSelectedMedia({ border: event.target.checked })} className="h-4 w-4" />Add border</label>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold">Caption<input value={selectedMedia.caption} onChange={(event) => updateSelectedMedia({ caption: event.target.value })} placeholder="Optional caption" /></label>
            <label className="grid gap-1 text-sm font-bold">Photo credit<input value={selectedMedia.credit} onChange={(event) => updateSelectedMedia({ credit: event.target.value })} placeholder="Optional photographer or source" /></label>
          </div>
          <label className="mt-3 grid gap-1 text-sm font-bold">Photo description <span className="font-normal text-slate-500">(for readers using screen readers)</span><input value={selectedMedia.alt} onChange={(event) => updateSelectedMedia({ alt: event.target.value })} placeholder="Describe what is in the photo" /></label>
        </section>
      ) : null}

      {selectedMedia && mediaRect ? (
        <div className="fixed z-50 pointer-events-none" style={{ left: mediaRect.left, top: mediaRect.top, width: mediaRect.width, height: mediaRect.height }}>
          {selectedMedia.crop === "custom" ? <button type="button" aria-label="Drag photo within crop" onPointerDown={beginCropMove} className="pointer-events-auto absolute left-2 top-2 cursor-move rounded bg-slate-950/80 px-2 py-1 text-xs font-black text-white">Drag photo</button> : null}
          <button type="button" aria-label="Drag to resize photo" onPointerDown={beginResize} className="pointer-events-auto absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize border-2 border-white bg-hgnBlue shadow" />
        </div>
      ) : null}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onClick={handleEditorClick}
        onDragStart={handleDragStart}
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
