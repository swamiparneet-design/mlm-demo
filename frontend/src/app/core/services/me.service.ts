import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayoutTransaction } from '../models/payout.model';
import { AppUser, PlacementTreeNode, UserReferral, UserZoneProgress } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class MeService {
  private readonly base = `${environment.apiUrl}/me`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.base}/profile`);
  }

  updateProfile(payload: Partial<Pick<AppUser, 'fullName' | 'mobile'>>): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.base}/profile`, payload);
  }

  getZoneProgress(): Observable<UserZoneProgress[]> {
    return this.http.get<UserZoneProgress[]>(`${this.base}/progress`);
  }

  getPlacementTree(zoneId: number): Observable<PlacementTreeNode | null> {
    return this.http.get<PlacementTreeNode | null>(`${this.base}/placement-tree`, {
      params: { zoneId },
    });
  }

  getReferrals(): Observable<UserReferral[]> {
    return this.http.get<UserReferral[]>(`${this.base}/referrals`);
  }

  getPayoutHistory(): Observable<PayoutTransaction[]> {
    return this.http.get<PayoutTransaction[]>(`${this.base}/payouts`);
  }
}
