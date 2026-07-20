import pb from '@/lib/pocketbaseClient.js';

/**
 * Appends a cache-busting timestamp to a URL.
 * @param {string} url - The original URL.
 * @returns {string|null} The URL with the cache-busting parameter, or null if no URL provided.
 */
export const getLogoCacheUrl = (url) => {
  if (!url) return null;
  // If the URL already has query parameters, append with &, otherwise with ?
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

/**
 * Uploads a logo file to the 'logotipos' collection.
 * Creates the record if it doesn't exist, updates it if it does.
 * @param {File} file - The file object to upload.
 * @param {string} type - The type of logo ('header' or 'login').
 * @returns {Promise<{success: boolean, record: object, url: string}>} Result object.
 */
export const uploadLogoFile = async (file, type) => {
  try {
    let recordId;
    
    // Check if record exists
    try {
      const existing = await pb.collection('logotipos').getFirstListItem(`tipo="${type}"`, { 
        $autoCancel: false 
      });
      recordId = existing.id;
    } catch (err) {
      // If not found, create an empty record first
      if (err.status === 404) {
        const newRecord = await pb.collection('logotipos').create({ 
          tipo: type, 
          nombre: `Logo ${type.charAt(0).toUpperCase() + type.slice(1)}` 
        }, { 
          $autoCancel: false 
        });
        recordId = newRecord.id;
      } else {
        throw err;
      }
    }

    // Upload the file to the record
    const formData = new FormData();
    formData.append('archivo', file);
    
    const updatedRecord = await pb.collection('logotipos').update(recordId, formData, { 
      $autoCancel: false 
    });
    
    const fileUrl = pb.files.getURL(updatedRecord, updatedRecord.archivo);
    
    return { 
      success: true, 
      record: updatedRecord, 
      url: getLogoCacheUrl(fileUrl) 
    };
  } catch (error) {
    console.error(`[logoUploadUtil] Error uploading logo for type ${type}:`, error);
    throw error;
  }
};