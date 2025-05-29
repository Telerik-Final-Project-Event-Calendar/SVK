import React from "react";

interface ImageUploaderProps {
  previewURL: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

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
