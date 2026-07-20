/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Get field values
  const capacidad_total_ct = e.record.get("capacidad_total_ct");
  const litraje_inicial_lti = e.record.get("litraje_inicial_lti");
  const capacidad_disponible_inicial_cdi = e.record.get("capacidad_disponible_inicial_cdi");
  const litraje_final_ltf = e.record.get("litraje_final_ltf");
  const capacidad_disponible_final_cdf = e.record.get("capacidad_disponible_final_cdf");

  // Validation (1): capacidad_total_ct >= 0
  if (capacidad_total_ct !== null && capacidad_total_ct !== undefined && capacidad_total_ct < 0) {
    throw new BadRequestError("La capacidad total debe ser mayor o igual a 0.");
  }

  // Validation (2): litraje_inicial_lti >= 0
  if (litraje_inicial_lti !== null && litraje_inicial_lti !== undefined && litraje_inicial_lti < 0) {
    throw new BadRequestError("El litraje inicial debe ser mayor o igual a 0.");
  }

  // Validation (3): capacidad_disponible_inicial_cdi between 0 and 100
  if (capacidad_disponible_inicial_cdi !== null && capacidad_disponible_inicial_cdi !== undefined) {
    if (capacidad_disponible_inicial_cdi < 0 || capacidad_disponible_inicial_cdi > 100) {
      throw new BadRequestError("La capacidad disponible inicial debe estar entre 0 y 100.");
    }
  }

  // Validation (4): litraje_final_ltf >= 0
  if (litraje_final_ltf !== null && litraje_final_ltf !== undefined && litraje_final_ltf < 0) {
    throw new BadRequestError("El litraje final debe ser mayor o igual a 0.");
  }

  // Validation (5): capacidad_disponible_final_cdf between 0 and 100
  if (capacidad_disponible_final_cdf !== null && capacidad_disponible_final_cdf !== undefined) {
    if (capacidad_disponible_final_cdf < 0 || capacidad_disponible_final_cdf > 100) {
      throw new BadRequestError("La capacidad disponible final debe estar entre 0 y 100.");
    }
  }

  // Validation (6): SECURITY - litraje_final_ltf >= litraje_inicial_lti
  if (litraje_final_ltf !== null && litraje_final_ltf !== undefined && 
      litraje_inicial_lti !== null && litraje_inicial_lti !== undefined) {
    if (litraje_final_ltf < litraje_inicial_lti) {
      throw new BadRequestError("El litraje final no puede ser menor al litraje inicial.");
    }
  }

  // Validation (7): SECURITY - capacidad_disponible_final_cdf <= capacidad_disponible_inicial_cdi
  if (capacidad_disponible_final_cdf !== null && capacidad_disponible_final_cdf !== undefined &&
      capacidad_disponible_inicial_cdi !== null && capacidad_disponible_inicial_cdi !== undefined) {
    if (capacidad_disponible_final_cdf > capacidad_disponible_inicial_cdi) {
      throw new BadRequestError("La capacidad disponible final no puede ser mayor a la capacidad disponible inicial.");
    }
  }

  // Auto-calculate: capacidad_permitida_cp = capacidad_total_ct - (capacidad_total_ct × 0.10)
  if (capacidad_total_ct !== null && capacidad_total_ct !== undefined) {
    const cp = capacidad_total_ct - (capacidad_total_ct * 0.10);
    const cpRounded = Math.max(0, Math.round(cp * 100) / 100);
    e.record.set("capacidad_permitida_cp", cpRounded);
  }

  // Auto-calculate: diferencia_litraje_diflt = litraje_final_ltf - litraje_inicial_lti
  if (litraje_final_ltf !== null && litraje_final_ltf !== undefined &&
      litraje_inicial_lti !== null && litraje_inicial_lti !== undefined) {
    const diflt = litraje_final_ltf - litraje_inicial_lti;
    const difltRounded = Math.max(0, Math.round(diflt * 100) / 100);
    e.record.set("diferencia_litraje_diflt", difltRounded);
  }

  // Auto-calculate: diferencia_capacidad_difcd = capacidad_disponible_inicial_cdi - capacidad_disponible_final_cdf
  if (capacidad_disponible_inicial_cdi !== null && capacidad_disponible_inicial_cdi !== undefined &&
      capacidad_disponible_final_cdf !== null && capacidad_disponible_final_cdf !== undefined) {
    const difcd = capacidad_disponible_inicial_cdi - capacidad_disponible_final_cdf;
    const difcdRounded = Math.max(0, Math.round(difcd * 100) / 100);
    e.record.set("diferencia_capacidad_difcd", difcdRounded);
  }

  e.next();
}, "control_recepcion");

