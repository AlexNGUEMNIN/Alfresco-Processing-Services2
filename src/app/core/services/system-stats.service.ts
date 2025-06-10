import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SystemStats, ProcessStatusCount } from '../models/system-stats.model';

@Injectable({
  providedIn: 'root'
})
export class SystemStatsService {
  
  private mockStats: SystemStats = {
    activeProcesses: 1245,
    pendingProcesses: 87,
    completedProcesses: 2934,
    stoppedProcesses: 156,
    abandonedProcesses: 87,
    totalProcesses: 4509,
    systemUptime: '15 jours 8h 32min',
    lastUpdate: new Date()
  };

  constructor() { }

  getSystemStats(): Observable<SystemStats> {
    return of(this.mockStats).pipe(delay(300));
  }

  getProcessStatusCounts(): Observable<ProcessStatusCount[]> {
    const total = this.mockStats.totalProcesses;
    
    const statusCounts: ProcessStatusCount[] = [
      {
        status: 'Actifs',
        count: this.mockStats.activeProcesses,
        percentage: Math.round((this.mockStats.activeProcesses / total) * 100),
        color: '#22C55E'
      },
      {
        status: 'En attente',
        count: this.mockStats.pendingProcesses,
        percentage: Math.round((this.mockStats.pendingProcesses / total) * 100),
        color: '#F59E0B'
      },
      {
        status: 'Terminés',
        count: this.mockStats.completedProcesses,
        percentage: Math.round((this.mockStats.completedProcesses / total) * 100),
        color: '#3B82F6'
      },
      {
        status: 'Arrêtés',
        count: this.mockStats.stoppedProcesses,
        percentage: Math.round((this.mockStats.stoppedProcesses / total) * 100),
        color: '#6B7280'
      },
      {
        status: 'Abandonnés',
        count: this.mockStats.abandonedProcesses,
        percentage: Math.round((this.mockStats.abandonedProcesses / total) * 100),
        color: '#DC2626'
      }
    ];

    return of(statusCounts).pipe(delay(300));
  }

  refreshStats(): Observable<SystemStats> {
    // Simuler une mise à jour des statistiques
    this.mockStats.lastUpdate = new Date();
    return this.getSystemStats();
  }
}