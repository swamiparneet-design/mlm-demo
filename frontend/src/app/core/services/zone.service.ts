import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateZoneRequest, UpdateZoneRequest, Zone } from '../models/zone.model';

@Injectable({ providedIn: 'root' })
export class ZoneService {
  private readonly base = `${environment.apiUrl}/admin/zones`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.base);
  }

  getById(id: number): Observable<Zone> {
    return this.http.get<Zone>(`${this.base}/${id}`);
  }

  create(payload: CreateZoneRequest): Observable<Zone> {
    return this.http.post<Zone>(this.base, payload);
  }

  update(id: number, payload: UpdateZoneRequest): Observable<Zone> {
    return this.http.put<Zone>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
