// components/ImagePreview.jsx
import React from "react";

import {X} from 'lucide-react'
const ImagePreview = ({ imageUrl, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-full max-h-full p-4">
        <button
          className="absolute top-[-1rem] right-[-2rem] text-white bg-black/50 rounded-full p-1 hover:bg-black"
          onClick={onClose}
        >
          <X/>
        </button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-[90vw] max-h-[80vh] object-contain cursor-zoom-in"
        />
      </div>
    </div>
  );
};

export default ImagePreview;
