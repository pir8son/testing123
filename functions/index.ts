
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize the Admin SDK to access Firestore and Storage with privileges
admin.initializeApp();

/**
 * Helper to extract the storage file path from a standard Firebase Download URL.
 * 
 * Expected Format: 
 * https://firebasestorage.googleapis.com/v0/b/[BUCKET]/o/[PATH]?alt=media&token=...
 * 
 * We need to extract [PATH] and decode it (e.g. %2F -> /).
 */
const extractFilePath = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Regex to capture everything between "/o/" and "?alt=media"
    const matches = url.match(/\/o\/(.*?)\?alt=media/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
    return null;
  } catch (error) {
    logger.error("Error parsing storage URL", { url, error });
    return null;
  }
};

/**
 * Cloud Function: cleanupRecipeStorage
 * Triggers when a document is DELETED from the 'recipes' collection.
 */
export const cleanupRecipeStorage = onDocumentDeleted("recipes/{recipeId}", async (event) => {
  const snapshot = event.data;
  
  // If no data exists (shouldn't happen on delete trigger, but for safety)
  if (!snapshot) {
    return;
  }

  const data = snapshot.data();
  if (!data) {
    return;
  }

  const recipeId = event.params.recipeId;
  logger.info(`Recipe ${recipeId} deleted. Starting storage cleanup...`);

  // 1. Identify potential files to delete
  // We check videoUrl, thumbnailUrl, and imageUrl. 
  // Often imageUrl is the same as thumbnailUrl, so we deduplicate.
  const { videoUrl, thumbnailUrl, imageUrl } = data;
  
  const urlsToDelete = [videoUrl, thumbnailUrl, imageUrl].filter(
    (url) => 
      typeof url === "string" && 
      url.includes("firebasestorage.googleapis.com")
  );

  // Deduplicate URLs (using Set)
  const uniqueUrls = [...new Set(urlsToDelete)];

  if (uniqueUrls.length === 0) {
    logger.info(`No storage files found for recipe ${recipeId}.`);
    return;
  }

  const bucket = admin.storage().bucket();

  // 2. Execute Deletions in Parallel
  const deletePromises = uniqueUrls.map(async (url) => {
    const filePath = extractFilePath(url);
    
    if (!filePath) {
      logger.warn(`Could not parse file path from URL: ${url}`);
      return;
    }

    try {
      await bucket.file(filePath).delete();
      logger.info(`✅ Deleted file: ${filePath}`);
    } catch (error: any) {
      // 404 Error means the file is already gone (maybe deleted by client).
      // We consider this a success (state is clean).
      if (error.code === 404) {
        logger.info(`File already missing (skipped): ${filePath}`);
      } else {
        logger.error(`❌ Failed to delete file: ${filePath}`, error);
      }
    }
  });

  await Promise.all(deletePromises);
  logger.info(`Cleanup complete for recipe ${recipeId}`);
});
