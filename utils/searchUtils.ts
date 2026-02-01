
/**
 * SEARCH INDEXING UTILITIES
 * 
 * Generates an array of search tokens from a string.
 * Used to populate the 'keywords' field in Firestore documents.
 */
export const generateKeywords = (text: string): string[] => {
    if (!text) return [];
    
    // 1. Convert to lowercase
    // 2. Remove punctuation/special chars (keep alphanumeric and spaces)
    // 3. Split by whitespace
    // 4. Filter empty strings
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '') 
        .split(/\s+/)
        .filter(w => w.length > 0);
    
    // 5. Deduplicate
    return [...new Set(words)];
};
