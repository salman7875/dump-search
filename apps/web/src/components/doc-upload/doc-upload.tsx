import React, {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import type { UploadingDoc } from "../../types/upload.type";

const DocUploadSection: React.FC = () => {
  const [files, setFiles] = useState<UploadingDoc[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;

      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  progress: 100,
                  status: Math.random() > 0.1 ? "completed" : "error",
                  error: "Upload failed. Please try again.",
                }
              : f,
          ),
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f)),
        );
      }
    }, 300);
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.type.startsWith("text/"),
    );

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const newFile: UploadingDoc = {
        id: crypto.randomUUID(),
        name: file.name,
        size: formatFileSize(file.size),
        progress: 0,
        status: "uploading",
      };

      setFiles((prev) => [newFile, ...prev]);
      simulateUpload(newFile.id);
    });
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-md border border-zinc-200">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-zinc-900">
          Upload documents
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Support for PDFs, Images, and Text files. Max file size 10MB.
        </p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group flex flex-col items-center justify-center w-full h-44 border border-dashed rounded cursor-pointer transition-colors
          ${
            isDragging
              ? "border-zinc-900 bg-zinc-50"
              : "border-zinc-200 bg-white hover:bg-zinc-50/50"
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          accept=".pdf,image/*,text/*"
          className="hidden"
          aria-label="Upload files"
        />

        <div className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
          <Upload className="w-5 h-5" />
        </div>

        <p className="mt-3 text-sm text-zinc-600">
          <span className="text-zinc-900 font-medium underline underline-offset-2">
            Click to upload
          </span>{" "}
          or drag and drop
        </p>
        <p className="mt-1 text-xs text-zinc-400">PDF, PNG, JPG, or TXT</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Files
          </p>

          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded border border-zinc-100 bg-zinc-50/50"
            >
              <div className="p-2 bg-white border border-zinc-200 rounded text-zinc-600 shrink-0">
                <FileText className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="truncate pr-4">
                    <p className="text-xs font-medium text-zinc-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {file.size}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.status === "uploading" && (
                      <span className="text-xs font-medium text-zinc-900 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                        {file.progress}%
                      </span>
                    )}
                    {file.status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-zinc-400" />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded hover:bg-zinc-100 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {file.status === "uploading" && (
                  <div className="w-full h-1 bg-zinc-200/60 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-zinc-900 transition-all duration-300 ease-out"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {file.status === "error" && file.error && (
                  <p className="text-[11px] text-zinc-500 mt-1 font-normal">
                    {file.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocUploadSection;
