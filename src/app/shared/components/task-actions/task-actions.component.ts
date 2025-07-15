import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProcessData } from "../../../core/services/process.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-task-actions",
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
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
  showConfirmDialog = false;
  confirmDialogConfig = {
    title: "",
    message: "",
    confirmText: "Oui",
    cancelText: "Non",
    icon: "help_outline",
    iconColor: "",
    theme: "",
    action: "" as "suspend" | "terminate" | "",
  };

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
      }, 150000);
    }
  }
  confirmSuspendProcess(): void {
    if (!this.isSuspended) {
      this.confirmDialogConfig = {
        title: "Confirmation de suspension",
        message: "Êtes-vous sûr de vouloir suspendre le processus ?",
        confirmText: "Suspendre",
        cancelText: "Annuler",
        icon: "pause_circle",
        iconColor: "#f59e42",
        theme: "",
        action: "suspend",
      };
      this.showConfirmDialog = true;
    } else {
      // Si le processus est déjà suspendu, on exécute directement (reprendre)
      this.onStopProcess();
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

  confirmTerminateProcess() {
    this.confirmDialogConfig = {
      title: "Confirmation d'arrêt",
      message: "Êtes-vous sûr de vouloir arrêter le processus ?",
      confirmText: "Arrêter",
      cancelText: "Annuler",
      icon: "stop_circle",
      iconColor: "#ef4444",
      theme: "danger",
      action: "terminate",
    };
    this.showConfirmDialog = true;
  }

  onConfirmDialogResult(result: boolean) {
    if (result) {
      if (this.confirmDialogConfig.action === "suspend") {
        this.onStopProcess();
      } else if (this.confirmDialogConfig.action === "terminate") {
        this.onTerminateProcess();
      }
    }
    this.showConfirmDialog = false;
    this.confirmDialogConfig.action = "";
  }
}
