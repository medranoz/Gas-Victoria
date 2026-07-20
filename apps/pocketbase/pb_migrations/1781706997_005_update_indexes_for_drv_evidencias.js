/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("drv_evidencias");
  collection.indexes.push("CREATE UNIQUE INDEX idx_drv_evidencias_evidencia_id ON drv_evidencias (evidencia_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("drv_evidencias");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_drv_evidencias_evidencia_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})