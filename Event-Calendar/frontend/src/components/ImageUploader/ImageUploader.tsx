import React from "react";

interface ImageUploaderProps {
  previewURL: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

/**
 * ImageUploader component
 *
 * A reusable image upload UI component that supports both file selection via click
 * and drag-and-drop functionality. It displays a preview of the selected image
 * and provides an option to remove it.
 *
 * Props:
 * @param {string | null} previewURL - The URL of the image to be displayed as a preview. If null, nothing is shown (empty space).
 * @param {(file: File) => void} onFileSelect - Callback function that is called when a file is selected or dropped. Receives the selected `File` object as an argument.
 * @param {() => void} onRemove - Callback function that is called when the user clicks the remove button.
 *
 * Features:
 * - **Click to Upload:** Opens a hidden file input when the image area is clicked, allowing standard file selection.
 * - **Drag-and-Drop:** Users can drag and drop an image file directly onto the image area.
 * - **Image Preview:** Displays a circular preview of the selected image.
 * - **Remove Option:** Provides a '✕' button to remove the currently displayed image.
 *
 * Usage Example:
 * ```tsx
 * import React, { useState } from 'react';
 * import ImageUploader from './ImageUploader'; // Adjust path as necessary
 *
 * function MyComponent() {
 * const [selectedFile, setSelectedFile] = useState<File | null>(null);
 * const [imagePreview, setImagePreview] = useState<string | null>(null);
 *
 * const handleFileSelect = (file: File) => {
 * setSelectedFile(file);
 * setImagePreview(URL.createObjectURL(file));
 * };
 *
 * const handleRemoveImage = () => {
 * setSelectedFile(null);
 * if (imagePreview) {
 * URL.revokeObjectURL(imagePreview);
 * }
 * setImagePreview(null);
 * };
 *
 * return (
 * <ImageUploader
 * previewURL={imagePreview}
 * onFileSelect={handleFileSelect}
 * onRemove={handleRemoveImage}
 * />
 * );
 * }
 * ```
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  previewURL,
  onFileSelect,
  onRemove,
}) => {
    
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div className="relative flex items-start gap-4">
      <div
        onClick={() => document.getElementById("image-uploader-input")?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        title="Click or drop an image to upload"
        className="w-48 h-24 rounded-xl overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition group flex items-center justify-center">
        {previewURL ? (
          <img
            src={previewURL}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
            ?
          </div>
        )}
      </div>

      {previewURL && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove image"
          className="btn-danger">
          ✕
        </button>
      )}

      <input
        id="image-uploader-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
        }}
      />
    </div>
  );
};

export default ImageUploader;
