import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  currentImage?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  currentImage,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        setError("File too large or invalid format");
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (file.size > maxSize) {
          setError("File too large");
          return;
        }
        if (acceptedFiles.length > 0) {
          onFileSelect(acceptedFiles[0]);
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="h-[200px]  rounded-full border-2 border-white/20 cursor-pointer overflow-hidden hover:border-white/40 hover:bg-white/5 transition-all duration-200 relative group"
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <input {...getInputProps()} />

      <div className="h-full aspect-square flex items-center justify-center">
        <img
          src={preview || "./anon.png"}
          alt="Avatar"
          className="h-full w-full object-cover rounded-full"
        />
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center rounded-full">
        <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          📸
        </span>
      </div>

      {isDragActive && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
          <span className="text-white text-4xl">📸</span>
        </div>
      )}

      {error && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
};
