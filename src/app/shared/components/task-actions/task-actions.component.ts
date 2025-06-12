import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessData } from '../../../core/services/process.service';

@Component({
  selector: 'app-task-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-actions.component.html',
  styleUrls: ['./task-actions.component.scss']
})
export class TaskActionsComponent {
  @Input() processData: ProcessData | null = null;
  @Output() stopProcess = new EventEmitter<string>();
  @Output() transferTask = new EventEmitter<ProcessData>();

  loading = false;

  onStopProcess(): void {
    if (this.processData) {
      this.loading = true;
      this.stopProcess.emit(this.processData.processInstanceId);
      
      // Simuler un délai de traitement
      setTimeout(() => {
        this.loading = false;
      }, 1500);
    }
  }

  onTransferTask(): void {
    if (this.processData) {
      this.transferTask.emit(this.processData);
    }
  }
}