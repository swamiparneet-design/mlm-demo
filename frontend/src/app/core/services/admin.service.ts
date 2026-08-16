import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../models/dashboard.model';
import { PayoutTransaction } from '../models/payout.model';
import { AdminUserSummary, PlacementTreeNode } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private readonly http: HttpClient) {}

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard`);
  }

  getAllUsers(): Observable<AdminUserSummary[]> {
    return this.http.get<AdminUserSummary[]>(`${this.base}/users`);
  }

  getUserPlacementTree(userId: number, zoneId: number): Observable<PlacementTreeNode | null> {
    return this.http.get<PlacementTreeNode | null>(`${this.base}/users/${userId}/placement-tree`, {
      params: { zoneId },
    });
  }

  getAllPayouts(): Observable<PayoutTransaction[]> {
    return this.http.get<PayoutTransaction[]>(`${this.base}/payouts`);
  }
}
