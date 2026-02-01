
import { parseRecipeFromImage } from './geminiService';
import { Recipe } from '../types';

/**
 * Extracts a high-quality frame from a video file locally in the browser.
 * This avoids uploading the entire video for analysis.
 */
export const extractFrameFromVideo = (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    // Wait for metadata to load so we know duration/dimensions
    video.onloadedmetadata = () => {
      // Seek to 1 second or 20% of duration, whichever is shorter, to avoid black frames at start
      let seekTime = 1;
      if (video.duration < 5) {
          seekTime = video.duration * 0.2;
      }
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        // Scale down if video is 4K to save tokens/bandwidth (max 1080p width is sufficient for text OCR)
        const maxDimension = 1920;
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > maxDimension || height > maxDimension) {
            const ratio = width / height;
            if (width > height) {
                width = maxDimension;
                height = maxDimension / ratio;
            } else {
                height = maxDimension;
                width = maxDimension * ratio;
            }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }

        ctx.drawImage(video, 0, 0, width, height);
        
        // Export to base64 JPEG
        const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        // Cleanup
        URL.revokeObjectURL(objectUrl);
        video.remove(); // Help GC
        
        resolve(base64Data);
      } catch (e) {
        reject(e);
      }
    };

    video.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Video failed to load for analysis"));
    };
  });
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const mediaAnalysisService = {
    /**
     * Unified analysis function.
     * If video: extracts frame locally -> sends frame to AI.
     * If image: sends image to AI.
     */
    analyzeMedia: async (file: File): Promise<Partial<Recipe>> => {
        const isVideo = file.type.startsWith('video/');
        let imageBase64 = '';

        if (isVideo) {
            console.log("🎥 Extracting frame from video for fast analysis...");
            imageBase64 = await extractFrameFromVideo(file);
        } else {
            console.log("📸 Processing image...");
            imageBase64 = await fileToBase64(file);
        }

        // Use the existing image parser for both cases
        return await parseRecipeFromImage(imageBase64);
    }
};
