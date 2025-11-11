import React, { useState, DragEvent, ChangeEvent } from 'react';
import { fileToBase64 } from '../utils/imageUtils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload } from './ui/icons';

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
    <Card 
      className={`relative border-2 border-dashed transition-colors duration-200 cursor-pointer
        ${isDragOver ? 'border-primary border-solid' : 'border-border'}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
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
      
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        {currentImage ? (
          <div className="w-full max-w-[200px] mx-auto">
            <img
              src={currentImage}
              alt="Uploaded preview"
              className="w-full h-auto rounded-md shadow-md object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">
            {currentImage ? 'Click or drag to change image' : 'Drag and drop an image here'}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, JPEG, GIF up to 10MB
          </p>
          {!currentImage && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-upload-input')?.click();
              }}
              disabled={loading}
            >
              Choose File
            </Button>
          )}
        </div>
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ImageUpload;