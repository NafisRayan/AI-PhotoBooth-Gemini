import React, { useState, useCallback, useRef } from 'react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  imagePreview?: string | null;
  isUploading?: boolean;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageClear,
  imagePreview,
  isUploading = false,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file: File) => file.type.startsWith('image/'));
    
    if (imageFile) {
      onImageUpload(imageFile);
    }
  }, [onImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  if (imagePreview) {
    return (
      <div className="space-y-4">
        <div className="relative group">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card">
            <img
              src={imagePreview}
              alt="Context preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={onImageClear}
                disabled={disabled || isUploading}
                className="shadow-lg"
              >
                Remove Image
              </Button>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={onImageClear}
          disabled={disabled || isUploading}
          className="w-full"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear Image
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragOver && "border-primary bg-primary/10",
          disabled || isUploading 
            ? "border-muted-foreground/25 cursor-not-allowed opacity-50" 
            : "border-muted-foreground/50",
          isUploading && "animate-pulse"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground">Uploading image...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragOver ? 'Drop your image here' : 'Upload an image'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground/75">
                  Supports: JPG, PNG, WebP, GIF (Max 5MB)
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                className="mt-4"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground/75 space-y-1">
        <p>• Image will be used as context for AI generation</p>
        <p>• Supported formats: JPG, PNG, WebP, GIF</p>
        <p>• Maximum file size: 5MB</p>
      </div>
    </div>
  );
};

export { ImageUpload };