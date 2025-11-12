import { Upload, X, Loader } from 'lucide-react';
import { useState } from 'react';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  result?: {
    resultType: 'real' | 'edited' | 'ai_generated';
    manipulationScore: number;
    trustScore: number;
  };
}

interface BatchAnalyzerProps {
  onBatchAnalyze: (files: File[]) => Promise<void>;
  onClose: () => void;
}

export function BatchAnalyzer({ onBatchAnalyze, onClose }: BatchAnalyzerProps) {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFilesAdd = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const batchFiles: BatchFile[] = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...batchFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    const fileList = files.map(f => f.file);

    try {
      await onBatchAnalyze(fileList);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'analyzing': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
    }
  };

  const getResultColor = (resultType?: string) => {
    switch (resultType) {
      case 'real': return 'bg-green-100 text-green-800';
      case 'edited': return 'bg-yellow-100 text-yellow-800';
      case 'ai_generated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Batch Analysis</h2>
            <p className="text-gray-600">Analyze multiple images simultaneously</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer mb-6">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesAdd(e.target.files)}
              className="hidden"
              disabled={isAnalyzing}
            />
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-700 font-medium">Click to add images</p>
            <p className="text-sm text-gray-500">or drag and drop</p>
          </label>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">
                  {files.length} {files.length === 1 ? 'Image' : 'Images'} Selected
                </h3>
                {!isAnalyzing && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {file.file.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(file.file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>

                  {file.result && (
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResultColor(file.result.resultType)}`}>
                        {file.result.resultType.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Trust: {file.result.trustScore}%
                      </span>
                    </div>
                  )}

                  <div className={`font-medium ${getStatusColor(file.status)}`}>
                    {file.status === 'analyzing' ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      file.status
                    )}
                  </div>

                  {!isAnalyzing && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={isAnalyzing}
          >
            Cancel
          </button>
          <button
            onClick={handleAnalyze}
            disabled={files.length === 0 || isAnalyzing}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              `Analyze ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
