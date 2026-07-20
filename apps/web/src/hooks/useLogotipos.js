import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';

export const useLogotipos = () => {
  const [logotipos, setLogotipos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogotipos = useCallback(async () => {
    console.log('[useLogotipos] Fetching logotipos...');
    setIsLoading(true);
    setError(null);
    
    // Implemented AbortController with 10s timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[useLogotipos] Request timed out after 10000ms, aborting...');
      controller.abort();
    }, 10000);

    try {
      const records = await pb.collection('logotipos').getFullList({
        $autoCancel: false,
        signal: controller.signal
      });
      
      console.log('[useLogotipos] Fetched records successfully:', records.length);
      setLogotipos(records);
      return { success: true, data: records };
    } catch (err) {
      if (err.name === 'AbortError' || err.isAbort) {
        console.log('[useLogotipos] Fetch aborted gracefully.');
        return { success: false, error: err };
      }
      console.error('[useLogotipos] Error fetching logotipos:', err);
      setError(err.message || 'Error al cargar los logotipos');
      return { success: false, error: err };
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  const verifyLogoUpload = async (recordId, fileName) => {
    console.log(`[useLogotipos] Verifying logo upload for record ${recordId}, expected file: ${fileName}`);
    try {
      const record = await pb.collection('logotipos').getOne(recordId, { $autoCancel: false });
      if (record.archivo === fileName) {
        console.log(`[useLogotipos] Verification successful. File ${fileName} is present on record.`);
        return true;
      }
      console.warn(`[useLogotipos] Verification failed. Expected ${fileName}, got ${record.archivo}`);
      return false;
    } catch (err) {
      console.error(`[useLogotipos] Verification error:`, err);
      return false;
    }
  };

  const uploadLogo = async (tipo, file) => {
    console.log(`[useLogotipos] Starting upload for tipo: ${tipo}`);
    
    try {
      if (!file) throw new Error('No se proporcionó ningún archivo para subir.');
      
      const existingRecords = await pb.collection('logotipos').getFullList({
        filter: `tipo="${tipo}"`,
        $autoCancel: false
      });
      
      let recordId;
      
      if (existingRecords.length === 0) {
        const newRecord = await pb.collection('logotipos').create({
          tipo: tipo,
          nombre: `Logo ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
        }, { $autoCancel: false });
        recordId = newRecord.id;
      } else {
        recordId = existingRecords[0].id;
      }

      const formData = new FormData();
      formData.append('archivo', file);
      
      const updatedRecord = await pb.collection('logotipos').update(recordId, formData, {
        $autoCancel: false
      });

      const fileUrl = pb.files.getURL(updatedRecord, updatedRecord.archivo);
      const cacheBustedUrl = `${fileUrl}?t=${Date.now()}`;

      await verifyLogoUpload(updatedRecord.id, updatedRecord.archivo);

      return { 
        success: true, 
        record: updatedRecord, 
        url: cacheBustedUrl 
      };
    } catch (err) {
      console.error(`[useLogotipos] Error in uploadLogo for ${tipo}:`, err);
      return { success: false, error: err };
    }
  };

  return {
    logotipos,
    isLoading,
    error,
    uploadLogo,
    fetchLogotipos,
    verifyLogoUpload
  };
};