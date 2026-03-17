import { clearAuthCookie, handleOptions, setCors } from "./utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, POST")) return;
  setCors(req, res, "OPTIONS, POST");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  clearAuthCookie(res);
  res.status(200).json({ success: true });
}
