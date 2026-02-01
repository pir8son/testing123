
import { storage } from './firebaseConfig';
// @ts-ignore -- Resolves TS error claiming exports are missing in firebase/storage module
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Uploads a file to Firebase Storage with progress monitoring.
   * @param file The file object (File)
   * @param folder The target folder ('images' or 'videos')
   * @param onProgress Optional callback for upload progress (0-100)
   */
  uploadFile: (
    file: File, 
    folder: 'images' | 'videos', 
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!storage) {
        reject(new Error("Firebase Storage not initialized"));
        return;
      }

      // Create a unique filename: timestamp_sanitizedName
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `recipe_${folder}/${timestamp}_${sanitizedName}`;
      
      const storageRef = ref(storage, path);
      
      // Use Resumable Upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot: any) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        }, 
        (error: any) => {
          console.error("Upload failed:", error);
          reject(error);
        }, 
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }
};
