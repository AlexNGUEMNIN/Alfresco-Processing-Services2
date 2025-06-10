import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemStatsService } from '../../../core/services/system-stats.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SystemStats, ProcessStatusCount } from '../../../core/models/system-stats.model';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss']
})
export class SettingsModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  systemStats: SystemStats | null = null;
  processStatusCounts: ProcessStatusCount[] = [];
  loading = true;
  isDarkMode = false;

  constructor(
    private systemStatsService: SystemStatsService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadSystemStats();
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  loadSystemStats(): void {
    this.loading = true;
    
    this.systemStatsService.getSystemStats().subscribe(stats => {
      this.systemStats = stats;
      this.loading = false;
    });

    this.systemStatsService.getProcessStatusCounts().subscribe(counts => {
      this.processStatusCounts = counts;
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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  refreshStats(): void {
    this.loadSystemStats();
  }

  getProgressWidth(percentage: number): string {
    return `${percentage}%`;
  }
}