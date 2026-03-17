import { handleOptions, listCatalogServices, normalizeCatalogFilter, normalizePagination, setCatalogCors } from "../../lib/catalog-store.js";

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, GET")) return;
  setCatalogCors(req, res, "OPTIONS, GET");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  const filter = normalizeCatalogFilter(req.query || {});
  const pagination = normalizePagination(req.query || {}, { size: 12 });

  try {
    const payload = await listCatalogServices(filter, pagination);
    res.status(200).json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Catalog services API error:", err);
    res.status(500).json({
      error: "Ошибка каталога",
      message: err instanceof Error ? err.message : "Неизвестная ошибка"
    });
  }
}
