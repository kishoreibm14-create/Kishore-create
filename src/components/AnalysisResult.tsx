import { CheckCircle, AlertTriangle, XCircle, Download } from 'lucide-react';
import { ImageAnalysis } from '../lib/supabase';

interface AnalysisResultProps {
  analysis: ImageAnalysis;
  imageUrl: string;
  onGenerateReport: () => void;
}

export function AnalysisResult({ analysis, imageUrl, onGenerateReport }: AnalysisResultProps) {
  const getResultConfig = () => {
    switch (analysis.result_type) {
      case 'real':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Authentic Image',
          description: 'This image appears to be genuine and unmodified'
        };
      case 'edited':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Edited Image',
          description: 'This image shows signs of digital manipulation'
        };
      case 'ai_generated':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'AI Generated',
          description: 'This image appears to be created by artificial intelligence'
        };
    }
  };

  const config = getResultConfig();
  const Icon = config.icon;
  const details = analysis.detection_details as {
    pixelAnomalies?: { detected: boolean; severity: number; description: string };
    lightingShadows?: { consistent: boolean; score: number; description: string };
    aiArtifacts?: { detected: boolean; confidence: number; description: string };
    metadata?: { authentic: boolean; flags: string[]; description: string };
    semanticLogic?: { logical: boolean; score: number; description: string };
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className={`border-2 ${config.borderColor} ${config.bgColor} rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          <Icon className={`w-12 h-12 ${config.color} flex-shrink-0`} />
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${config.color} mb-1`}>
              {config.label}
            </h2>
            <p className="text-gray-700 mb-4">{config.description}</p>
            <div className="flex gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Manipulation Score</div>
                <div className={`text-3xl font-bold ${config.color}`}>
                  {Math.round(analysis.manipulation_score)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Trust Score</div>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(analysis.trust_score)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Processing Time</div>
                <div className="text-3xl font-bold text-gray-700">
                  {analysis.processing_time_ms}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Analyzed Image</h3>
          <div className="relative">
            <img
              src={imageUrl}
              alt="Analyzed"
              className="w-full h-auto rounded-lg"
            />
            {analysis.heatmap_data && (analysis.heatmap_data as { regions?: Array<{ x: number; y: number; width: number; height: number; intensity: number }> }).regions && (analysis.heatmap_data as { regions: Array<{ x: number; y: number; width: number; height: number; intensity: number }> }).regions.length > 0 && (
              <div className="absolute inset-0">
                {(analysis.heatmap_data as { regions: Array<{ x: number; y: number; width: number; height: number; intensity: number }> }).regions.map((region, idx) => (
                  <div
                    key={idx}
                    className="absolute border-2 border-red-500 bg-red-500"
                    style={{
                      left: `${region.x * 100}%`,
                      top: `${region.y * 100}%`,
                      width: `${region.width * 100}%`,
                      height: `${region.height * 100}%`,
                      opacity: region.intensity * 0.3
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">File: {analysis.file_name}</div>
            <div className="text-sm text-gray-600">
              Dimensions: {analysis.image_width} × {analysis.image_height}
            </div>
            <div className="text-sm text-gray-600">
              Size: {(analysis.file_size / 1024).toFixed(2)} KB
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Analysis Explanation</h3>
            <p className="text-gray-700 leading-relaxed">{analysis.explanation}</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Detection Details</h3>
            <div className="space-y-3">
              {details?.pixelAnomalies && (
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${details.pixelAnomalies.detected ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="font-semibold text-gray-800">Pixel Anomalies</div>
                    <div className="text-sm text-gray-600">{details.pixelAnomalies.description}</div>
                    <div className="text-sm text-gray-500">Severity: {details.pixelAnomalies.severity}%</div>
                  </div>
                </div>
              )}

              {details?.lightingShadows && (
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${details.lightingShadows.consistent ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-semibold text-gray-800">Lighting & Shadows</div>
                    <div className="text-sm text-gray-600">{details.lightingShadows.description}</div>
                    <div className="text-sm text-gray-500">Consistency: {details.lightingShadows.score}%</div>
                  </div>
                </div>
              )}

              {details?.aiArtifacts && (
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${details.aiArtifacts.detected ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="font-semibold text-gray-800">AI Artifacts</div>
                    <div className="text-sm text-gray-600">{details.aiArtifacts.description}</div>
                    <div className="text-sm text-gray-500">Confidence: {details.aiArtifacts.confidence}%</div>
                  </div>
                </div>
              )}

              {details?.metadata && (
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${details.metadata.authentic ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-semibold text-gray-800">Metadata Analysis</div>
                    <div className="text-sm text-gray-600">{details.metadata.description}</div>
                    {details.metadata.flags.length > 0 && (
                      <div className="text-sm text-gray-500">Flags: {details.metadata.flags.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}

              {details?.semanticLogic && (
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${details.semanticLogic.logical ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-semibold text-gray-800">Semantic Logic</div>
                    <div className="text-sm text-gray-600">{details.semanticLogic.description}</div>
                    <div className="text-sm text-gray-500">Score: {details.semanticLogic.score}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onGenerateReport}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            <Download className="w-5 h-5" />
            Generate Forensic Report
          </button>
        </div>
      </div>
    </div>
  );
}
