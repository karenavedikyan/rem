import bcrypt from "bcryptjs";
import {
  asString,
  createToken,
  getPrisma,
  handleOptions,
  normalizePartnerType,
  parseJsonBody,
  setAuthCookie,
  setCors
} from "./utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res, "OPTIONS, POST")) return;
  setCors(req, res, "OPTIONS, POST");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  let prisma = null;

  try {
    const body = await parseJsonBody(req);
    const email = asString(body.email).toLowerCase();
    const password = asString(body.password);
    const name = asString(body.name);
    const type = normalizePartnerType(body.type);
    const city = asString(body.city) || "Краснодар";

    if (!email || !password || password.length < 6 || !name) {
      res.status(400).json({ error: "Проверьте обязательные поля" });
      return;
    }

    if (!type) {
      res.status(400).json({ error: "Некорректный тип партнёра" });
      return;
    }

    prisma = await getPrisma();
    if (!prisma) {
      res.status(500).json({ error: "Prisma недоступен" });
      return;
    }

    const existing = await prisma.partnerAccount.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email уже занят" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          name,
          type,
          city
        }
      });

      await tx.partnerAccount.create({
        data: {
          email,
          passwordHash,
          partnerId: partner.id
        }
      });

      return partner;
    });

    const token = createToken({ partnerId: created.id, email });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      partner: {
        id: created.id,
        name: created.name,
        type: created.type,
        city: created.city
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Ошибка регистрации"
    });
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => {});
    }
  }
}
