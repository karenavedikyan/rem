import type { PartnerType, ServiceStage, ServiceTaskType } from "@prisma/client";

export interface ServiceFilter {
  stage?: ServiceStage;
  city?: string;
  area?: string;
  taskType?: ServiceTaskType;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreatePartnerInput {
  type: PartnerType;
  name: string;
  description?: string;
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
