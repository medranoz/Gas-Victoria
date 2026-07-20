/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  const cargaInicial = e.record.get("carga_inicial");
  const capacidad = e.record.get("capacidad");
  
  // Validation 1: carga_inicial must be greater than 0
  if (!cargaInicial || cargaInicial <= 0) {
    throw new BadRequestError("La carga inicial debe ser mayor que 0");
  }
  
  // Validation 2: carga_inicial must not exceed capacidad
  if (cargaInicial > capacidad) {
    throw new BadRequestError("La carga inicial no puede ser mayor que la capacidad");
  }
  
  e.next();
}, "tanques");

onRecordUpdate((e) => {
  const cargaInicial = e.record.get("carga_inicial");
  const capacidad = e.record.get("capacidad");
  
  // Validation 1: carga_inicial must be greater than 0
  if (cargaInicial !== null && cargaInicial !== undefined && cargaInicial <= 0) {
    throw new BadRequestError("La carga inicial debe ser mayor que 0");
  }
  
  // Validation 2: carga_inicial must not exceed capacidad
  if (cargaInicial !== null && cargaInicial !== undefined && capacidad !== null && capacidad !== undefined && cargaInicial > capacidad) {
    throw new BadRequestError("La carga inicial no puede ser mayor que la capacidad");
  }
  
  e.next();
}, "tanques");