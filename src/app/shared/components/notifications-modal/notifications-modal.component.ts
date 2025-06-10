import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ProcessNotification } from '../../../core/services/notification.service';

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

  notifications: ProcessNotification[] = [];
  loading = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'running': return 'play_circle';
      case 'pending': return 'schedule';
      case 'waiting': return 'hourglass_empty';
      default: return 'info';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
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
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
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

  markAsRead(notification: ProcessNotification): void {
    this.notificationService.markAsRead(notification.id);
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }
}