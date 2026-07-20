/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  // When a new zona is created, automatically create a costos_zonas record
  const zona = e.record;
  
  try {
    const costosZona = new Record();
    costosZona.set("zona_ruta", zona.id);
    costosZona.set("costo_por_litro", 0);
    costosZona.set("fecha_actualizacion", new Date().toISOString().split('T')[0]);
    
    $app.save(costosZona);
  } catch (err) {
    console.log("Error creating costos_zonas record: " + err.message);
  }
  
  e.next();
}, "zonas");