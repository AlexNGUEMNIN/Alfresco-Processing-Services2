import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ProcessNotification {
  id: string;
  processName: string;
  status: 'running' | 'pending' | 'waiting';
  startTime: Date;
  estimatedCompletion?: Date;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<ProcessNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // Mock data pour les processus en cours
  private mockNotifications: ProcessNotification[] = [
    {
      id: 'PROC-001',
      processName: 'Validation KYC Client',
      status: 'running',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000), // 30min from now
      priority: 'high',
      description: 'Validation des documents client en cours'
    },
    {
      id: 'PROC-002',
      processName: 'Traitement Prêt Personnel',
      status: 'pending',
      startTime: new Date(Date.now() - 45 * 60 * 1000), // 45min ago
      priority: 'medium',
      description: 'En attente de validation manager'
    },
    {
      id: 'PROC-003',
      processName: 'Ouverture Compte Épargne',
      status: 'running',
      startTime: new Date(Date.now() - 15 * 60 * 1000), // 15min ago
      estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000), // 10min from now
      priority: 'low',
      description: 'Création du compte en cours'
    },
    {
      id: 'PROC-004',
      processName: 'Virement International',
      status: 'waiting',
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
      priority: 'high',
      description: 'En attente de confirmation SWIFT'
    },
    {
      id: 'PROC-005',
      processName: 'Demande Carte Crédit',
      status: 'running',
      startTime: new Date(Date.now() - 90 * 60 * 1000), // 1h30 ago
      estimatedCompletion: new Date(Date.now() + 45 * 60 * 1000), // 45min from now
      priority: 'medium',
      description: 'Analyse de solvabilité en cours'
    }
  ];

  constructor() {
    this.notificationsSubject.next(this.mockNotifications);
  }

  getNotifications(): Observable<ProcessNotification[]> {
    return of(this.mockNotifications).pipe(delay(300));
  }

  getNotificationCount(): Observable<number> {
    return of(this.mockNotifications.length);
  }

  markAsRead(notificationId: string): void {
    // Logique pour marquer comme lu
    console.log(`Notification ${notificationId} marked as read`);
  }

  refreshNotifications(): void {
    // Simuler un refresh des données
    this.notificationsSubject.next([...this.mockNotifications]);
  }
}