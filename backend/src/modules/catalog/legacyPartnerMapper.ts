import { PartnerType, ServiceTaskType } from "@prisma/client";
import type { CreatePartnerInput } from "./types.js";

export interface LegacyPartnerPayload {
  name: string;
  category: string;
  address: string;
  description: string;
}

function mapLegacyCategoryToPartnerType(category: string): PartnerType {
  const normalized = category.toLowerCase();

  if (normalized.includes("ип") || normalized.includes("мастер")) return PartnerType.MASTER;
  if (normalized.includes("магазин") || normalized.includes("маркет")) return PartnerType.STORE;
  return PartnerType.COMPANY;
}

export function mapLegacyCategoryToTaskType(category: string): ServiceTaskType {
  const normalized = category.toLowerCase();

  if (normalized.includes("сан")) return ServiceTaskType.PLUMBING;
  if (normalized.includes("элект")) return ServiceTaskType.ELECTRICAL;
  if (normalized.includes("кух")) return ServiceTaskType.KITCHEN;
  if (normalized.includes("плит")) return ServiceTaskType.TILING;
  if (normalized.includes("окн")) return ServiceTaskType.WINDOWS;
  if (normalized.includes("дизайн")) return ServiceTaskType.DESIGN;
  return ServiceTaskType.GENERAL;
}

/**
 * Adapter for the current partners-api payload shape.
 * This allows keeping old /api/add-partner input while starting DB rollout.
 */
export function mapLegacyPartnerPayload(payload: LegacyPartnerPayload): CreatePartnerInput {
  return {
    type: mapLegacyCategoryToPartnerType(payload.category),
    name: payload.name,
    description: payload.description,
    city: "Краснодар",
    areas: [],
    specializations: [payload.category],
    isApproved: false,
  };
}
