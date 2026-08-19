"use client";

/**
 * RichTextEditor — CKEditor 5 wrapper for the admin blog editor.
 *
 * Dynamically imported (SSR-safe). Uses SimpleUploadAdapter to push inline
 * images directly to our /blogs/upload-inline endpoint which returns Cloudinary URLs.
 *
 * Usage:
 *   <RichTextEditor value={html} onChange={setHtml} />
 */

import { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** API base URL — defaults to (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") */
  apiUrl?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your blog post…",
  disabled = false,
  apiUrl,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const ckRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = apiUrl || (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";

  // Initialize CKEditor on mount (client only)
  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        // Dynamic import — keeps ~1MB bundle out of SSR
        const ClassicEditor: any = (
          await import("@ckeditor/ckeditor5-build-classic")
        ).default;

        if (destroyed || !editorRef.current) return;

        const editor = await ClassicEditor.create(editorRef.current, {
          placeholder,
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "outdent",
              "indent",
              "|",
              "blockQuote",
              "imageUpload",
              "insertTable",
              "mediaEmbed",
              "|",
              "undo",
              "redo",
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
            ],
          },
          image: {
            toolbar: [
              "imageTextAlternative",
              "|",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
            ],
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
          // SimpleUploadAdapter posts inline images to our backend.
          // Backend returns { url } shape that CKEditor expects.
          simpleUpload: {
            uploadUrl: `${base}/blogs/upload-inline`,
            withCredentials: true,
            headers: {
              // Authorization header is set via cookie (httpOnly) – withCredentials handles it.
              // If your app uses Bearer tokens instead, populate it here:
              // Authorization: `Bearer ${token}`,
            },
          },
          link: { defaultProtocol: "https://" },
        });

        // Set initial value
        if (value) editor.setData(value);

        editor.model.document.on("change:data", () => {
          onChange(editor.getData());
        });

        if (disabled) editor.enableReadOnlyMode("admin-disabled");

        ckRef.current = editor;
        setLoaded(true);
      } catch (e: any) {
        console.error("CKEditor init error", e);
        setError(e?.message || "Editor failed to load");
      }
    }

    init();

    return () => {
      destroyed = true;
      if (ckRef.current) {
        ckRef.current.destroy().catch(() => {});
        ckRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect external value changes (e.g., loading a draft into the editor)
  useEffect(() => {
    const editor = ckRef.current;
    if (!editor) return;
    const current = editor.getData();
    if (value !== current) {
      editor.setData(value || "");
    }
  }, [value]);

  // Enable / disable
  useEffect(() => {
    const editor = ckRef.current;
    if (!editor) return;
    if (disabled) editor.enableReadOnlyMode("admin-disabled");
    else editor.disableReadOnlyMode("admin-disabled");
  }, [disabled]);

  return (
    <div className="rich-text-editor">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-2">
          {error}
        </div>
      )}
      {!loaded && !error && (
        <div className="text-sm text-muted-foreground px-3 py-8 border rounded-md bg-muted/30 text-center">
          Loading editor…
        </div>
      )}
      <div ref={editorRef} style={{ display: loaded ? "block" : "none" }} />

      {/* Minimal in-component styles so editor looks right without extra CSS imports.
          If your project uses Tailwind globally, the heights and borders here are
          enough; deeper theming is in the project-level CSS (see SETUP.md). */}
      <style jsx global>{`
        .rich-text-editor .ck-editor__editable_inline {
          min-height: 400px;
          max-height: 700px;
          border: 1px solid hsl(var(--border, 220 13% 91%)) !important;
          border-radius: 0 0 8px 8px;
          padding: 0.75rem 1rem;
        }
        .rich-text-editor .ck-toolbar {
          border-radius: 8px 8px 0 0 !important;
          border-color: hsl(var(--border, 220 13% 91%)) !important;
        }
        .rich-text-editor .ck-content h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .rich-text-editor .ck-content h2 { font-size: 1.5rem; font-weight: 700; margin: 0.9rem 0 0.5rem; }
        .rich-text-editor .ck-content h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .rich-text-editor .ck-content p { margin: 0.5rem 0; line-height: 1.7; }
        .rich-text-editor .ck-content ul,
        .rich-text-editor .ck-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-text-editor .ck-content blockquote {
          border-left: 4px solid hsl(var(--primary, 222 47% 51%));
          padding: 0.25rem 0 0.25rem 1rem;
          color: hsl(var(--muted-foreground, 220 9% 46%));
          margin: 0.75rem 0;
          font-style: italic;
        }
        .rich-text-editor .ck-content img { max-width: 100%; border-radius: 6px; }
        .rich-text-editor .ck-content a { color: hsl(var(--primary, 222 47% 51%)); text-decoration: underline; }
      `}</style>
    </div>
  );
}
