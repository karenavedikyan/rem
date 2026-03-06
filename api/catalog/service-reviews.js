import {
  addServiceReview,
  handleOptions,
  listServiceReviews,
  normalizePagination,
  parseJsonBody,
  setCatalogCors
} from "./store.js";

function mapReviewError(code) {
  const map = {
    INVALID_JSON: "Неверный JSON",
    INVALID_SERVICE_ID: "serviceId is required",
    INVALID_RATING: "Рейтинг должен быть от 1 до 5",
    COMMENT_TOO_LONG: "Комментарий слишком длинный (максимум 1000 символов)"
  };
  return map[code] || "Ошибка обработки отзыва";
}

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, GET, POST")) return;
  setCatalogCors(req, res, "OPTIONS, GET, POST");

  const rawServiceId = req.query && req.query.serviceId;
  const serviceId = Array.isArray(rawServiceId) ? String(rawServiceId[0] || "") : String(rawServiceId || "");
  if (!serviceId) {
    res.status(400).json({ error: "serviceId is required" });
    return;
  }

  if (req.method === "GET") {
    try {
      const pagination = normalizePagination(req.query || {}, { size: 5 });
      const payload = await listServiceReviews(serviceId, pagination);
      res.status(200).json(payload);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Catalog service reviews GET error:", err);
      res.status(500).json({
        error: "Ошибка отзывов",
        message: err instanceof Error ? err.message : "Неизвестная ошибка"
      });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const result = await addServiceReview(serviceId, body);
      if (result.status === "not_found") {
        res.status(404).json({ error: "Услуга не найдена" });
        return;
      }
      res.status(201).json(result);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      const status = code === "INVALID_JSON" ? 400 : 422;
      res.status(status).json({
        error: mapReviewError(code),
        code: code || "UNKNOWN"
      });
    }
    return;
  }

  res.status(405).json({ error: "Метод не разрешён" });
}
