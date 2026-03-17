import bcrypt from "bcryptjs";
import {
  asString,
  createToken,
  getPrisma,
  handleOptions,
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

    prisma = await getPrisma();
    if (!prisma) {
      res.status(500).json({ error: "Prisma недоступен" });
      return;
    }

    const account = await prisma.partnerAccount.findUnique({
      where: { email },
      include: { partner: true }
    });

    if (!account) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }

    const isValid = await bcrypt.compare(password, account.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }

    const token = createToken({ partnerId: account.partnerId, email: account.email });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      partner: {
        id: account.partner.id,
        name: account.partner.name,
        type: account.partner.type,
        city: account.partner.city
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Ошибка авторизации"
    });
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => {});
    }
  }
}
