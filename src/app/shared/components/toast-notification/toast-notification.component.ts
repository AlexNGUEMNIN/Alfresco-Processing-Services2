import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss']
})
export class ToastNotificationComponent implements OnInit {
  @Input() title = '';
  @Input() message = '';
  @Input() type: ToastType = 'info';
  @Input() duration = 5000;
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isVisible && this.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  getIcon(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  close(): void {
    this.isVisible = false;
    setTimeout(() => {
      this.closed.emit();
    }, 400);
  }
}