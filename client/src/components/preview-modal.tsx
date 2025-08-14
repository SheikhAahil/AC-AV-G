import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileData, fileStorage } from "@/lib/fileStorage";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileData | null;
}

export default function PreviewModal({ isOpen, onClose, file }: PreviewModalProps) {
  if (!isOpen || !file) return null;

  const handleDownload = () => {
    if (!file) return;
    const url = fileStorage.getFileUrl(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderPreview = () => {
    if (!file) return null;
    
    if (file.mimeType.startsWith('image/')) {
      const imageUrl = fileStorage.getFileUrl(file);
      return (
        <img 
          src={imageUrl}
          alt={file.originalName}
          className="max-w-full max-h-full object-contain"
          onLoad={() => {
            // Clean up the URL after the image loads
            setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
          }}
        />
      );
    }
    
    if (file.mimeType === 'application/pdf') {
      const pdfUrl = fileStorage.getFileUrl(file);
      return (
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={file.originalName}
          onLoad={() => {
            // Clean up the URL after the iframe loads
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
          }}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <p>Preview not available for this file type</p>
          <p className="text-sm mt-2">File: {file.originalName}</p>
          <p className="text-sm">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4">
        <div className="surface rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-secondary truncate">{file.originalName}</h3>
            <div className="flex gap-2">
              <Button 
                onClick={handleDownload}
                className="bg-primary text-white hover:bg-blue-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="h-96 overflow-auto p-4">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
