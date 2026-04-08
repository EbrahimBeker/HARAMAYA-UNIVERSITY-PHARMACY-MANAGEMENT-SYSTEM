import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { useState } from "react";

const ImageViewerModal = ({ imageUrl, onClose, title = "Image Viewer" }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "payment-receipt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm p-4 flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>

          {/* Zoom Level */}
          <span className="text-white text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all"
            title="Rotate"
          >
            <RotateCw size={20} />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all"
            title="Download"
          >
            <Download size={20} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 bg-red-500 bg-opacity-80 hover:bg-opacity-100 rounded-lg text-white transition-all"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="w-full h-full flex items-center justify-center p-20 overflow-auto">
        <img
          src={imageUrl}
          alt="Payment Receipt"
          className="max-w-full max-h-full object-contain transition-all duration-300 cursor-move"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 backdrop-blur-sm px-4 py-2 rounded-lg">
        <p className="text-white text-sm text-center">
          Use controls above to zoom, rotate, or download the image
        </p>
      </div>
    </div>
  );
};

export default ImageViewerModal;
