import { useState } from 'react';
import { Shield, Layers, FileText, Sparkles } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { BatchAnalyzer } from './components/BatchAnalyzer';
import { imageAnalyzer } from './lib/imageAnalyzer';
import { supabase, ImageAnalysis } from './lib/supabase';
import { generateForensicReport, downloadReport } from './utils/reportGenerator';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ImageAnalysis | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [showBatchAnalyzer, setShowBatchAnalyzer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await imageAnalyzer.analyzeImage(file);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;
        setCurrentImageUrl(imageUrl);

        const img = new Image();
        img.onload = async () => {
          const { data, error: dbError } = await supabase
            .from('image_analyses')
            .insert({
              image_url: imageUrl,
              file_name: file.name,
              file_size: file.size,
              image_width: img.width,
              image_height: img.height,
              result_type: result.resultType,
              manipulation_score: result.manipulationScore,
              trust_score: result.trustScore,
              explanation: result.explanation,
              detection_details: result.detectionDetails,
              heatmap_data: result.heatmapData,
              metadata_analysis: result.metadataAnalysis,
              processing_time_ms: result.processingTimeMs
            })
            .select()
            .single();

          if (dbError) {
            console.error('Database error:', dbError);
            setError('Failed to save analysis results');
          } else if (data) {
            setCurrentAnalysis(data);
          }
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFromUrl = async (url: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'image-from-url.jpg', { type: blob.type });
      await analyzeImage(file);
    } catch (err) {
      console.error('URL fetch error:', err);
      setError('Failed to fetch image from URL. Please check the URL and try again.');
      setIsAnalyzing(false);
    }
  };

  const handleBatchAnalyze = async (files: File[]) => {
    for (const file of files) {
      await analyzeImage(file);
    }
    setShowBatchAnalyzer(false);
  };

  const handleGenerateReport = () => {
    if (!currentAnalysis || !currentImageUrl) return;

    const reportHtml = generateForensicReport(currentAnalysis, currentImageUrl);
    const fileName = `TruePic-Report-${currentAnalysis.id.slice(0, 8)}.html`;
    downloadReport(reportHtml, fileName);
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setCurrentImageUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TruePic AI</h1>
              <p className="text-xs text-gray-600">Advanced Image Authenticity Detection</p>
            </div>
          </div>
          <div className="flex gap-3">
            {currentAnalysis && (
              <button
                onClick={handleNewAnalysis}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                New Analysis
              </button>
            )}
            <button
              onClick={() => setShowBatchAnalyzer(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Batch Analysis
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {!currentAnalysis && !isAnalyzing && (
          <>
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Detect Image Manipulation with AI
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upload any image to analyze its authenticity using advanced computer vision algorithms.
                Detect edits, AI generation, and manipulation with ultra-high accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pixel Analysis</h3>
                <p className="text-gray-600">
                  Detects anomalies and inconsistencies at the pixel level that indicate manipulation.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI Detection</h3>
                <p className="text-gray-600">
                  Identifies artifacts from GAN and diffusion models like DALL-E, Midjourney, and Stable Diffusion.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Forensic Reports</h3>
                <p className="text-gray-600">
                  Generate professional reports with detailed analysis and visual heatmaps.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            <ImageUploader
              onImageSelect={analyzeImage}
              onUrlSubmit={analyzeFromUrl}
              isAnalyzing={isAnalyzing}
            />
          </>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Shield className="w-12 h-12 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mt-8">Analyzing Image...</h3>
            <p className="text-gray-600 mt-2">Running advanced detection algorithms</p>
            <div className="mt-6 space-y-2 text-center">
              <div className="text-sm text-gray-500">✓ Checking pixel anomalies</div>
              <div className="text-sm text-gray-500">✓ Analyzing lighting consistency</div>
              <div className="text-sm text-gray-500">✓ Detecting AI artifacts</div>
              <div className="text-sm text-gray-500">✓ Validating metadata</div>
              <div className="text-sm text-gray-500">✓ Generating results</div>
            </div>
          </div>
        )}

        {currentAnalysis && currentImageUrl && (
          <AnalysisResult
            analysis={currentAnalysis}
            imageUrl={currentImageUrl}
            onGenerateReport={handleGenerateReport}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p className="mb-2">
            <span className="font-semibold">TruePic AI</span> - Advanced Image Authenticity Detection
          </p>
          <p className="text-sm">
            Powered by computer vision and machine learning algorithms
          </p>
        </div>
      </footer>

      {showBatchAnalyzer && (
        <BatchAnalyzer
          onBatchAnalyze={handleBatchAnalyze}
          onClose={() => setShowBatchAnalyzer(false)}
        />
      )}
    </div>
  );
}

export default App;
