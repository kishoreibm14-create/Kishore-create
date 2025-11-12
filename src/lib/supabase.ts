import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ImageAnalysis {
  id: string;
  user_id?: string;
  image_url: string;
  file_name: string;
  file_size: number;
  image_width: number;
  image_height: number;
  result_type: 'real' | 'edited' | 'ai_generated';
  manipulation_score: number;
  trust_score: number;
  explanation: string;
  detection_details: Record<string, unknown>;
  heatmap_data: Record<string, unknown>;
  metadata_analysis: Record<string, unknown>;
  processing_time_ms: number;
  created_at: string;
}

export interface BatchAnalysis {
  id: string;
  user_id?: string;
  total_images: number;
  completed_images: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}
