import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SECRET_KEY } from '../config/env.js';

const supabaseUrl = SUPABASE_URL || '';
const supabaseKey = SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * EvidenceService
 * Handles evidence file uploads to Supabase Storage.
 */
export class EvidenceService {
  /**
   * Generates a pre-signed URL for direct-to-bucket upload from the frontend.
   * @param {string} assignmentId 
   * @param {string} fileName 
   * @returns {Promise<{signedUploadUrl: string, path: string}>}
   */
  static async getPresignedUploadUrl(assignmentId, fileName) {
    // Generate a unique path for the evidence file
    const timestamp = Date.now();
    const filePath = `${assignmentId}/${timestamp}_${fileName}`;

    // Note: createSignedUploadUrl is available in newer Supabase storage-js
    const { data, error } = await supabase
      .storage
      .from('evidence')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error("Supabase storage error:", error);
      throw new Error('Failed to generate pre-signed upload URL');
    }

    return {
      signedUploadUrl: data.signedUrl,
      path: data.path,
      token: data.token // Needed for some client libraries
    };
  }

  /**
   * Generates a pre-signed URL for downloading/viewing the evidence.
   */
  static async getPresignedDownloadUrl(filePath, expiresIn = 3600) {
    const { data, error } = await supabase
      .storage
      .from('evidence')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Supabase storage error:", error);
      throw new Error('Failed to generate pre-signed download URL');
    }

    return {
      downloadUrl: data.signedUrl
    };
  }
}
