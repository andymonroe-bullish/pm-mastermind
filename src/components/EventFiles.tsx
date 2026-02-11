import type { EventFile } from "@/lib/types";

const fileIcons: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "📊",
  pptx: "📊",
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
  zip: "📦",
};

function getIcon(fileType: string | null) {
  if (!fileType) return "📎";
  const ext = fileType.toLowerCase();
  return fileIcons[ext] || "📎";
}

export default function EventFiles({ files }: { files: EventFile[] }) {
  if (files.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
          <span className="relative z-10">Event Files</span>
          <span className="absolute bottom-0 left-0 h-2 w-28 bg-cyan/20 -z-0" />
        </h2>
        <p className="text-gray-400 text-sm">No files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
        <span className="relative z-10">Event Files</span>
        <span className="absolute bottom-0 left-0 h-2 w-28 bg-cyan/20 -z-0" />
      </h2>

      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id}>
            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-xl">{getIcon(file.file_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-text group-hover:text-cyan transition-colors truncate">
                  {file.name}
                </p>
                {file.file_type && (
                  <p className="text-xs text-gray-400 uppercase">{file.file_type}</p>
                )}
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-cyan transition-colors flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
