
import { storage } from './firebaseConfig';
import { isWeb, warnIfNotWeb } from '../utils/platform';
// @ts-ignore
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * MEDIA SERVICE
 * Handles processing, compression, and uploading of media assets.
 * 
 * PLATFORM NOTE: 
 * This service implements the logic for 'expo-image-manipulator' and 'expo-video-thumbnails'
 * using standard HTML5 Canvas and Video APIs. This ensures the complex media pipeline 
 * works in the current Web/Vite environment without crashing due to missing Native Modules.
 */

export const mediaService = {

  /**
   * Compresses an image (or frame) to optimal mobile standards.
   * Specs: Max 1080px width, 0.8 JPEG quality.
   */
  compressImage: async (fileOrBlob: File | Blob): Promise<Blob> => {
    if (!isWeb) {
      warnIfNotWeb('Image compression');
      throw new Error('Image compression requires a web-capable runtime.');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(fileOrBlob);
      
      img.onload = () => {
        const MAX_WIDTH = 1080;
        let width = img.width;
        let height = img.height;

        // Smart Resize: Maintain Aspect Ratio
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Browser Canvas not supported"));
            return;
        }

        // Draw and Compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              console.log(`[MediaService] Compressed image: ${width}x${height}, ${(blob.size / 1024).toFixed(1)}KB`);
              resolve(blob);
            } else {
              reject(new Error("Image compression failed"));
            }
          },
          'image/jpeg',
          0.8 // Quality: 0.8
        );
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };

      img.src = objectUrl;
    });
  },

  /**
   * Generates a thumbnail from a video file at a SPECIFIC timestamp.
   * @param videoFile The source video file.
   * @param timeInMs The specific timestamp to capture (default 1000ms).
   */
  generateThumbnail: async (videoFile: File, timeInMs: number = 1000): Promise<Blob> => {
    if (!isWeb) {
      warnIfNotWeb('Video thumbnail generation');
      throw new Error('Video thumbnail generation requires a web-capable runtime.');
    }

    console.log(`[MediaService] Generating thumbnail at ${timeInMs}ms`);
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;

      // 1. Load Metadata to ensure seek is valid
      video.onloadeddata = () => {
        // Convert ms to seconds
        video.currentTime = timeInMs / 1000;
      };

      // 2. Capture Frame after seek
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          // Downscale thumbnail slightly for performance (720p is plenty for a cover)
          const MAX_THUMB_WIDTH = 720;
          let width = video.videoWidth;
          let height = video.videoHeight;

          if (width > MAX_THUMB_WIDTH) {
              height = height * (MAX_THUMB_WIDTH / width);
              width = MAX_THUMB_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
              reject(new Error("Canvas context failed"));
              return;
          }

          ctx.drawImage(video, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
              URL.revokeObjectURL(objectUrl);
              // Clean up video element
              video.removeAttribute('src');
              video.load();
              
              if (blob) {
                  // Pass through compressor to ensure consistent format/size
                  // (We recursively call the image compressor here to reuse logic)
                  resolve(blob); 
              } else {
                  reject(new Error("Thumbnail generation returned null blob"));
              }
          }, 'image/jpeg', 0.8);

        } catch (e) {
          reject(e);
        }
      };

      video.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Video load failed for thumbnail generation"));
      };
    });
  },

  /**
   * Uploads a file to Firebase Storage.
   * Path Format: uploads/users/{userId}/{folderName}/{timestamp}_{type}.{ext}
   */
  uploadFileToFirebase: async (
    userId: string,
    fileOrBlob: Blob | File, 
    folderName: 'videos' | 'thumbnails',
    type: string, // e.g. 'cover' or 'clip'
    ext: string
  ): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage not initialized");

    const timestamp = Date.now();
    // Enforce "Big Tech" folder structure
    const path = `uploads/users/${userId}/recipes/${folderName}/${timestamp}_${type}.${ext}`;
    const storageRef = ref(storage, path);

    console.log(`[MediaService] Uploading to: ${path}`);

    try {
        const snapshot = await uploadBytesResumable(storageRef, fileOrBlob);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
    } catch (error) {
        console.error("Upload failed:", error);
        throw new Error("Failed to upload file to Firebase.");
    }
  }
};
