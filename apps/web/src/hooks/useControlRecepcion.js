import { useState, useCallback, useRef, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useControlRecepcion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Hook unmounted');
      }
    };
  }, []);

  const fetchRegistros = useCallback(async (filter = '') => {
    setLoading(true);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New request started');
    }
    abortControllerRef.current = new AbortController();
    
    try {
      console.log('[useControlRecepcion] Fetching registros with filter:', filter);
      const records = await pb.collection('control_recepcion').getFullList({
        sort: '-fecha_hora',
        filter: filter,
        expand: 'estacion_id,proveedor_id,usuario_id',
        $autoCancel: false,
        signal: abortControllerRef.current.signal
      });
      return { success: true, data: records };
    } catch (err) {
      if (err.name === 'AbortError' || err === 'Hook unmounted' || err === 'New request started') {
        console.log('[useControlRecepcion] Fetch aborted:', err);
        return { success: false, error: err, aborted: true };
      }
      console.error('[useControlRecepcion] Fetch registros error:', err);
      setError(err);
      toast.error('Error al cargar registros de control de recepción');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const getRegistroById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('control_recepcion').getOne(id, {
        expand: 'estacion_id,proveedor_id,usuario_id',
        $autoCancel: false
      });
      return { success: true, data: record };
    } catch (err) {
      console.error('[useControlRecepcion] Get registro error:', err);
      setError(err);
      toast.error('Error al obtener registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNextFolio = useCallback(async () => {
    try {
      const all = await pb.collection('control_recepcion').getFullList({ sort: '-created', $autoCancel: false });
      if (all.length === 0) return 'REC-00001';
      
      const numbers = all.map(r => {
        const match = r.folio?.match(/REC-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }).filter(n => !isNaN(n));
      
      const max = Math.max(...numbers, 0);
      return `REC-${String(max + 1).padStart(5, '0')}`;
    } catch (err) {
      console.error('[useControlRecepcion] Generate folio error:', err);
      return 'REC-00001';
    }
  }, []);

  const validateLIEstablishment = (data, files, initialData) => {
    if (data.li_tara === '' || data.li_presion === '') {
      return { success: false, message: 'Faltan valores de Lectura Inicial (TARA y/o PRESIÓN).' };
    }
    if (Number(data.li_tara) < 0 || Number(data.li_presion) < 0) {
      return { success: false, message: 'Los valores de Lectura Inicial no pueden ser negativos.' };
    }
    if (!initialData?.evidencia_li_tara && !files?.evidencia_li_tara) {
      return { success: false, message: 'Falta evidencia para Lectura Inicial TARA.' };
    }
    if (!initialData?.evidencia_li_presion && !files?.evidencia_li_presion) {
      return { success: false, message: 'Falta evidencia para Lectura Inicial PRESIÓN.' };
    }
    return { success: true };
  };

  const validateLFValues = (data) => {
    if (data.lf_tara && Number(data.lf_tara) < 0) {
      return { success: false, message: 'La Lectura Final TARA no puede ser negativa.' };
    }
    if (data.lf_presion && Number(data.lf_presion) < 0) {
      return { success: false, message: 'La Lectura Final PRESIÓN no puede ser negativa.' };
    }
    if (data.li_tara && data.lf_tara && Number(data.lf_tara) > Number(data.li_tara)) {
      return { success: false, message: 'La Lectura Final TARA no puede ser mayor que la Inicial.' };
    }
    if (data.li_presion && data.lf_presion && Number(data.lf_presion) > Number(data.li_presion)) {
      return { success: false, message: 'La Lectura Final PRESIÓN no puede ser mayor que la Inicial.' };
    }
    return { success: true };
  };

  const calculateDifferences = (li, lf) => {
    if (li === '' || lf === '' || isNaN(li) || isNaN(lf)) return null;
    return (Number(li) - Number(lf)).toFixed(2);
  };

  const validateCapacityFields = (data) => {
    if (data.capacidad_total_ct === '' || data.litraje_inicial_lti === '' || data.capacidad_disponible_inicial_cdi === '') {
      return { success: false, message: 'Faltan valores de Capacidad y MAGNETEL Inicial.' };
    }
    if (Number(data.capacidad_total_ct) < 0 || Number(data.litraje_inicial_lti) < 0 || Number(data.capacidad_disponible_inicial_cdi) < 0) {
      return { success: false, message: 'Los valores de Capacidad y MAGNETEL Inicial no pueden ser negativos.' };
    }
    if (Number(data.capacidad_disponible_inicial_cdi) > 100) {
      return { success: false, message: 'La Capacidad Disponible Inicial no puede ser mayor a 100%.' };
    }
    return { success: true };
  };

  const validateFinalCapacityFields = (data) => {
    if (data.litraje_final_ltf && Number(data.litraje_final_ltf) < 0) {
      return { success: false, message: 'El MAGNETEL Final no puede ser negativo.' };
    }
    if (data.capacidad_disponible_final_cdf && Number(data.capacidad_disponible_final_cdf) < 0) {
      return { success: false, message: 'La Capacidad Disponible Final no puede ser negativa.' };
    }
    if (data.capacidad_disponible_final_cdf && Number(data.capacidad_disponible_final_cdf) > 100) {
      return { success: false, message: 'La Capacidad Disponible Final no puede ser mayor a 100%.' };
    }
    return { success: true };
  };

  const validateLitrajeSecurityRule = (ltf, lti) => {
    if (ltf !== '' && lti !== '' && Number(ltf) < Number(lti)) {
      return { success: false, message: 'El MAGNETEL final no puede ser menor al MAGNETEL inicial.' };
    }
    return { success: true };
  };

  const validateCapacidadSecurityRule = (cdf, cdi) => {
    if (cdf !== '' && cdi !== '' && Number(cdf) > Number(cdi)) {
      return { success: false, message: 'La capacidad disponible final no puede ser mayor a la capacidad disponible inicial.' };
    }
    return { success: true };
  };

  const calculateCapacidadPermitida = (ct) => {
    if (ct === '' || isNaN(ct)) return null;
    const val = Number(ct);
    return Math.max(0, val - (val * 0.10)).toFixed(2);
  };

  const calculateDiferenciaLitraje = (ltf, lti) => {
    if (ltf === '' || lti === '' || isNaN(ltf) || isNaN(lti)) return null;
    return Math.max(0, Number(ltf) - Number(lti)).toFixed(2);
  };

  const calculateDiferenciaCapacidad = (cdi, cdf) => {
    if (cdi === '' || cdf === '' || isNaN(cdi) || isNaN(cdf)) return null;
    return Math.max(0, Number(cdi) - Number(cdf)).toFixed(2);
  };

  const createRegistro = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const obj = Object.fromEntries(formData.entries());
      
      const difTara = calculateDifferences(obj.li_tara, obj.lf_tara);
      const difPresion = calculateDifferences(obj.li_presion, obj.lf_presion);
      const cp = calculateCapacidadPermitida(obj.capacidad_total_ct);
      const difLitraje = calculateDiferenciaLitraje(obj.litraje_final_ltf, obj.litraje_inicial_lti);
      const difCapacidad = calculateDiferenciaCapacidad(obj.capacidad_disponible_inicial_cdi, obj.capacidad_disponible_final_cdf);
      
      if (difTara !== null) formData.set('dif_tara', difTara);
      if (difPresion !== null) formData.set('dif_presion', difPresion);
      if (cp !== null) formData.set('capacidad_permitida_cp', cp);
      if (difLitraje !== null) formData.set('diferencia_litraje_diflt', difLitraje);
      if (difCapacidad !== null) formData.set('diferencia_capacidad_difcd', difCapacidad);
      
      formData.set('usuario_id', pb.authStore.model.id);

      const record = await pb.collection('control_recepcion').create(formData, { $autoCancel: false });
      toast.success('Registro guardado exitosamente');
      return { success: true, data: record };
    } catch (err) {
      console.error('[useControlRecepcion] Create registro error:', err);
      setError(err);
      toast.error(err.message || 'Error al crear registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRegistro = useCallback(async (id, formData, isConfirming = false) => {
    setLoading(true);
    setError(null);
    try {
      const existing = await pb.collection('control_recepcion').getOne(id, { $autoCancel: false });
      if (existing.estado_registro === 'Confirmado') {
        throw new Error('No se puede editar un registro confirmado.');
      }

      const obj = Object.fromEntries(formData.entries());
      const mergedLiTara = obj.li_tara !== undefined ? obj.li_tara : existing.li_tara;
      const mergedLfTara = obj.lf_tara !== undefined ? obj.lf_tara : existing.lf_tara;
      const mergedLiPresion = obj.li_presion !== undefined ? obj.li_presion : existing.li_presion;
      const mergedLfPresion = obj.lf_presion !== undefined ? obj.lf_presion : existing.lf_presion;
      
      const mergedCT = obj.capacidad_total_ct !== undefined ? obj.capacidad_total_ct : existing.capacidad_total_ct;
      const mergedLTi = obj.litraje_inicial_lti !== undefined ? obj.litraje_inicial_lti : existing.litraje_inicial_lti;
      const mergedLTf = obj.litraje_final_ltf !== undefined ? obj.litraje_final_ltf : existing.litraje_final_ltf;
      const mergedCDi = obj.capacidad_disponible_inicial_cdi !== undefined ? obj.capacidad_disponible_inicial_cdi : existing.capacidad_disponible_inicial_cdi;
      const mergedCDf = obj.capacidad_disponible_final_cdf !== undefined ? obj.capacidad_disponible_final_cdf : existing.capacidad_disponible_final_cdf;

      const difTara = calculateDifferences(mergedLiTara, mergedLfTara);
      const difPresion = calculateDifferences(mergedLiPresion, mergedLfPresion);
      const cp = calculateCapacidadPermitida(mergedCT);
      const difLitraje = calculateDiferenciaLitraje(mergedLTf, mergedLTi);
      const difCapacidad = calculateDiferenciaCapacidad(mergedCDi, mergedCDf);

      if (difTara !== null) formData.set('dif_tara', difTara);
      if (difPresion !== null) formData.set('dif_presion', difPresion);
      if (cp !== null) formData.set('capacidad_permitida_cp', cp);
      if (difLitraje !== null) formData.set('diferencia_litraje_diflt', difLitraje);
      if (difCapacidad !== null) formData.set('diferencia_capacidad_difcd', difCapacidad);

      if (isConfirming) {
        if (!existing.evidencia_li_tara && !formData.get('evidencia_li_tara')) throw new Error('Falta Evidencia LI Tara');
        if (!existing.evidencia_lf_tara && !formData.get('evidencia_lf_tara')) throw new Error('Falta Evidencia LF Tara');
        if (!existing.evidencia_li_presion && !formData.get('evidencia_li_presion')) throw new Error('Falta Evidencia LI Presión');
        if (!existing.evidencia_lf_presion && !formData.get('evidencia_lf_presion')) throw new Error('Falta Evidencia LF Presión');
        formData.set('estado_registro', 'Confirmado');
      }

      const record = await pb.collection('control_recepcion').update(id, formData, { $autoCancel: false });
      toast.success(isConfirming ? 'Registro confirmado exitosamente' : 'Registro actualizado');
      return { success: true, data: record };
    } catch (err) {
      console.error('[useControlRecepcion] Update registro error:', err);
      setError(err);
      toast.error(err.message || 'Error al actualizar registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRegistro = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const existing = await pb.collection('control_recepcion').getOne(id, { $autoCancel: false });
      if (existing.estado_registro === 'Confirmado') {
        throw new Error('No se puede eliminar un registro confirmado.');
      }
      await pb.collection('control_recepcion').delete(id, { $autoCancel: false });
      toast.success('Registro eliminado exitosamente');
      return { success: true };
    } catch (err) {
      console.error('[useControlRecepcion] Delete registro error:', err);
      setError(err);
      toast.error(err.message || 'Error al eliminar registro');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, 
    error,
    fetchRegistros, 
    getRegistroById, 
    generateNextFolio, 
    createRegistro, 
    updateRegistro, 
    deleteRegistro,
    validateLIEstablishment,
    validateLFValues,
    calculateDifferences,
    validateCapacityFields,
    validateFinalCapacityFields,
    validateLitrajeSecurityRule,
    validateCapacidadSecurityRule,
    calculateCapacidadPermitida,
    calculateDiferenciaLitraje,
    calculateDiferenciaCapacidad
  };
};