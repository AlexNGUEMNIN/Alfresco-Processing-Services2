import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Process, ProcessFilter, ProcessStatistics } from '../models/process.model';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  // Mock data - would be replaced with actual API calls
  private mockProcesses: Process[] = [
    {
      id: 'PROC-001',
      name: 'Customer Onboarding',
      type: 'Customer',
      status: 'active',
      startDate: new Date('2025-04-10T08:30:00'),
      lastActivity: new Date('2025-04-12T14:45:00')
    },
    {
      id: 'PROC-002',
      name: 'Loan Application',
      type: 'Loan',
      status: 'abandoned',
      startDate: new Date('2025-04-05T10:15:00'),
      lastActivity: new Date('2025-04-07T11:20:00')
    },
    {
      id: 'PROC-003',
      name: 'Account Opening',
      type: 'Account',
      status: 'terminated',
      startDate: new Date('2025-04-01T09:00:00'),
      lastActivity: new Date('2025-04-02T16:30:00')
    },
    {
      id: 'PROC-004',
      name: 'Credit Card Application',
      type: 'Card',
      status: 'abandoned',
      startDate: new Date('2025-04-08T13:45:00'),
      lastActivity: new Date('2025-04-09T09:10:00')
    },
    {
      id: 'PROC-005',
      name: 'Mortgage Processing',
      type: 'Loan',
      status: 'active',
      startDate: new Date('2025-04-11T11:00:00'),
      lastActivity: new Date('2025-04-12T10:30:00')
    }
  ];

  private mockStatistics: ProcessStatistics = {
    active: 25,
    abandoned: 12,
    terminated: 45,
    total: 82,
    abandonedTrend: [
      { date: new Date('2025-04-06'), value: 8 },
      { date: new Date('2025-04-07'), value: 9 },
      { date: new Date('2025-04-08'), value: 7 },
      { date: new Date('2025-04-09'), value: 10 },
      { date: new Date('2025-04-10'), value: 12 },
      { date: new Date('2025-04-11'), value: 11 },
      { date: new Date('2025-04-12'), value: 12 }
    ]
  };

  constructor() { }

  getProcesses(filter?: ProcessFilter): Observable<Process[]> {
    let filteredProcesses = [...this.mockProcesses];
    
    if (filter) {
      if (filter.status) {
        filteredProcesses = filteredProcesses.filter(p => p.status === filter.status);
      }
      
      if (filter.type) {
        filteredProcesses = filteredProcesses.filter(p => p.type === filter.type);
      }
      
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        filteredProcesses = filteredProcesses.filter(p => 
          p.name.toLowerCase().includes(searchTerm) || 
          p.id.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filter.dateRange) {
        filteredProcesses = filteredProcesses.filter(p => 
          p.startDate >= filter.dateRange!.start && 
          p.startDate <= filter.dateRange!.end
        );
      }
    }
    
    // Simulate API delay
    return of(filteredProcesses).pipe(delay(300));
  }

  getProcessById(id: string): Observable<Process | undefined> {
    const process = this.mockProcesses.find(p => p.id === id);
    return of(process).pipe(delay(200));
  }

  getProcessStatistics(): Observable<ProcessStatistics> {
    return of(this.mockStatistics).pipe(delay(500));
  }

  restartProcess(id: string): Observable<boolean> {
    // This would call the API to restart a process
    return of(true).pipe(delay(800));
  }

  terminateProcess(id: string): Observable<boolean> {
    // This would call the API to terminate a process
    return of(true).pipe(delay(800));
  }
}