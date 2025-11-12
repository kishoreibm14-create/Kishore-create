import { ImageAnalysis } from '../lib/supabase';

export function generateForensicReport(analysis: ImageAnalysis, imageDataUrl: string): string {
  const details = analysis.detection_details as {
    pixelAnomalies?: { detected: boolean; severity: number; description: string };
    lightingShadows?: { consistent: boolean; score: number; description: string };
    aiArtifacts?: { detected: boolean; confidence: number; description: string };
    metadata?: { authentic: boolean; flags: string[]; description: string };
    semanticLogic?: { logical: boolean; score: number; description: string };
  };

  const report = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TruePic AI - Forensic Analysis Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }

    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 36px;
      margin-bottom: 10px;
    }

    .header p {
      font-size: 18px;
      opacity: 0.9;
    }

    .summary {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .result-badge {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 20px;
    }

    .result-real {
      background: #dcfce7;
      color: #166534;
    }

    .result-edited {
      background: #fef3c7;
      color: #92400e;
    }

    .result-ai {
      background: #fee2e2;
      color: #991b1b;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .metric {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
    }

    .metric-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
    }

    .section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }

    .image-container {
      text-align: center;
      margin: 20px 0;
    }

    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .detection-item {
      display: flex;
      align-items: start;
      gap: 15px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .status-pass {
      background: #10b981;
    }

    .status-fail {
      background: #ef4444;
    }

    .detection-content {
      flex: 1;
    }

    .detection-title {
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .detection-description {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .detection-score {
      color: #9ca3af;
      font-size: 13px;
    }

    .footer {
      text-align: center;
      color: #6b7280;
      padding: 30px;
      font-size: 14px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background: #f3f4f6;
      font-weight: bold;
      color: #1f2937;
    }

    @media print {
      body {
        background: white;
      }

      .section, .summary, .header {
        box-shadow: none;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 TruePic AI</h1>
    <p>Forensic Image Analysis Report</p>
  </div>

  <div class="summary">
    <span class="result-badge result-${analysis.result_type === 'real' ? 'real' : analysis.result_type === 'edited' ? 'edited' : 'ai'}">
      ${analysis.result_type === 'real' ? '✓ AUTHENTIC IMAGE' : analysis.result_type === 'edited' ? '⚠ EDITED IMAGE' : '✗ AI GENERATED'}
    </span>

    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Manipulation Score</div>
        <div class="metric-value">${Math.round(analysis.manipulation_score)}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">Trust Score</div>
        <div class="metric-value">${Math.round(analysis.trust_score)}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">Processing Time</div>
        <div class="metric-value">${analysis.processing_time_ms}ms</div>
      </div>
    </div>

    <p style="margin-top: 20px; color: #4b5563; font-size: 16px;">
      ${analysis.explanation}
    </p>
  </div>

  <div class="section">
    <h2>Analyzed Image</h2>
    <div class="image-container">
      <img src="${imageDataUrl}" alt="Analyzed Image" />
    </div>
    <table>
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>File Name</td>
        <td>${analysis.file_name}</td>
      </tr>
      <tr>
        <td>Dimensions</td>
        <td>${analysis.image_width} × ${analysis.image_height} pixels</td>
      </tr>
      <tr>
        <td>File Size</td>
        <td>${(analysis.file_size / 1024).toFixed(2)} KB</td>
      </tr>
      <tr>
        <td>Analysis Date</td>
        <td>${new Date(analysis.created_at).toLocaleString()}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Detection Analysis</h2>

    ${details?.pixelAnomalies ? `
    <div class="detection-item">
      <div class="status-indicator ${details.pixelAnomalies.detected ? 'status-fail' : 'status-pass'}"></div>
      <div class="detection-content">
        <div class="detection-title">Pixel Anomaly Detection</div>
        <div class="detection-description">${details.pixelAnomalies.description}</div>
        <div class="detection-score">Severity: ${details.pixelAnomalies.severity}%</div>
      </div>
    </div>
    ` : ''}

    ${details?.lightingShadows ? `
    <div class="detection-item">
      <div class="status-indicator ${details.lightingShadows.consistent ? 'status-pass' : 'status-fail'}"></div>
      <div class="detection-content">
        <div class="detection-title">Lighting & Shadow Analysis</div>
        <div class="detection-description">${details.lightingShadows.description}</div>
        <div class="detection-score">Consistency Score: ${details.lightingShadows.score}%</div>
      </div>
    </div>
    ` : ''}

    ${details?.aiArtifacts ? `
    <div class="detection-item">
      <div class="status-indicator ${details.aiArtifacts.detected ? 'status-fail' : 'status-pass'}"></div>
      <div class="detection-content">
        <div class="detection-title">AI Artifact Detection</div>
        <div class="detection-description">${details.aiArtifacts.description}</div>
        <div class="detection-score">AI Confidence: ${details.aiArtifacts.confidence}%</div>
      </div>
    </div>
    ` : ''}

    ${details?.metadata ? `
    <div class="detection-item">
      <div class="status-indicator ${details.metadata.authentic ? 'status-pass' : 'status-fail'}"></div>
      <div class="detection-content">
        <div class="detection-title">Metadata Analysis</div>
        <div class="detection-description">${details.metadata.description}</div>
        ${details.metadata.flags.length > 0 ? `<div class="detection-score">Flags: ${details.metadata.flags.join(', ')}</div>` : ''}
      </div>
    </div>
    ` : ''}

    ${details?.semanticLogic ? `
    <div class="detection-item">
      <div class="status-indicator ${details.semanticLogic.logical ? 'status-pass' : 'status-fail'}"></div>
      <div class="detection-content">
        <div class="detection-title">Semantic Logic Analysis</div>
        <div class="detection-description">${details.semanticLogic.description}</div>
        <div class="detection-score">Logic Score: ${details.semanticLogic.score}%</div>
      </div>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2>Technical Summary</h2>
    <p style="color: #6b7280; margin-bottom: 15px;">
      This analysis was performed using advanced computer vision algorithms that examine multiple aspects of the image:
    </p>
    <ul style="color: #6b7280; margin-left: 20px;">
      <li>Pixel-level discontinuity detection</li>
      <li>Lighting consistency verification</li>
      <li>GAN and diffusion model artifact identification</li>
      <li>Metadata authenticity validation</li>
      <li>Semantic composition analysis</li>
    </ul>
  </div>

  <div class="footer">
    <p>Generated by TruePic AI - Advanced Image Authenticity Detection</p>
    <p>Report ID: ${analysis.id}</p>
    <p>© ${new Date().getFullYear()} TruePic AI. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();

  return report;
}

export function downloadReport(html: string, fileName: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
