import { UserRole } from './auth.model';

export interface AppUser {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  referrerUserId: number | null;
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserSummary {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  isActive: boolean;
  createdAt: string;
  currentZoneId: number | null;
  currentZoneName: string | null;
  currentStageName: string | null;
  teamSize: number;
  totalEarned: number;
}

export interface UserZoneProgress {
  id: number;
  zoneId: number;
  zoneName: string;
  stageId: number;
  stageName: string;
  currentPlacementCount: number;
  requiredPlacementCount: number;
  currentReferralCount: number;
  requiredReferralCount: number;
  payoutAmount: number;
  retentionPercentage: number;
  itemReward: string | null;
  status: 'InProgress' | 'Completed';
  startedAt: string;
  completedAt: string | null;
}

export interface PlacementTreeNode {
  userId: number;
  fullName: string;
  email: string;
  placedAt: string;
  stageName: string | null;
  children: PlacementTreeNode[];
}

export interface UserReferral {
  userId: number;
  fullName: string;
  email: string;
  joinedAt: string;
}
