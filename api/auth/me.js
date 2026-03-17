import { getTokenFromRequest, handleOptions, setCors, verifyToken } from "./utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, GET")) return;
  setCors(req, res, "OPTIONS, GET");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    res.status(200).json({ authenticated: false });
    return;
  }

  res.status(200).json({
    authenticated: true,
    partnerId: payload.partnerId,
    email: payload.email
  });
}
