import { getCatalogServiceById, handleOptions, setCatalogCors } from "./store.js";

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, GET")) return;
  setCatalogCors(req, res, "OPTIONS, GET");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  const rawServiceId = req.query && req.query.serviceId;
  const serviceId = Array.isArray(rawServiceId) ? String(rawServiceId[0] || "") : String(rawServiceId || "");
  if (!serviceId) {
    res.status(400).json({ error: "serviceId is required" });
    return;
  }

  try {
    const item = await getCatalogServiceById(serviceId);
    if (!item) {
      res.status(404).json({ error: "Услуга не найдена" });
      return;
    }
    res.status(200).json({ item });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Catalog service-by-id error:", err);
    res.status(500).json({
      error: "Ошибка каталога",
      message: err instanceof Error ? err.message : "Неизвестная ошибка"
    });
  }
}
