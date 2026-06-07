import React, { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import type { UploadingDoc } from "../../types/upload.type";



const DocUploadSection: React.FC = () => {
  const [files, setFiles] = useState<UploadingDoc[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Helper: Format File Size ---
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // --- Simulate File Upload Progress ---
  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5; // Random increment
      
      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, progress: 100, status: Math.random() > 0.1 ? "completed" : "error", error: "Upload failed. Please try again." }
              : f
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 300);
  };

  // --- Core Handlers ---
  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(
      (file) => file.type === "application/pdf" || file.type.startsWith("image/") || file.type.startsWith("text/")
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
    <div className="w-full max-w-xl mx-auto p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all duration-300">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Upload documents</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Support for PDFs, Images, and Text files. Max file size 10MB.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out
          ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
              : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 hover:bg-zinc-100/50 dark:bg-zinc-900/30 dark:hover:bg-zinc-800/30"
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

        <div className={`p-3 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 transition-transform duration-200 group-hover:scale-105 ${isDragging ? "text-indigo-500" : "text-zinc-400 dark:text-zinc-500"}`}>
          <Upload className="w-5 h-5" />
        </div>

        <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">PDF, PNG, JPG, or TXT</p>
      </div>

      {/* Progress & File List Section */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3 max-h-64 overflow-y-auto pr-1">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Files</p>
          
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/20"
            >
              {/* File Icon */}
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="truncate pr-4">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">{file.name}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{file.size}</p>
                  </div>
                  
                  {/* Status Badges / Trigger Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {file.status === "uploading" && (
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {file.progress}%
                      </span>
                    )}
                    {file.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {file.status === "error" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Container */}
                {file.status === "uploading" && (
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Error Message */}
                {file.status === "error" && file.error && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{file.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocUploadSection