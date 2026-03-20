"use client";

import { useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateGroupCoverUrl } from "@/app/groups/actions";

const TARGET_W = 1200;
const TARGET_H = 400;

async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_W;
      canvas.height = TARGET_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas unavailable")); return; }

      const targetRatio = TARGET_W / TARGET_H;
      const imgRatio = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

interface Props {
  groupId: string;
  groupSlug: string;
}

export default function GroupCoverUpload({ groupId, groupSlug }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const blob = await resizeImage(file);
      const supabase = createClient();
      const path = `${groupId}/cover.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("group-covers")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) {
        setError("Upload failed.");
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("group-covers")
        .getPublicUrl(path);

      const res = await updateGroupCoverUrl(groupId, `${publicUrl}?t=${Date.now()}`, groupSlug);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not process image.");
    }

    setUploading(false);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }, [groupId, groupSlug, router]);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        title="Update cover photo"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/60 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        {uploading ? "Uploading…" : "Update cover"}
      </button>
      {error && (
        <span className="text-xs text-red-300 ml-2">{error}</span>
      )}
    </>
  );
}
