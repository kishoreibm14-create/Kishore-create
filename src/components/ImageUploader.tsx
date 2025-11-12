import { Upload, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isAnalyzing: boolean;
}

export function ImageUploader({ onImageSelect, onUrlSubmit, isAnalyzing }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUrlSubmit(urlInput.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2 text-gray-700">
          Drop your image here
        </h3>
        <p className="text-gray-500 mb-4">or</p>
        <label className="inline-block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isAnalyzing}
          />
          <span className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors inline-block">
            Browse Files
          </span>
        </label>
        <p className="text-sm text-gray-400 mt-4">
          Supports JPG, PNG, WebP, GIF (Max 50MB)
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <form onSubmit={handleUrlSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL here..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isAnalyzing}
          />
        </div>
        <button
          type="submit"
          disabled={isAnalyzing || !urlInput.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze URL
        </button>
      </form>
    </div>
  );
}
