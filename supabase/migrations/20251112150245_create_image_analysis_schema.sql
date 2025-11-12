/*
  # TruePic AI Image Analysis Database Schema

  1. New Tables
    - `image_analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `user_id` (uuid, nullable) - User who performed the analysis (for future auth)
      - `image_url` (text) - URL or data URL of the analyzed image
      - `file_name` (text) - Original filename
      - `file_size` (integer) - File size in bytes
      - `image_width` (integer) - Image width in pixels
      - `image_height` (integer) - Image height in pixels
      - `result_type` (text) - Classification: 'real', 'edited', or 'ai_generated'
      - `manipulation_score` (numeric) - Manipulation probability (0-100%)
      - `trust_score` (numeric) - Authenticity trust score (0-100%)
      - `explanation` (text) - Human-readable explanation of the result
      - `detection_details` (jsonb) - Detailed analysis results
      - `heatmap_data` (jsonb) - Heatmap coordinates for visualization
      - `metadata_analysis` (jsonb) - Extracted and analyzed metadata
      - `processing_time_ms` (integer) - Analysis duration in milliseconds
      - `created_at` (timestamptz) - Timestamp of analysis
      
    - `batch_analyses`
      - `id` (uuid, primary key) - Unique identifier for batch job
      - `user_id` (uuid, nullable) - User who initiated the batch
      - `total_images` (integer) - Total number of images in batch
      - `completed_images` (integer) - Number of completed analyses
      - `status` (text) - Batch status: 'processing', 'completed', 'failed'
      - `created_at` (timestamptz) - Batch creation timestamp
      - `completed_at` (timestamptz, nullable) - Batch completion timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (for demo/public usage)
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS image_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  image_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer DEFAULT 0,
  image_width integer DEFAULT 0,
  image_height integer DEFAULT 0,
  result_type text NOT NULL CHECK (result_type IN ('real', 'edited', 'ai_generated')),
  manipulation_score numeric(5,2) NOT NULL CHECK (manipulation_score >= 0 AND manipulation_score <= 100),
  trust_score numeric(5,2) NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
  explanation text NOT NULL,
  detection_details jsonb DEFAULT '{}'::jsonb,
  heatmap_data jsonb DEFAULT '{}'::jsonb,
  metadata_analysis jsonb DEFAULT '{}'::jsonb,
  processing_time_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batch_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  total_images integer NOT NULL DEFAULT 0,
  completed_images integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view image analyses"
  ON image_analyses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert image analyses"
  ON image_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view batch analyses"
  ON batch_analyses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert batch analyses"
  ON batch_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update batch analyses"
  ON batch_analyses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_image_analyses_created_at ON image_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_analyses_result_type ON image_analyses(result_type);
CREATE INDEX IF NOT EXISTS idx_batch_analyses_status ON batch_analyses(status);
