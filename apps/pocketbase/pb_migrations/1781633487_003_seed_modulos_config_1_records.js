/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("modulos_config");

  const record0 = new Record(collection);
    record0.set("nombre", "atqs");
    record0.set("ubicacion", "Secci\u00f3n Dashboard");
    record0.set("estado", true);
    record0.set("orden", 11);
    record0.set("icono", "truck");
    record0.set("roles_permitidos", ["Superadmin", "Administrador"]);
    record0.set("colecciones", ["atqs"]);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})