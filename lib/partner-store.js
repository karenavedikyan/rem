const ALLOWED_ORIGINS = [
  "https://karenavedikyan.github.io",
  "https://rem-navy.vercel.app",
  "https://rem.vercel.app",
  "https://remcard.ru",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
];

const SERVICE_STAGES = new Set(["PLANNING", "ROUGH", "ENGINEERING", "FINISHING", "FURNITURE"]);
const SERVICE_TASK_TYPES = new Set([
  "SANUZEL",
  "KITCHEN",
  "ELECTRICAL",
  "PLUMBING",
  "TILING",
  "PAINTING",
  "FLOORING",
  "WINDOWS",
  "DESIGN",
  "GENERAL"
]);
const PARTNER_TYPES = new Set(["MASTER", "COMPANY", "STORE"]);

const DEFAULT_PARTNER_ID = "00000000-0000-0000-0000-000000000101";
const FALLBACK_CITY = "Краснодар";

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const asString = (value) => (value == null ? "" : String(value).trim());
const asMaybeNumber = (value) => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const asMaybeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value == null || value === "") return null;
  const s = String(value).trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return null;
};

const normalizeOptionalBannerUrl = (value) => {
  const raw = asString(value);
  if (!raw) return null;
  if (raw.length > 2048) throw new Error("INVALID_BANNER_URL");
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("INVALID_BANNER_URL");
    }
    return parsed.toString();
  } catch {
    throw new Error("INVALID_BANNER_URL");
  }
};

const normalizePromotionIds = (value) => {
  const ids = parseList(value).map((item) => asString(item));
  if (!ids.length) return [];
  if (ids.length > 100) throw new Error("INVALID_PROMOTION_IDS");
  const invalid = ids.some((id) => !/^[A-Za-z0-9_-]{1,64}$/.test(id));
  if (invalid) throw new Error("INVALID_PROMOTION_IDS");
  return ids;
};

const uniqStrings = (arr) => Array.from(new Set((arr || []).filter(Boolean).map((v) => String(v).trim()).filter(Boolean)));

const parseList = (value) => {
  if (Array.isArray(value)) return uniqStrings(value);
  if (typeof value === "string") {
    return uniqStrings(
      value
        .split(/[,;\n]/)
        .map((part) => part.trim())
        .filter(Boolean)
    );
  }
  return [];
};

const normalizePartnerType = (value) => {
  const v = asString(value).toUpperCase();
  return PARTNER_TYPES.has(v) ? v : null;
};

const normalizeStage = (value) => {
  const v = asString(value).toUpperCase();
  return SERVICE_STAGES.has(v) ? v : null;
};

const normalizeTaskType = (value) => {
  const v = asString(value).toUpperCase();
  return SERVICE_TASK_TYPES.has(v) ? v : null;
};

const getOrigin = (req) => {
  const origin = req.headers.origin;
  if (origin) return origin;
  const referer = req.headers.referer || "";
  try {
    const url = new URL(referer);
    return url.origin;
  } catch {
    return "";
  }
};

export function setCors(req, res, methods = "OPTIONS, GET, POST, PATCH") {
  const origin = getOrigin(req);
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  res.setHeader("Access-Control-Allow-Origin", allowed || "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Partner-Id");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Content-Type", "application/json");
}

export function handleOptions(req, res, methods) {
  if (req.method !== "OPTIONS") return false;
  setCors(req, res, methods);
  res.status(204).end();
  return true;
}

export async function readCurrentPartnerId(req) {
  // 1. Попробовать JWT из cookie
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)remcard_token=([^;]+)/);
  if (match) {
    try {
      const jwt = await import("jsonwebtoken");
      const secret = process.env.JWT_SECRET || "remcard-dev-secret-change-me";
      const payload = jwt.default ? jwt.default.verify(match[1], secret) : jwt.verify(match[1], secret);
      if (payload && payload.partnerId) return payload.partnerId;
    } catch {}
  }
  // 2. Fallback на query/header (для обратной совместимости API)
  const queryIdRaw = req.query && req.query.partnerId;
  const queryId = Array.isArray(queryIdRaw) ? queryIdRaw[0] : queryIdRaw;
  const headerId = req.headers["x-partner-id"];
  const value = asString(queryId || headerId || "");
  return value || null;
}

let prismaCtorPromise = null;
async function getPrismaClientCtor() {
  if (!prismaCtorPromise) {
    prismaCtorPromise = (async () => {
      const specs = ["@prisma/client", new URL("../backend/node_modules/@prisma/client/index.js", import.meta.url).href];
      for (const spec of specs) {
        try {
          const mod = await import(spec);
          if (mod && mod.PrismaClient) return mod.PrismaClient;
          if (mod && mod.default && mod.default.PrismaClient) return mod.default.PrismaClient;
        } catch {
          // try next source
        }
      }
      return null;
    })();
  }
  return prismaCtorPromise;
}

