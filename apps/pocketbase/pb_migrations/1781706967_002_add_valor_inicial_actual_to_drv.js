/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("drv");

  const existing = collection.fields.getByName("valor_inicial_actual");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("valor_inicial_actual"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "valor_inicial_actual",
    required: true,
    min: 0
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("drv");
    collection.fields.removeByName("valor_inicial_actual");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})