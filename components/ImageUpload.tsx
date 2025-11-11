import React, { useState, DragEvent, ChangeEvent } from 'react';
import { fileToBase64 } from '../utils/imageUtils';

interface ImageUploadProps {
  onImageUpload: (base64: string, mimeType: string) => void;
  currentImage?: string; // base64 dataURL
  loading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, currentImage, loading }) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        onImageUpload(base64, mimeType);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        alert("Failed to read image file.");
      }
    } else {
      alert("Please upload an image file (PNG, JPG, JPEG, GIF).");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 bg-background border-input shadow-sm
        ${isDragOver ? 'border-primary dark:border-primary-foreground' : 'border-input'}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !loading && document.getElementById('file-upload-input')?.click()}
    >
      <input
        id="file-upload-input"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={loading}
      />
      {currentImage ? (
        <img
          src={currentImage}
          alt="Uploaded preview"
          className="max-h-60 mx-auto mb-4 rounded-md shadow-md object-contain"
        />
      ) : (
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <p className="mt-1 text-sm text-muted-foreground">
        {currentImage ? 'Click or drag to change image' : 'Drag and drop an image here, or click to select'}
      </p>
      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
    </div>
  );
};

export default ImageUpload;