/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("drv_registros");
  collection.indexes.push("CREATE UNIQUE INDEX idx_drv_registros_registro_id ON drv_registros (registro_id)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_drv_registros_unique ON drv_registros (drv_id, fecha_captura, hora_captura)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("drv_registros");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_drv_registros_registro_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_drv_registros_unique"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})