export type PlacementStrategyType = 'Sequential' | 'CapacityBased' | 'BatchFill';

export interface Zone {
  id: number;
  zoneName: string;
  sequenceOrder: number;
  entryAmount: number;
  requiresNewInvestmentIfDirectEntry: boolean;
  placementStrategyType: PlacementStrategyType;
  capacityLimit: number | null;
  isActive: boolean;
}

export interface CreateZoneRequest {
  zoneName: string;
  sequenceOrder: number;
  entryAmount: number;
  requiresNewInvestmentIfDirectEntry: boolean;
  placementStrategyType: PlacementStrategyType;
  capacityLimit: number | null;
  isActive: boolean;
}

export type UpdateZoneRequest = CreateZoneRequest;
