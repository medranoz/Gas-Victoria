export const calcularCapacidadPermitida = (ct) => {
  return (Number(ct) || 0) * 0.9;
};

export const calcularCargaDisponibleLitros = (cp, cdPorcentaje) => {
  return (Number(cp) || 0) * ((Number(cdPorcentaje) || 0) / 100);
};

export const calcularCargaFaltante = (cp, cdl) => {
  return Math.max(0, (Number(cp) || 0) - (Number(cdl) || 0));
};

export const validarAutorizacionCarga = (tipo, valor, ciPorcentaje, cp) => {
  const val = Number(valor) || 0;
  if (tipo === 'Porcentaje') {
    return (ciPorcentaje + val) <= 100;
  }
  if (tipo === 'Litros') {
    const litrosDisponibles = (ciPorcentaje / 100) * cp;
    return (litrosDisponibles + val) <= cp;
  }
  return false;
};

export const validarTemperatura = (temp) => {
  const t = Number(temp);
  return t >= -10 && t <= 60;
};