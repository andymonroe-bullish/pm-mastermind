"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventFile } from "@/lib/types";

export default function AdminFilesPage() {
  const supabase = createClient();
  const [files, setFiles] = useState<EventFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const { data } = await supabase
      .from("event_files")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (data) setFiles(data as EventFile[]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop() || "";
    const fileName = `${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("event-files")
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("event-files").getPublicUrl(uploadData.path);

    await supabase.from("event_files").insert({
      name: file.name,
      file_url: publicUrl,
      file_type: fileExt,
    });

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadFiles();
  };

  const deleteFile = async (file: EventFile) => {
    // Extract the storage path from the URL
    const urlParts = file.file_url.split("/event-files/");
    const storagePath = urlParts[urlParts.length - 1];

    if (storagePath) {
      await supabase.storage.from("event-files").remove([storagePath]);
    }

    await supabase.from("event_files").delete().eq("id", file.id);
    loadFiles();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark-text mb-6">Manage Files</h1>

      {/* Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wider mb-3">
          Upload File
        </h2>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan file:text-white hover:file:bg-cyan-hover file:cursor-pointer file:transition-colors"
          />
          {uploading && <span className="text-sm text-gray-400">Uploading...</span>}
        </div>
      </div>

      {/* Files list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wider mb-3">
          Uploaded Files ({files.length})
        </h2>

        {files.length === 0 ? (
          <p className="text-gray-400 text-sm">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-text text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {file.file_type?.toUpperCase()} &middot;{" "}
                    {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan hover:underline px-2 py-1"
                >
                  View
                </a>
                <button
                  onClick={() => deleteFile(file)}
                  className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
