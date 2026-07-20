/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("drv");

  const existing = collection.fields.getByName("fecha_actualizacion");
  if (existing) {
    if (existing.type === "autodate") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("fecha_actualizacion"); // exists with wrong type, remove first
  }

  collection.fields.add(new AutodateField({
    name: "fecha_actualizacion",
    onCreate: true,
    onUpdate: true
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("drv");
    collection.fields.removeByName("fecha_actualizacion");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})