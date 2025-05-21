import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatusCardComponent } from '../shared/components/status-card/status-card.component';
import { ProcessService } from '../core/services/process.service';
import { DatabaseService } from '../core/services/database.service';
import { ProcessStatistics } from '../core/models/process.model';
import { DatabaseMetric } from '../core/models/database.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  processStats: ProcessStatistics | null = null;
  dbMetrics: DatabaseMetric[] = [];
  loading = true;

  constructor(
    private processService: ProcessService,
    private dbService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.processService.getProcessStatistics().subscribe(stats => {
      this.processStats = stats;
      this.loading = false;
    });
    
    this.dbService.getMetrics().subscribe(metrics => {
      this.dbMetrics = metrics;
    });
  }

  analyzeAbandonedProcesses(): void {
    // Navigate to analysis page with filters set
  }

  refreshData(): void {
    this.loadData();
  }
}