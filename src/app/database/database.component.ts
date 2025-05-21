import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../core/services/database.service';
import { DatabaseTable, SlowQuery } from '../core/models/database.model';

@Component({
  selector: 'app-database',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit {
  tables: DatabaseTable[] = [];
  slowQueries: SlowQuery[] = [];
  loading = true;
  optimizingTable: string | null = null;

  constructor(private dbService: DatabaseService) {}

  ngOnInit(): void {
    this.loadDatabaseData();
  }

  loadDatabaseData(): void {
    this.loading = true;
    
    this.dbService.getTables().subscribe(tables => {
      this.tables = tables;
      this.loading = false;
    });
    
    this.dbService.getSlowQueries().subscribe(queries => {
      this.slowQueries = queries;
    });
  }

  optimizeTable(tableName: string): void {
    this.optimizingTable = tableName;
    
    this.dbService.optimizeTable(tableName).subscribe(success => {
      if (success) {
        // Refresh data after optimization
        this.loadDatabaseData();
      }
      this.optimizingTable = null;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'normal': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'critical': return 'badge-error';
      default: return '';
    }
  }
}