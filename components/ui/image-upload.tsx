"use client";
import { useRef } from "react";

export default function ImageUpload({ value, onChange }: { value?: string; onChange: (url: string, file?: File) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url, file);
  };

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <img src={value} alt="Event" className="w-full h-32 object-cover rounded-xl border" />
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 border border-primary"
        onClick={() => fileInput.current?.click()}
      >
        {value ? "Change Image" : "Upload Image"}
      </button>
    </div>
  );
}
