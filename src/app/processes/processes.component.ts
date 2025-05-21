import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Process, ProcessFilter } from '../core/models/process.model';
import { ProcessService } from '../core/services/process.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-processes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss']
})
export class ProcessesComponent implements OnInit {
  processes: Process[] = [];
  filteredProcesses: Process[] = [];
  selectedProcess: Process | null = null;
  loading = true;
  
  filter: ProcessFilter = {};
  
  constructor(private processService: ProcessService) {}

  ngOnInit(): void {
    this.loadProcesses();
  }

  loadProcesses(): void {
    this.loading = true;
    
    this.processService.getProcesses().subscribe(processes => {
      this.processes = processes;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filteredProcesses = [...this.processes];
    
    if (this.filter.status) {
      this.filteredProcesses = this.filteredProcesses.filter(p => p.status === this.filter.status);
    }
    
    if (this.filter.searchTerm) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      this.filteredProcesses = this.filteredProcesses.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.id.toLowerCase().includes(searchTerm)
      );
    }
  }

  clearFilters(): void {
    this.filter = {};
    this.applyFilters();
  }

  selectProcess(process: Process): void {
    this.selectedProcess = process;
  }

  closeProcessDetails(): void {
    this.selectedProcess = null;
  }

  restartProcess(id: string): void {
    this.processService.restartProcess(id).subscribe(success => {
      if (success) {
        // Refresh the process list
        this.loadProcesses();
      }
    });
  }

  terminateProcess(id: string): void {
    this.processService.terminateProcess(id).subscribe(success => {
      if (success) {
        // Refresh the process list
        this.loadProcesses();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'abandoned': return 'badge-error';
      case 'terminated': return 'badge-info';
      default: return '';
    }
  }
}