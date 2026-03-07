import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type {
  CreatePartnerInput,
  CreateServiceInput,
  PaginationInput,
  PublicCatalogResult,
  ServiceFilter
} from "./types.js";

export async function createPartner(input: CreatePartnerInput) {
  return prisma.partner.create({
    data: {
      type: input.type,
      name: input.name,
      description: input.description,
      promotionBannerUrl: input.promotionBannerUrl,
      promotionIds: input.promotionIds ?? [],
      city: input.city ?? "Краснодар",
      areas: input.areas ?? [],
      specializations: input.specializations ?? [],
      isApproved: input.isApproved ?? false,
    },
  });
}

export async function addServiceToPartner(partnerId: string, input: CreateServiceInput) {
  return prisma.service.create({
    data: {
      partnerId,
      title: input.title,
      description: input.description,
      stage: input.stage,
      taskType: input.taskType,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      currency: input.currency ?? "RUB",
      city: input.city ?? "Краснодар",
      areas: input.areas ?? [],
      isActive: input.isActive ?? true,
    },
  });
}

function buildPriceRangeFilter(filter: ServiceFilter): Prisma.ServiceWhereInput | null {
  const { minPrice, maxPrice } = filter;

  if (typeof minPrice !== "number" && typeof maxPrice !== "number") {
    return null;
  }

  if (typeof minPrice === "number" && typeof maxPrice === "number") {
    return {
      AND: [
        { OR: [{ minPrice: null }, { minPrice: { lte: maxPrice } }] },
        { OR: [{ maxPrice: null }, { maxPrice: { gte: minPrice } }] },
      ],
    };
  }

  if (typeof minPrice === "number") {
    return {
      OR: [{ maxPrice: null }, { maxPrice: { gte: minPrice } }],
    };
  }

  return {
    OR: [{ minPrice: null }, { minPrice: { lte: maxPrice as number } }],
  };
}

function buildServiceWhere(filter: ServiceFilter): Prisma.ServiceWhereInput {
  const where: Prisma.ServiceWhereInput = {};

  if (filter.stage) where.stage = filter.stage;
  if (filter.city) where.city = filter.city;
  if (filter.taskType) where.taskType = filter.taskType;
  if (filter.area) where.areas = { has: filter.area };

  const priceFilter = buildPriceRangeFilter(filter);
  if (priceFilter) where.AND = [priceFilter];

  return where;
}

function normalizePagination(input: PaginationInput = {}) {
  const toPositiveInt = (value: number | undefined, fallback: number) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    return Math.max(1, Math.floor(value));
  };
  const toNonNegativeInt = (value: number | undefined, fallback: number) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    return Math.max(0, Math.floor(value));
  };

  const pageSize = toPositiveInt(input.pageSize ?? input.limit, 12);
  const page = input.page ? toPositiveInt(input.page, 1) : undefined;
  const limit = Math.min(pageSize, 100);
  const offset = page ? (page - 1) * limit : toNonNegativeInt(input.offset, 0);

  return { limit, offset };
}

export async function findServicesByFilter(filter: ServiceFilter = {}) {
  const where = buildServiceWhere(filter);

  return prisma.service.findMany({
    where,
    include: {
      partner: true,
    },
    orderBy: [{ rating: "desc" }, { ratingCount: "desc" }, { createdAt: "desc" }],
  });
}

export async function findPublicServices(filter: ServiceFilter = {}, pagination: PaginationInput = {}): Promise<PublicCatalogResult> {
  const where: Prisma.ServiceWhereInput = {
    ...buildServiceWhere(filter),
    isActive: true,
    partner: { isApproved: true },
  };
  const { limit, offset } = normalizePagination(pagination);

  const [total, items] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
          },
        },
      },
      orderBy: [{ rating: "desc" }, { ratingCount: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return { total, items };
}
