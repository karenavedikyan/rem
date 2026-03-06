import { SEED_SERVICES } from "./seed-services.js";

const ALLOWED_ORIGINS = [
  "https://karenavedikyan.github.io",
  "https://rem-navy.vercel.app",
  "https://rem.vercel.app",
  "https://remcard.ru",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
];

const STAGES = new Set(["PLANNING", "ROUGH", "ENGINEERING", "FINISHING", "FURNITURE"]);
const TASK_TYPES = new Set([
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

const DEFAULT_CITY = "Краснодар";

const corsHeaders = (origin) => {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  return {
    "Access-Control-Allow-Origin": allowed || "*",
    "Access-Control-Allow-Methods": "OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
};

const asString = (value) => (value == null ? "" : String(value).trim());
const asOptionalNumber = (value) => {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const asPositiveInt = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
};

const asNonNegativeInt = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
};

const normalizeFilter = (query = {}) => {
  const stage = asString(query.stage).toUpperCase();
  const taskType = asString(query.taskType).toUpperCase();
  return {
    stage: STAGES.has(stage) ? stage : undefined,
    city: asString(query.city) || DEFAULT_CITY,
    area: asString(query.area) || undefined,
    taskType: TASK_TYPES.has(taskType) ? taskType : undefined,
    minPrice: asOptionalNumber(query.minPrice),
    maxPrice: asOptionalNumber(query.maxPrice)
  };
};

const normalizePagination = (query = {}) => {
  const page = query.page ? asPositiveInt(query.page, 1) : undefined;
  const pageSize = asPositiveInt(query.pageSize ?? query.limit, 12);
  const limit = Math.min(pageSize, 100);
  const offset = page ? (page - 1) * limit : asNonNegativeInt(query.offset, 0);
  return { limit, offset };
};

const intersectsPriceRange = (item, minPrice, maxPrice) => {
  if (typeof minPrice !== "number" && typeof maxPrice !== "number") return true;
  if (typeof minPrice === "number" && typeof maxPrice === "number") {
    return (item.minPrice == null || item.minPrice <= maxPrice) && (item.maxPrice == null || item.maxPrice >= minPrice);
  }
  if (typeof minPrice === "number") return item.maxPrice == null || item.maxPrice >= minPrice;
  return item.minPrice == null || item.minPrice <= maxPrice;
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

const mapItem = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description ?? null,
  stage: item.stage,
  taskType: item.taskType,
  minPrice: item.minPrice ?? null,
  maxPrice: item.maxPrice ?? null,
  city: item.city,
  areas: Array.isArray(item.areas) ? item.areas : [],
  rating: item.rating ?? null,
  ratingCount: Number.isFinite(item.ratingCount) ? item.ratingCount : 0,
  partner: {
    id: item.partner.id,
    name: item.partner.name,
    type: item.partner.type,
    city: item.partner.city
  }
});

const buildPrismaWhere = (filter) => {
  const where = {
    isActive: true,
    partner: { isApproved: true }
  };

  if (filter.stage) where.stage = filter.stage;
  if (filter.city) where.city = filter.city;
  if (filter.taskType) where.taskType = filter.taskType;
  if (filter.area) where.areas = { has: filter.area };

  if (typeof filter.minPrice === "number" || typeof filter.maxPrice === "number") {
    if (typeof filter.minPrice === "number" && typeof filter.maxPrice === "number") {
      where.AND = [
        { OR: [{ minPrice: null }, { minPrice: { lte: filter.maxPrice } }] },
        { OR: [{ maxPrice: null }, { maxPrice: { gte: filter.minPrice } }] }
      ];
    } else if (typeof filter.minPrice === "number") {
      where.AND = [{ OR: [{ maxPrice: null }, { maxPrice: { gte: filter.minPrice } }] }];
    } else {
      where.AND = [{ OR: [{ minPrice: null }, { minPrice: { lte: filter.maxPrice } }] }];
    }
  }

  return where;
};

async function loadPrismaClientCtor() {
  const specs = ["@prisma/client", new URL("../../backend/node_modules/@prisma/client/index.js", import.meta.url).href];
  for (const spec of specs) {
    try {
      const mod = await import(spec);
      if (mod && mod.PrismaClient) return mod.PrismaClient;
      if (mod && mod.default && mod.default.PrismaClient) return mod.default.PrismaClient;
    } catch {
      // keep trying
    }
  }
  return null;
}

async function fetchFromPrisma(filter, pagination) {
  if (!process.env.DATABASE_URL) return null;
  const PrismaClient = await loadPrismaClientCtor();
  if (!PrismaClient) return null;

  const prisma = new PrismaClient();
  try {
    const where = buildPrismaWhere(filter);
    const [total, items] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        include: {
          partner: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true
            }
          }
        },
        orderBy: [{ rating: "desc" }, { ratingCount: "desc" }, { createdAt: "desc" }]
      })
    ]);
    return { total, items: items.map(mapItem) };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

function fetchFromSeed(filter, pagination) {
  const filtered = SEED_SERVICES.filter((item) => {
    if (!item.isActive) return false;
    if (!item.partner || !item.partner.isApproved) return false;
    if (filter.stage && item.stage !== filter.stage) return false;
    if (filter.city && item.city !== filter.city) return false;
    if (filter.taskType && item.taskType !== filter.taskType) return false;
    if (filter.area && (!Array.isArray(item.areas) || !item.areas.includes(filter.area))) return false;
    if (!intersectsPriceRange(item, filter.minPrice, filter.maxPrice)) return false;
    return true;
  });

  const ordered = filtered.slice().sort((a, b) => {
    const ratingA = typeof a.rating === "number" ? a.rating : -1;
    const ratingB = typeof b.rating === "number" ? b.rating : -1;
    if (ratingA !== ratingB) return ratingB - ratingA;
    return (b.ratingCount || 0) - (a.ratingCount || 0);
  });

  const paged = ordered.slice(pagination.offset, pagination.offset + pagination.limit);
  return {
    total: ordered.length,
    items: paged.map(mapItem)
  };
}

export default async function handler(req, res) {
  const origin = getOrigin(req);
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };
  res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", headers["Access-Control-Allow-Methods"]);
    res.setHeader("Access-Control-Allow-Headers", headers["Access-Control-Allow-Headers"]);
    res.setHeader("Access-Control-Max-Age", headers["Access-Control-Max-Age"]);
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  const filter = normalizeFilter(req.query || {});
  const pagination = normalizePagination(req.query || {});

  try {
    const fromDb = await fetchFromPrisma(filter, pagination);
    if (fromDb) {
      res.status(200).json(fromDb);
      return;
    }

    res.status(200).json(fetchFromSeed(filter, pagination));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Catalog services API error:", err);
    res.status(500).json({
      error: "Ошибка каталога",
      message: err instanceof Error ? err.message : "Неизвестная ошибка"
    });
  }
}
