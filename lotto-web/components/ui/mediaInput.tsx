import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface MediaInputProps {
  label?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  error?: string;
  className?: string;
}

function MediaInput({ label, accept = "image/*", onChange, error, className = "" }: MediaInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    onChange?.(file);
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {label && (
        <label className="text-muted-foreground pointer-events-none absolute left-2 top-1 -translate-y-1/2 bg-background px-1 text-lg font-regular z-10">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative min-h-[120px] w-full rounded-[4px] border-2 border-dashed transition-all
          ${isDragging ? 'border-primary bg-primary/5' : error ? 'border-red-500' : 'border-gray-300'}
          ${!selectedFile ? 'cursor-pointer' : ''}
        `}
        onClick={!selectedFile ? handleBrowseClick : undefined}
      >
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-primary hover:text-primary/80">Browse</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept === "image/*" ? "PNG, JPG, GIF up to 10MB" : "Upload your file"}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4">
            {preview ? (
              <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
