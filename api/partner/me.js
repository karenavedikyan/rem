import { getPartnerById, handleOptions, parseJsonBody, readCurrentPartnerId, setCors, updatePartnerById } from "./store.js";

function mapErrorMessage(code) {
  const map = {
    EMPTY_UPDATE: "Нет полей для обновления",
    INVALID_PARTNER_NAME: "Некорректное имя партнёра",
    INVALID_PARTNER_TYPE: "Некорректный тип партнёра",
    INVALID_BANNER_URL: "Некорректный URL баннера",
    INVALID_PROMOTION_IDS: "Некорректные ID акций",
    INVALID_JSON: "Неверный JSON"
  };
  return map[code] || "Ошибка обновления профиля";
}

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, GET, PATCH")) return;
  setCors(req, res, "OPTIONS, GET, PATCH");

  const partnerId = readCurrentPartnerId(req);
  if (!partnerId) {
    res.status(400).json({ error: "partnerId is required" });
    return;
  }

  if (req.method === "GET") {
    const partner = await getPartnerById(partnerId);
    if (!partner) {
      res.status(404).json({ error: "Партнёр не найден" });
      return;
    }
    res.status(200).json({ item: partner });
    return;
  }

  if (req.method === "PATCH") {
    try {
      const body = await parseJsonBody(req);
      const updated = await updatePartnerById(partnerId, body);
      if (!updated) {
        res.status(404).json({ error: "Партнёр не найден" });
        return;
      }
      res.status(200).json({ item: updated });
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
