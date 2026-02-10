import { Router } from "express";

import { prisma } from "../db/prisma";

const router = Router();
const PARTNER_TYPES = ["individual", "company"] as const;
type PartnerType = (typeof PARTNER_TYPES)[number];

const normalizeString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const isPartnerType = (value: string): value is PartnerType =>
  PARTNER_TYPES.includes(value as PartnerType);

router.get("/", async (req, res, next) => {
  try {
    const approvedQuery = typeof req.query.approved === "string" ? req.query.approved : "";
    const where = approvedQuery === "true" ? { isApproved: true } : undefined;

    const partners = await prisma.partner.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return res.status(200).json(partners);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    const name = normalizeString(body.name);
    const type = normalizeString(body.type);
    const city = normalizeString(body.city) || "Краснодар";
    const description = normalizeString(body.description) || null;

    if (!name) {
      return res.status(400).json({ message: "Field 'name' is required." });
    }
    if (!type) {
      return res.status(400).json({ message: "Field 'type' is required." });
    }
    if (!isPartnerType(type)) {
      return res.status(400).json({ message: "Field 'type' must be either 'individual' or 'company'." });
    }

    let isApproved = false;
    if (typeof body.isApproved !== "undefined") {
      if (typeof body.isApproved !== "boolean") {
        return res.status(400).json({ message: "Field 'isApproved' must be boolean." });
      }
      isApproved = body.isApproved;
    }

    const payload = {
      name,
      type,
      city,
      description,
      isApproved,
    };

    if (typeof body.id !== "undefined") {
      if (typeof body.id !== "number" || !Number.isInteger(body.id) || body.id <= 0) {
        return res.status(400).json({ message: "Field 'id' must be a positive integer." });
      }

      const existing = await prisma.partner.findUnique({ where: { id: body.id } });
      if (!existing) {
        return res.status(404).json({ message: `Partner with id=${body.id} not found.` });
      }

      const updated = await prisma.partner.update({
        where: { id: body.id },
        data: payload,
      });

      return res.status(200).json(updated);
    }

    const created = await prisma.partner.create({ data: payload });
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
});

export default router;
