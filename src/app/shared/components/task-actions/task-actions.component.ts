import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProcessData } from "../../../core/services/process.service";

@Component({
  selector: "app-task-actions",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./task-actions.component.html",
  styleUrls: ["./task-actions.component.scss"],
})
export class TaskActionsComponent {
  @Input() processData: ProcessData | null = null;
  @Output() stopProcess = new EventEmitter<{
    processInstanceId: string;
    isSuspended: boolean;
  }>();
  @Output() transferTask = new EventEmitter<ProcessData>();
  @Output() terminateProcess = new EventEmitter<any>();

  loading = false;

  get isSuspended(): boolean {
    return this.processData?.suspensionState === 2;
  }

  onStopProcess(): void {
    if (this.processData) {
      this.loading = true;
      this.stopProcess.emit({
        processInstanceId: this.processData.processInstanceId,
        isSuspended: this.isSuspended,
      });
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

  onTerminateProcess() {
    if (this.processData) {
      this.terminateProcess.emit({
        processInstanceId: this.processData.processInstanceId,
      });
    }
  }
}
