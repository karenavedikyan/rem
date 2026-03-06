import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { CreatePartnerInput, CreateServiceInput, ServiceFilter } from "./types.js";

export async function createPartner(input: CreatePartnerInput) {
  return prisma.partner.create({
    data: {
      type: input.type,
      name: input.name,
      description: input.description,
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

export async function findServicesByFilter(filter: ServiceFilter = {}) {
  const where: Prisma.ServiceWhereInput = {};

  if (filter.stage) where.stage = filter.stage;
  if (filter.city) where.city = filter.city;
  if (filter.taskType) where.taskType = filter.taskType;
  if (filter.area) where.areas = { has: filter.area };

  const priceFilter = buildPriceRangeFilter(filter);
  if (priceFilter) {
    where.AND = [priceFilter];
  }

  return prisma.service.findMany({
    where,
    include: {
      partner: true,
    },
    orderBy: [{ rating: "desc" }, { ratingCount: "desc" }, { createdAt: "desc" }],
  });
}
