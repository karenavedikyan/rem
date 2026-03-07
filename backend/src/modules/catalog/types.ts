import type { PartnerType, ServiceStage, ServiceTaskType } from "@prisma/client";

export interface ServiceFilter {
  stage?: ServiceStage;
  city?: string;
  area?: string;
  taskType?: ServiceTaskType;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationInput {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

export interface PublicCatalogItem {
  id: string;
  title: string;
  description: string | null;
  stage: ServiceStage;
  taskType: ServiceTaskType;
  minPrice: number | null;
  maxPrice: number | null;
  city: string;
  areas: string[];
  rating: number | null;
  ratingCount: number;
  partner: {
    id: string;
    name: string;
    type: PartnerType;
    city: string;
  };
}

export interface PublicCatalogResult {
  items: PublicCatalogItem[];
  total: number;
}

export interface CreatePartnerInput {
  type: PartnerType;
  name: string;
  description?: string;
  promotionBannerUrl?: string;
  promotionIds?: string[];
  city?: string;
  areas?: string[];
  specializations?: string[];
  isApproved?: boolean;
}

export interface CreateServiceInput {
  title: string;
  description?: string;
  stage: ServiceStage;
  taskType: ServiceTaskType;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  city?: string;
  areas?: string[];
  isActive?: boolean;
}
