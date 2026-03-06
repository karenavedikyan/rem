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
const TASK_TYPES = new Set(["SANUZEL", "KITCHEN", "ELECTRICAL", "PLUMBING", "TILING", "PAINTING", "FLOORING", "WINDOWS", "DESIGN", "GENERAL"]);

const DEFAULT_CITY = "Краснодар";
const MAX_REVIEW_COMMENT = 1000;

const SEEDED_REVIEWS = [];

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

const clone = (v) => JSON.parse(JSON.stringify(v));

const mapService = (item) => ({
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

const mapReview = (item) => ({
  id: item.id,
  serviceId: item.serviceId,
  rating: Number(item.rating),
  comment: item.comment ?? "",
  authorName: item.authorName ?? "",
  createdAt: item.createdAt
});

function getOrigin(req) {
  const origin = req.headers.origin;
  if (origin) return origin;
  const referer = req.headers.referer || "";
  try {
    return new URL(referer).origin;
  } catch {
    return "";
  }
}

export function setCatalogCors(req, res, methods = "OPTIONS, GET, POST") {
  const origin = getOrigin(req);
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  res.setHeader("Access-Control-Allow-Origin", allowed || "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Content-Type", "application/json");
}

export function handleOptions(req, res, methods) {
  if (req.method !== "OPTIONS") return false;
  setCatalogCors(req, res, methods);
  res.status(204).end();
  return true;
}

export function normalizeCatalogFilter(query = {}) {
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
}

export function normalizePagination(query = {}, defaults = { size: 12 }) {
  const page = query.page ? asPositiveInt(query.page, 1) : undefined;
  const pageSize = asPositiveInt(query.pageSize ?? query.limit, defaults.size);
  const limit = Math.min(pageSize, 100);
  const offset = page ? (page - 1) * limit : asNonNegativeInt(query.offset, 0);
  return { limit, offset };
}

function intersectsPriceRange(item, minPrice, maxPrice) {
  if (typeof minPrice !== "number" && typeof maxPrice !== "number") return true;
  if (typeof minPrice === "number" && typeof maxPrice === "number") {
    return (item.minPrice == null || item.minPrice <= maxPrice) && (item.maxPrice == null || item.maxPrice >= minPrice);
  }
  if (typeof minPrice === "number") return item.maxPrice == null || item.maxPrice >= minPrice;
  return item.minPrice == null || item.minPrice <= maxPrice;
}

function createFallbackState() {
  return {
    services: clone(SEED_SERVICES),
    reviews: clone(SEEDED_REVIEWS)
  };
}

function getFallbackState() {
  if (!globalThis.__remcardCatalogState) {
    globalThis.__remcardCatalogState = createFallbackState();
  }
  return globalThis.__remcardCatalogState;
}

let prismaCtorPromise = null;
async function loadPrismaClientCtor() {
  if (!prismaCtorPromise) {
    prismaCtorPromise = (async () => {
      const specs = ["@prisma/client", new URL("../../backend/node_modules/@prisma/client/index.js", import.meta.url).href];
      for (const spec of specs) {
        try {
          const mod = await import(spec);
          if (mod && mod.PrismaClient) return mod.PrismaClient;
          if (mod && mod.default && mod.default.PrismaClient) return mod.default.PrismaClient;
        } catch {
          // try next
        }
      }
      return null;
    })();
  }
  return prismaCtorPromise;
}

async function runWithPrisma(work) {
  if (!process.env.DATABASE_URL) return null;
  const PrismaClient = await loadPrismaClientCtor();
  if (!PrismaClient) return null;
  const prisma = new PrismaClient();
  try {
    return await work(prisma);
  } catch (err) {
    console.warn("Catalog Prisma fallback:", err);
    return null;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

function buildPrismaWhere(filter) {
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
}

export async function listCatalogServices(filter, pagination) {
  const fromDb = await runWithPrisma(async (prisma) => {
    const where = buildPrismaWhere(filter);
    const [total, items] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        include: {
          partner: {
            select: { id: true, name: true, type: true, city: true }
          }
        },
        orderBy: [{ rating: "desc" }, { ratingCount: "desc" }, { createdAt: "desc" }]
      })
    ]);
    return { total, items: items.map(mapService) };
  });
  if (fromDb) return fromDb;

  const state = getFallbackState();
  const filtered = state.services.filter((item) => {
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
  return {
    total: ordered.length,
    items: ordered.slice(pagination.offset, pagination.offset + pagination.limit).map(mapService)
  };
}

export async function getCatalogServiceById(serviceId) {
  const id = asString(serviceId);
  if (!id) return null;

  const fromDb = await runWithPrisma(async (prisma) => {
    const item = await prisma.service.findFirst({
      where: {
        id,
        isActive: true,
        partner: { isApproved: true }
      },
      include: {
        partner: {
          select: { id: true, name: true, type: true, city: true }
        }
      }
    });
    return item ? mapService(item) : null;
  });
  if (fromDb) return fromDb;

  const state = getFallbackState();
  const item = state.services.find((s) => s.id === id && s.isActive && s.partner && s.partner.isApproved);
  return item ? mapService(item) : null;
}

export function parseReviewPayload(body = {}) {
  const rating = Number(body.rating);
  const comment = asString(body.comment);
  const authorName = asString(body.authorName);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw new Error("INVALID_RATING");
  if (comment.length > MAX_REVIEW_COMMENT) throw new Error("COMMENT_TOO_LONG");

  return {
    rating: Math.round(rating),
    comment: comment || "",
    authorName: authorName || ""
  };
}

export async function listServiceReviews(serviceId, pagination) {
  const id = asString(serviceId);
  if (!id) return { total: 0, items: [] };

  const fromDb = await runWithPrisma(async (prisma) => {
    if (!prisma.serviceReview || typeof prisma.serviceReview.findMany !== "function") return null;
    const service = await prisma.service.findFirst({
      where: { id, isActive: true, partner: { isApproved: true } },
      select: { id: true }
    });
    if (!service) return { total: 0, items: [] };

    const [total, items] = await Promise.all([
      prisma.serviceReview.count({ where: { serviceId: id } }),
      prisma.serviceReview.findMany({
        where: { serviceId: id },
        orderBy: { createdAt: "desc" },
        skip: pagination.offset,
        take: pagination.limit
      })
    ]);
    return { total, items: items.map(mapReview) };
  });
  if (fromDb) return fromDb;

  const state = getFallbackState();
  const all = state.reviews.filter((r) => r.serviceId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return {
    total: all.length,
    items: all.slice(pagination.offset, pagination.offset + pagination.limit).map(mapReview)
  };
}

export async function addServiceReview(serviceId, payload) {
  const id = asString(serviceId);
  if (!id) throw new Error("INVALID_SERVICE_ID");

  // TODO(review-verification): accept reviews only from completed/verified orders.
  const data = parseReviewPayload(payload);

  const fromDb = await runWithPrisma(async (prisma) => {
    if (!prisma.serviceReview || typeof prisma.serviceReview.create !== "function") return null;

    const service = await prisma.service.findFirst({
      where: { id, isActive: true, partner: { isApproved: true } },
      select: { id: true }
    });
    if (!service) return { status: "not_found" };

    const created = await prisma.serviceReview.create({
      data: {
        serviceId: id,
        rating: data.rating,
        comment: data.comment || null,
        authorName: data.authorName || null
      }
    });

    const agg = await prisma.serviceReview.aggregate({
      where: { serviceId: id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.service.update({
      where: { id },
      data: {
        rating: agg._avg.rating == null ? null : Number(agg._avg.rating),
        ratingCount: agg._count.rating || 0
      }
    });

    return {
      status: "ok",
      review: mapReview(created),
      rating: agg._avg.rating == null ? null : Number(agg._avg.rating),
      ratingCount: agg._count.rating || 0
    };
  });
  if (fromDb) return fromDb;

  const state = getFallbackState();
  const service = state.services.find((s) => s.id === id && s.isActive && s.partner && s.partner.isApproved);
  if (!service) return { status: "not_found" };

  const review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    serviceId: id,
    rating: data.rating,
    comment: data.comment,
    authorName: data.authorName,
    createdAt: new Date().toISOString()
  };
  state.reviews.push(review);
  const currentCount = Number.isFinite(service.ratingCount) ? service.ratingCount : 0;
  const currentRating = typeof service.rating === "number" ? service.rating : 0;
  const nextCount = currentCount + 1;
  const nextRating = Math.round((((currentRating * currentCount + data.rating) / nextCount) * 10)) / 10;
  service.ratingCount = nextCount;
  service.rating = nextRating;

  return {
    status: "ok",
    review: mapReview(review),
    rating: service.rating ?? null,
    ratingCount: service.ratingCount || 0
  };
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
  if (typeof req.body === "object") return req.body || {};
  return {};
}
