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
 * - previewURL: string | null  
 *   The URL of the image to be displayed as a preview. If null, a placeholder is shown.
 * 
 * - onFileSelect: (file: File) => void  
 *   Callback function that is called when a file is selected or dropped. 
 *   Receives the selected File object as an argument.
 * 
 * - onRemove: () => void  
 *   Callback function that is called when the user clicks the remove button.
 * 
 * Features:
 * - Click to upload: Opens a hidden file input when the image area is clicked.
 * - Drag-and-drop: Users can drop an image file onto the image area.
 * - Image preview: Displays the selected image in a circular frame.
 * - Remove option: Allows removing the selected image by clicking a ✕ button.
 * 
 * Usage Example:
 * ```tsx
 * <ImageUploader
 *   previewURL={imageURL}
 *   onFileSelect={(file) => setSelectedFile(file)}
 *   onRemove={() => setSelectedFile(null)}
 * />
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
        className="w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition group">
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
