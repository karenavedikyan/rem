import {
  createPartnerService,
  getPartnerById,
  handleOptions,
  listPromotionBannerOverrides,
  listPartnerServices,
  parseJsonBody,
  readCurrentPartnerId,
  setCors,
  validateNewServicePayload
} from "../../lib/partner-store.js";

function mapErrorMessage(code) {
  const map = {
    INVALID_JSON: "Неверный JSON",
    INVALID_TITLE: "Укажите название услуги",
    INVALID_STAGE: "Укажите корректный этап услуги",
    INVALID_TASK_TYPE: "Укажите корректный тип задачи",
    INVALID_MIN_PRICE: "Некорректная минимальная цена",
    INVALID_MAX_PRICE: "Некорректная максимальная цена",
    PRICE_RANGE: "Минимальная цена не может быть выше максимальной"
  };
  return map[code] || "Ошибка сохранения услуги";
}

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, GET, POST")) return;
  setCors(req, res, "OPTIONS, GET, POST");

  const scopeRaw = req.query && req.query.scope;
  const scope = String(Array.isArray(scopeRaw) ? scopeRaw[0] : scopeRaw || "").trim();
  if (req.method === "GET" && scope === "banner_overrides") {
    const items = await listPromotionBannerOverrides();
    res.status(200).json({ items, total: items.length });
    return;
  }

  const partnerId = readCurrentPartnerId(req);
  if (!partnerId) {
    res.status(400).json({ error: "partnerId is required" });
    return;
  }

  const partner = await getPartnerById(partnerId);
  if (!partner) {
    res.status(404).json({ error: "Партнёр не найден" });
    return;
  }

  if (req.method === "GET") {
    const items = await listPartnerServices(partnerId);
    res.status(200).json({ items, total: items.length });
    return;
  }

  if (req.method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const payload = validateNewServicePayload(body);
      const created = await createPartnerService(partnerId, payload);
      if (!created) {
        res.status(404).json({ error: "Партнёр не найден" });
        return;
      }
      res.status(201).json({ item: created });
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      const status = code === "INVALID_JSON" ? 400 : 422;
      res.status(status).json({
        error: mapErrorMessage(code),
        code: code || "UNKNOWN"
      });
    }
    return;
  }

  res.status(405).json({ error: "Метод не разрешён" });
}
