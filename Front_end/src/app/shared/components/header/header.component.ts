import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { HelpService } from '../../../core/services/help.service';
import { NotificationsModalComponent } from '../notifications-modal/notifications-modal.component';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationsModalComponent, SettingsModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentDate = new Date();
  notificationCount = 0;
  showNotificationsModal = false;
  showSettingsModal = false;

  constructor(
    private notificationService: NotificationService,
    private helpService: HelpService
  ) {}

  ngOnInit(): void {
    this.loadNotificationCount();
    
    // Mettre à jour la date toutes les minutes
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  loadNotificationCount(): void {
    this.notificationService.getNotificationCount().subscribe(count => {
      this.notificationCount = count;
    });
  }

  onNotificationsClick(): void {
    this.showNotificationsModal = true;
  }

  onHelpClick(): void {
    this.helpService.downloadUserGuide();
  }

  onSettingsClick(): void {
    this.showSettingsModal = true;
  }

  onCloseNotificationsModal(): void {
    this.showNotificationsModal = false;
  }

  onCloseSettingsModal(): void {
    this.showSettingsModal = false;
  }
}