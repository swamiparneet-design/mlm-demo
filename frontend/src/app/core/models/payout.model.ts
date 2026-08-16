export type PayoutStatus = 'Pending' | 'Completed' | 'Failed';

export interface PayoutTransaction {
  id: number;
  userId: number;
  userFullName: string;
  zoneId: number;
  zoneName: string;
  stageId: number;
  stageName: string;
  grossAmount: number;
  retentionAmount: number;
  netPayoutAmount: number;
  status: PayoutStatus;
  createdAt: string;
}
