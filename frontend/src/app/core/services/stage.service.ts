import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStageRequest, Stage, UpdateStageRequest } from '../models/stage.model';

@Injectable({ providedIn: 'root' })
export class StageService {
  private readonly base = `${environment.apiUrl}/admin/stages`;

  constructor(private readonly http: HttpClient) {}

  getAll(zoneId?: number | null): Observable<Stage[]> {
    return this.http.get<Stage[]>(this.base, {
      params: zoneId ? { zoneId } : {},
    });
  }

  getById(id: number): Observable<Stage> {
    return this.http.get<Stage>(`${this.base}/${id}`);
  }

  create(payload: CreateStageRequest): Observable<Stage> {
    return this.http.post<Stage>(this.base, payload);
  }

  update(id: number, payload: UpdateStageRequest): Observable<Stage> {
    return this.http.put<Stage>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