function createFallbackState() {
  return {
    partners: [
      {
        id: DEFAULT_PARTNER_ID,
        type: "COMPANY",
        name: "Demo Partner RemCard",
        description: "Партнёр по ремонту квартир и комплектации в Краснодаре.",
        promotionBannerUrl: null,
        promotionIds: ["1", "4"],
        city: FALLBACK_CITY,
        areas: ["ФМР", "ЮМР", "ЦМР"],
        specializations: ["Санузлы", "Электрика", "Кухни"],
        isApproved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    services: [
      {
        id: "demo-service-001",
        partnerId: DEFAULT_PARTNER_ID,
        title: "Черновой ремонт санузла",
        description: "Демонтаж, подготовка, гидроизоляция и базовая разводка.",
        stage: "ROUGH",
        taskType: "SANUZEL",
        minPrice: 90000,
        maxPrice: 200000,
        currency: "RUB",
        city: FALLBACK_CITY,
        areas: ["ФМР", "ЮМР"],
        isActive: true,
        rating: 4.8,
        ratingCount: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "demo-service-002",
        partnerId: DEFAULT_PARTNER_ID,
        title: "Электрика квартиры 2-ком",
        description: "Проект групп, прокладка линий, щит, финальные проверки.",
        stage: "ENGINEERING",
        taskType: "ELECTRICAL",
        minPrice: 70000,
        maxPrice: 160000,
        currency: "RUB",
        city: FALLBACK_CITY,
        areas: ["ЦМР", "Гидрострой"],
        isActive: false,
        rating: null,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
}

function getFallbackState() {
  if (!globalThis.__remcardPartnerCabinetStore) {
    globalThis.__remcardPartnerCabinetStore = createFallbackState();
  }
  return globalThis.__remcardPartnerCabinetStore;
}

async function runWithPrisma(work) {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) return null;
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = dbUrl;
  const PrismaClient = await getPrismaClientCtor();
  if (!PrismaClient) return null;

  const prisma = new PrismaClient();
  try {
    return await work(prisma);
  } catch (err) {
    console.warn("Partner cabinet Prisma fallback:", err);
    return null;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

async function ensureDemoPartner(prisma, partnerId) {
  const existing = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (existing) return existing;
  if (partnerId !== DEFAULT_PARTNER_ID) return null;

  return prisma.partner.create({
    data: {
      id: DEFAULT_PARTNER_ID,
      type: "COMPANY",
      name: "Demo Partner RemCard",
      description: "Партнёр по ремонту квартир и комплектации в Краснодаре.",
      promotionBannerUrl: null,
      promotionIds: ["1", "4"],
      city: FALLBACK_CITY,
      areas: ["ФМР", "ЮМР", "ЦМР"],
      specializations: ["Санузлы", "Электрика", "Кухни"],
      isApproved: true
    }
  });
}

const mapPartner = (partner) => ({
  id: partner.id,
  type: partner.type,
  name: partner.name,
  description: partner.description || "",
  promotionBannerUrl: partner.promotionBannerUrl || null,
  promotionIds: Array.isArray(partner.promotionIds) ? partner.promotionIds.map((id) => asString(id)).filter(Boolean) : [],
  city: partner.city || FALLBACK_CITY,
  areas: Array.isArray(partner.areas) ? partner.areas : [],
  specializations: Array.isArray(partner.specializations) ? partner.specializations : [],
  isApproved: Boolean(partner.isApproved),
  createdAt: partner.createdAt,
  updatedAt: partner.updatedAt
});

const mapService = (service) => ({
  id: service.id,
  partnerId: service.partnerId,
  title: service.title,
  description: service.description || "",
  imageUrl: service.imageUrl || null,
  stage: service.stage,
  taskType: service.taskType,
  minPrice: service.minPrice == null ? null : Number(service.minPrice),
  maxPrice: service.maxPrice == null ? null : Number(service.maxPrice),
  currency: service.currency || "RUB",
  city: service.city || FALLBACK_CITY,
  areas: Array.isArray(service.areas) ? service.areas : [],
  isActive: Boolean(service.isActive),
  rating: service.rating == null ? null : Number(service.rating),
  ratingCount: Number.isFinite(service.ratingCount) ? service.ratingCount : 0,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt
});

export async function getPartnerById(partnerId) {
  const fromPrisma = await runWithPrisma(async (prisma) => {
    const ensured = await ensureDemoPartner(prisma, partnerId);
    if (!ensured) return null;
    return ensured;
  });
  if (fromPrisma) return mapPartner(fromPrisma);

  const state = getFallbackState();
  let partner = state.partners.find((item) => item.id === partnerId);
  if (!partner && partnerId === DEFAULT_PARTNER_ID) {
    partner = createFallbackState().partners[0];
    state.partners.push(partner);
  }
  return partner ? mapPartner(partner) : null;
}

export async function listPromotionBannerOverrides() {
  const fromPrisma = await runWithPrisma(async (prisma) => {
    const items = await prisma.partner.findMany({
      where: {
        isApproved: true,
        promotionBannerUrl: { not: null }
      },
      select: {
        id: true,
        name: true,
        promotionBannerUrl: true,
        promotionIds: true,
        updatedAt: true
      },
      orderBy: [{ updatedAt: "desc" }]
    });
    return items
      .map((item) => ({
        partnerId: item.id,
        partnerName: asString(item.name),
        bannerImageUrl: asString(item.promotionBannerUrl),
        promotionIds: Array.isArray(item.promotionIds) ? item.promotionIds.map((id) => asString(id)).filter(Boolean) : [],
        updatedAt: item.updatedAt
      }))
      .filter((item) => item.bannerImageUrl);
  });
  if (fromPrisma) return fromPrisma;

  const state = getFallbackState();
  return state.partners
    .filter((item) => Boolean(item.isApproved))
    .map((item) => ({
      partnerId: item.id,
      partnerName: asString(item.name),
      bannerImageUrl: asString(item.promotionBannerUrl),
      promotionIds: Array.isArray(item.promotionIds) ? item.promotionIds.map((id) => asString(id)).filter(Boolean) : [],
      updatedAt: item.updatedAt
    }))
    .filter((item) => item.bannerImageUrl);
}

export async function updatePartnerById(partnerId, payload) {
  const raw = isObject(payload) ? payload : {};
  const data = {};

  if (raw.name != null) data.name = asString(raw.name);
  if (raw.description != null) data.description = asString(raw.description);
  if (raw.promotionBannerUrl != null) data.promotionBannerUrl = normalizeOptionalBannerUrl(raw.promotionBannerUrl);
  if (raw.promotionIds != null) data.promotionIds = normalizePromotionIds(raw.promotionIds);
  if (raw.city != null) data.city = asString(raw.city);
  if (raw.areas != null) data.areas = parseList(raw.areas);
  if (raw.specializations != null) data.specializations = parseList(raw.specializations);
  if (raw.type != null) {
    const type = normalizePartnerType(raw.type);
    if (!type) throw new Error("INVALID_PARTNER_TYPE");
    data.type = type;
  }

  if (Object.keys(data).length === 0) throw new Error("EMPTY_UPDATE");
  if (data.name != null && !data.name) throw new Error("INVALID_PARTNER_NAME");

  const fromPrisma = await runWithPrisma(async (prisma) => {
    const partner = await ensureDemoPartner(prisma, partnerId);
    if (!partner) return null;
    return prisma.partner.update({
      where: { id: partnerId },
      data
    });
  });
  if (fromPrisma) return mapPartner(fromPrisma);

  const state = getFallbackState();
  const idx = state.partners.findIndex((item) => item.id === partnerId);
  if (idx < 0) return null;
  const current = state.partners[idx];
  const next = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString()
  };
  state.partners[idx] = next;
  return mapPartner(next);
}

export async function listPartnerServices(partnerId) {
  const fromPrisma = await runWithPrisma(async (prisma) => {
    const partner = await ensureDemoPartner(prisma, partnerId);
    if (!partner) return null;
    const items = await prisma.service.findMany({
      where: { partnerId },
      orderBy: [{ createdAt: "desc" }]
    });
    return items.map(mapService);
  });
  if (fromPrisma) return fromPrisma;

  const state = getFallbackState();
  return state.services.filter((item) => item.partnerId === partnerId).map(mapService);
}

export function validateNewServicePayload(payload) {
  const raw = isObject(payload) ? payload : {};
  const stage = normalizeStage(raw.stage);
  const taskType = normalizeTaskType(raw.taskType);
  const title = asString(raw.title);
  if (!title) throw new Error("INVALID_TITLE");
  if (!stage) throw new Error("INVALID_STAGE");
  if (!taskType) throw new Error("INVALID_TASK_TYPE");

  const minPrice = asMaybeNumber(raw.minPrice);
  const maxPrice = asMaybeNumber(raw.maxPrice);
  if (minPrice != null && minPrice < 0) throw new Error("INVALID_MIN_PRICE");
  if (maxPrice != null && maxPrice < 0) throw new Error("INVALID_MAX_PRICE");
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) throw new Error("PRICE_RANGE");

  return {
    title,
    description: asString(raw.description),
    imageUrl: asString(raw.imageUrl) || null,
    stage,
    taskType,
    minPrice,
    maxPrice,
    currency: asString(raw.currency) || "RUB",
    city: asString(raw.city) || FALLBACK_CITY,
    areas: parseList(raw.areas),
    isActive: asMaybeBoolean(raw.isActive) ?? true
  };
}

export function validateServicePatchPayload(payload) {
  const raw = isObject(payload) ? payload : {};
  const data = {};

  if (raw.title != null) {
    data.title = asString(raw.title);
    if (!data.title) throw new Error("INVALID_TITLE");
  }
  if (raw.description != null) data.description = asString(raw.description);
  if (raw.imageUrl != null) data.imageUrl = asString(raw.imageUrl) || null;
  if (raw.stage != null) {
    const stage = normalizeStage(raw.stage);
    if (!stage) throw new Error("INVALID_STAGE");
    data.stage = stage;
  }
  if (raw.taskType != null) {
    const taskType = normalizeTaskType(raw.taskType);
    if (!taskType) throw new Error("INVALID_TASK_TYPE");
    data.taskType = taskType;
  }
  if (raw.minPrice != null) {
    const minPrice = asMaybeNumber(raw.minPrice);
    if (minPrice != null && minPrice < 0) throw new Error("INVALID_MIN_PRICE");
    data.minPrice = minPrice;
  }
  if (raw.maxPrice != null) {
    const maxPrice = asMaybeNumber(raw.maxPrice);
    if (maxPrice != null && maxPrice < 0) throw new Error("INVALID_MAX_PRICE");
    data.maxPrice = maxPrice;
  }
  if ((data.minPrice != null || data.maxPrice != null) && data.minPrice != null && data.maxPrice != null && data.minPrice > data.maxPrice) {
    throw new Error("PRICE_RANGE");
  }
  if (raw.currency != null) data.currency = asString(raw.currency) || "RUB";
  if (raw.city != null) data.city = asString(raw.city) || FALLBACK_CITY;
  if (raw.areas != null) data.areas = parseList(raw.areas);
  if (raw.isActive != null) {
    const isActive = asMaybeBoolean(raw.isActive);
    if (isActive == null) throw new Error("INVALID_ACTIVE");
    data.isActive = isActive;
  }

  if (Object.keys(data).length === 0) throw new Error("EMPTY_UPDATE");
  return data;
}

export async function createPartnerService(partnerId, data) {
  const fromPrisma = await runWithPrisma(async (prisma) => {
    const partner = await ensureDemoPartner(prisma, partnerId);
    if (!partner) return null;
    const created = await prisma.service.create({
      data: {
        partnerId,
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        stage: data.stage,
        taskType: data.taskType,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        currency: data.currency || "RUB",
        city: data.city || FALLBACK_CITY,
        areas: data.areas || [],
        isActive: data.isActive ?? true
      }
    });
    return mapService(created);
  });
  if (fromPrisma) return fromPrisma;

  const state = getFallbackState();
  const exists = state.partners.some((item) => item.id === partnerId);
  if (!exists) return null;

  const created = {
    id: `demo-service-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    partnerId,
    title: data.title,
    description: data.description || "",
    imageUrl: data.imageUrl || null,
    stage: data.stage,
    taskType: data.taskType,
    minPrice: data.minPrice,
    maxPrice: data.maxPrice,
    currency: data.currency || "RUB",
    city: data.city || FALLBACK_CITY,
    areas: data.areas || [],
    isActive: data.isActive ?? true,
    rating: null,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  state.services.push(created);
  return mapService(created);
}

export async function patchPartnerService(partnerId, serviceId, data) {
  const fromPrisma = await runWithPrisma(async (prisma) => {
    const existing = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, partnerId: true }
    });
    if (!existing) return { status: "not_found" };
    if (existing.partnerId !== partnerId) return { status: "forbidden" };
    const updated = await prisma.service.update({
      where: { id: serviceId },
      data
    });
    return { status: "ok", item: mapService(updated) };
  });
  if (fromPrisma) return fromPrisma;

  const state = getFallbackState();
  const idx = state.services.findIndex((item) => item.id === serviceId);
  if (idx < 0) return { status: "not_found" };
  if (state.services[idx].partnerId !== partnerId) return { status: "forbidden" };
  const updated = {
    ...state.services[idx],
    ...data,
    updatedAt: new Date().toISOString()
  };
  state.services[idx] = updated;
  return { status: "ok", item: mapService(updated) };
}

export async function parseJsonBody(req) {
  if (!req || req.body == null) return {};
  if (typeof req.body === "string") {
    const text = req.body.trim();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("INVALID_JSON");
    }
  }
  if (isObject(req.body)) return req.body;
  return {};
}
