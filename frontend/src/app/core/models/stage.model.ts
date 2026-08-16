export interface Stage {
  id: number;
  zoneId: number;
  stageName: string;
  sequenceOrder: number;
  requiredPlacementCount: number;
  requiredReferralCount: number;
  payoutAmount: number;
  retentionPercentage: number;
  itemReward: string | null;
  isActive: boolean;
}

export interface CreateStageRequest {
  zoneId: number;
  stageName: string;
  sequenceOrder: number;
  requiredPlacementCount: number;
  requiredReferralCount: number;
  payoutAmount: number;
  retentionPercentage: number;
  itemReward: string | null;
  isActive: boolean;
}

export interface UpdateStageRequest {
  stageName: string;
  sequenceOrder: number;
  requiredPlacementCount: number;
  requiredReferralCount: number;
  payoutAmount: number;
  retentionPercentage: number;
  itemReward: string | null;
  isActive: boolean;
}