onRecordUpdate((e) => {
  // Get field values
  const capacidad_total_ct = e.record.get("capacidad_total_ct");
  const litraje_inicial_lti = e.record.get("litraje_inicial_lti");
  const capacidad_disponible_inicial_cdi = e.record.get("capacidad_disponible_inicial_cdi");
  const litraje_final_ltf = e.record.get("litraje_final_ltf");
  const capacidad_disponible_final_cdf = e.record.get("capacidad_disponible_final_cdf");

  // Validation (1): capacidad_total_ct >= 0
  if (capacidad_total_ct !== null && capacidad_total_ct !== undefined && capacidad_total_ct < 0) {
    throw new BadRequestError("La capacidad total debe ser mayor o igual a 0.");
  }

  // Validation (2): litraje_inicial_lti >= 0
  if (litraje_inicial_lti !== null && litraje_inicial_lti !== undefined && litraje_inicial_lti < 0) {
    throw new BadRequestError("El litraje inicial debe ser mayor o igual a 0.");
  }

  // Validation (3): capacidad_disponible_inicial_cdi between 0 and 100
  if (capacidad_disponible_inicial_cdi !== null && capacidad_disponible_inicial_cdi !== undefined) {
    if (capacidad_disponible_inicial_cdi < 0 || capacidad_disponible_inicial_cdi > 100) {
      throw new BadRequestError("La capacidad disponible inicial debe estar entre 0 y 100.");
    }
  }

  // Validation (4): litraje_final_ltf >= 0
  if (litraje_final_ltf !== null && litraje_final_ltf !== undefined && litraje_final_ltf < 0) {
    throw new BadRequestError("El litraje final debe ser mayor o igual a 0.");
  }

  // Validation (5): capacidad_disponible_final_cdf between 0 and 100
  if (capacidad_disponible_final_cdf !== null && capacidad_disponible_final_cdf !== undefined) {
    if (capacidad_disponible_final_cdf < 0 || capacidad_disponible_final_cdf > 100) {
      throw new BadRequestError("La capacidad disponible final debe estar entre 0 y 100.");
    }
  }

  // Validation (6): SECURITY - litraje_final_ltf >= litraje_inicial_lti
  if (litraje_final_ltf !== null && litraje_final_ltf !== undefined && 
      litraje_inicial_lti !== null && litraje_inicial_lti !== undefined) {
    if (litraje_final_ltf < litraje_inicial_lti) {
      throw new BadRequestError("El litraje final no puede ser menor al litraje inicial.");
    }
  }

  // Validation (7): SECURITY - capacidad_disponible_final_cdf <= capacidad_disponible_inicial_cdi
  if (capacidad_disponible_final_cdf !== null && capacidad_disponible_final_cdf !== undefined &&
      capacidad_disponible_inicial_cdi !== null && capacidad_disponible_inicial_cdi !== undefined) {
    if (capacidad_disponible_final_cdf > capacidad_disponible_inicial_cdi) {
      throw new BadRequestError("La capacidad disponible final no puede ser mayor a la capacidad disponible inicial.");
    }
  }

  // Auto-calculate: capacidad_permitida_cp = capacidad_total_ct - (capacidad_total_ct × 0.10)
  if (capacidad_total_ct !== null && capacidad_total_ct !== undefined) {
    const cp = capacidad_total_ct - (capacidad_total_ct * 0.10);
    const cpRounded = Math.max(0, Math.round(cp * 100) / 100);
    e.record.set("capacidad_permitida_cp", cpRounded);
  }

  // Auto-calculate: diferencia_litraje_diflt = litraje_final_ltf - litraje_inicial_lti
  if (litraje_final_ltf !== null && litraje_final_ltf !== undefined &&
      litraje_inicial_lti !== null && litraje_inicial_lti !== undefined) {
    const diflt = litraje_final_ltf - litraje_inicial_lti;
    const difltRounded = Math.max(0, Math.round(diflt * 100) / 100);
    e.record.set("diferencia_litraje_diflt", difltRounded);
  }

  // Auto-calculate: diferencia_capacidad_difcd = capacidad_disponible_inicial_cdi - capacidad_disponible_final_cdf
  if (capacidad_disponible_inicial_cdi !== null && capacidad_disponible_inicial_cdi !== undefined &&
      capacidad_disponible_final_cdf !== null && capacidad_disponible_final_cdf !== undefined) {
    const difcd = capacidad_disponible_inicial_cdi - capacidad_disponible_final_cdf;
    const difcdRounded = Math.max(0, Math.round(difcd * 100) / 100);
    e.record.set("diferencia_capacidad_difcd", difcdRounded);
  }

  e.next();
}, "control_recepcion");