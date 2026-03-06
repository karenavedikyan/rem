import { handleOptions, parseJsonBody, patchPartnerService, readCurrentPartnerId, setCors, validateServicePatchPayload } from "../store.js";

function mapErrorMessage(code) {
  const map = {
    INVALID_JSON: "Неверный JSON",
    EMPTY_UPDATE: "Нет полей для обновления",
    INVALID_ACTIVE: "Некорректный статус активности",
    INVALID_TITLE: "Укажите корректное название услуги",
    INVALID_STAGE: "Укажите корректный этап услуги",
    INVALID_TASK_TYPE: "Укажите корректный тип задачи",
    INVALID_MIN_PRICE: "Некорректная минимальная цена",
    INVALID_MAX_PRICE: "Некорректная максимальная цена",
    PRICE_RANGE: "Минимальная цена не может быть выше максимальной"
  };
  return map[code] || "Ошибка обновления услуги";
}

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, PATCH")) return;
  setCors(req, res, "OPTIONS, PATCH");

  const partnerId = readCurrentPartnerId(req);
  const rawId = req.query && req.query.id;
  const serviceId = Array.isArray(rawId) ? String(rawId[0] || "") : String(rawId || "");

  if (!partnerId) {
    res.status(400).json({ error: "partnerId is required" });
    return;
  }
  if (!serviceId) {
    res.status(400).json({ error: "service id is required" });
    return;
  }

  if (req.method === "PATCH") {
    try {
      const body = await parseJsonBody(req);
      const patch = validateServicePatchPayload(body);
      const updated = await patchPartnerService(partnerId, serviceId, patch);

      if (updated.status === "not_found") {
        res.status(404).json({ error: "Услуга не найдена" });
        return;
      }
      if (updated.status === "forbidden") {
        res.status(403).json({ error: "Нельзя изменять чужую услугу" });
        return;
      }
      res.status(200).json({ item: updated.item });
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
