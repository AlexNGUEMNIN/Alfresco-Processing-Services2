import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ProcessNotification } from '../../../core/services/notification.service';
import { TaskService } from '../../../core/services/task.service';
import { TaskNotification } from '../../../core/models/task.model';
import { combineLatest } from 'rxjs';

interface CombinedNotification {
  id: string;
  type: 'process' | 'task';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  status: string;
  read: boolean;
  data: ProcessNotification | TaskNotification;
}

@Component({
  selector: 'app-notifications-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-modal.component.html',
  styleUrls: ['./notifications-modal.component.scss']
})
export class NotificationsModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  notifications: CombinedNotification[] = [];
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  trackByNotificationId(index: number, notification: CombinedNotification): any {
    return notification.id;
  }

  loadNotifications(): void {
    this.loading = true;
    
    combineLatest([
      this.notificationService.getNotifications(),
      this.taskService.getNotifications()
    ]).subscribe(([processNotifications, taskNotifications]) => {
      const combined: CombinedNotification[] = [
        ...processNotifications.map(notif => ({
          id: notif.id,
          type: 'process' as const,
          title: notif.processName,
          description: notif.description,
          timestamp: notif.startTime,
          priority: notif.priority,
          status: notif.status,
          read: false,
          data: notif
        })),
        ...taskNotifications.map(notif => ({
          id: notif.id,
          type: 'task' as const,
          title: 'Transfert de tâche',
          description: notif.message,
          timestamp: notif.timestamp,
          priority: 'medium' as const,
          status: 'transferred',
          read: notif.read,
          data: notif
        }))
      ];

      // Trier par timestamp décroissant
      this.notifications = combined.sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      );
      
      this.loading = false;
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getStatusIcon(notification: CombinedNotification): string {
    if (notification.type === 'task') {
      return 'swap_horiz';
    }
    
    switch (notification.status) {
      case 'running': return 'play_circle';
      case 'pending': return 'schedule';
      case 'waiting': return 'hourglass_empty';
      default: return 'info';
    }
  }

  getStatusClass(notification: CombinedNotification): string {
    if (notification.type === 'task') {
      return 'status-transferred';
    }
    
    switch (notification.status) {
      case 'running': return 'status-running';
      case 'pending': return 'status-pending';
      case 'waiting': return 'status-waiting';
      default: return 'status-default';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-default';
    }
  }

  formatDuration(startTime: Date): string {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Il y a ${hours}h ${minutes}min`;
    }
    return `Il y a ${minutes}min`;
  }

  formatEstimatedTime(estimatedTime?: Date): string {
    if (!estimatedTime) return 'Non défini';
    
    const now = new Date();
    const diff = estimatedTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Bientôt terminé';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `~${hours}h ${minutes}min`;
    }
    return `~${minutes}min`;
  }

  markAsRead(notification: CombinedNotification): void {
    if (notification.type === 'task') {
      this.taskService.markNotificationAsRead(notification.id);
    } else {
      this.notificationService.markAsRead(notification.id);
    }
    
    // Mettre à jour localement
    notification.read = true;
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }
}